import {
  aws,
  error,
  logging,
  generalPurposeFunctions,
  streams,
} from '@glyphx/core';
import {fileIngestion} from '@glyphx/types';
import {SdtParser} from './io';
import {QueryRunner} from './io/queryRunner';
import {IQueryResponse} from './interfaces';
import {QUERY_STATUS} from './constants';
import {GlyphStream} from './io/glyphStream';
import {SgcStream} from './io/sgcStream';
import {SgnStream} from './io/sgnStream';
import {PassThrough} from 'stream';

export class GlyphEngine {
  private readonly templateKey: string;
  private readonly inputBucketNameField: string;
  private readonly outputBucketNameField: string;

  private readonly inputBucketField: aws.S3Manager;
  private readonly outputBucketField: aws.S3Manager;

  private readonly databaseNameField: string;
  private readonly athenaManager: aws.AthenaManager;

  private queryRunner?: QueryRunner;
  private queryId?: string;
  private initedField: boolean;

  constructor(
    inputBucketName: string,
    outputBucketName: string,
    databaseName: string
  ) {
    this.templateKey = 'public/templates/template_new.sdt';

    this.inputBucketNameField = inputBucketName;
    this.outputBucketNameField = outputBucketName;

    this.inputBucketField = new aws.S3Manager(this.inputBucketNameField);
    this.outputBucketField = new aws.S3Manager(this.outputBucketNameField);

    this.databaseNameField = databaseName;
    this.athenaManager = new aws.AthenaManager(this.databaseNameField);

    this.initedField = false;
  }

  public async init(): Promise<void> {
    if (!this.initedField) {
      try {
        await this.inputBucketField.init();
        await this.outputBucketField.init();
        await this.athenaManager.init();
        await logging.Logger.init();
        this.initedField = true;
      } catch (err) {
        const e = new error.UnexpectedError(
          'An unexpected error occurred while initiliazing the GlyphEngine. See the inner error for additional information',
          err
        );
        e.publish();
        throw e;
      }
    }
  }

  private cleanupData(data: Map<string, string>): void {
    data.set(
      'x_axis',
      data.get('x_axis')?.replaceAll('.', '').replaceAll(' ', '_') ?? ''
    );
    data.set(
      'y_axis',
      data.get('y_axis')?.replaceAll('.', '').replaceAll(' ', '_') ?? ''
    );
    data.set(
      'z_axis',
      data.get('z_axis')?.replaceAll('.', '').replaceAll(' ', '_') ?? ''
    );
    if (!data.get('x_func')) {
      data.set('x_func', 'LIN');
      data.set('y_func', 'LIN');
      data.set('z_func', 'LIN');
    }
    if (!data.get('x_direction')) {
      data.set('x_direction', 'ASC');
      data.set('y_direction', 'ASC');
      data.set('z_direction', 'ASC');
    }
  }

  private async getDataTypes(
    viewName: string,
    data: Map<string, string>
  ): Promise<void> {
    try {
      const tableDef = await this.athenaManager.getTableDescription(viewName);
      setColType('x', tableDef, data);
      setColType('y', tableDef, data);
      setColType('z', tableDef, data);
    } catch (err) {
      const e = new error.UnexpectedError(
        'An unexpected error occurred while getting data types. See the inner error for additional information',
        err
      );
      e.publish();
      throw e;
    }
    function setColType(
      prefix: string,
      tableDef: {
        columnName: string;
        columnType: fileIngestion.constants.FIELD_TYPE;
      }[],
      data: Map<string, string>
    ): void {
      const col = data.get(`${prefix}_axis`);
      const colxType =
        tableDef.find(d => d.columnName === col)?.columnType ??
        fileIngestion.constants.FIELD_TYPE.UNKNOWN;

      const colAsString =
        colxType === fileIngestion.constants.FIELD_TYPE.STRING
          ? 'string'
          : 'number';
      data.set(`type_${prefix}`, colAsString);
    }
  }

  private async getTemplateAsString(): Promise<string> {
    try {
      const rStream = await this.inputBucketField.getObjectStream(
        this.templateKey
      );

      const chunks: Array<any> = [];
      for await (const chunk of rStream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const str = buffer.toString('utf-8');
      return str;
    } catch (err) {
      const e = new error.UnexpectedError(
        'An unexpected error occurred while getting the template. See the inner error for additional information',
        err
      );
      e.publish();
      throw e;
    }
  }

  public async process(
    data: Map<string, string>
  ): Promise<{sdtFileName: string; sgnFileName: string; sgcFileName: string}> {
    this.cleanupData(data);

    const userId = data.get('user_id') ?? '';
    const modelId = data.get('model_id') ?? '';
    const clientId = data.get('client_id') ?? '';

    const viewName = generalPurposeFunctions.fileIngestion.getViewName(
      clientId,
      modelId
    );

    data.set('view_name', viewName);

    //Start our query now before we do any processing
    await this.startQuery(data, viewName);

    await this.getDataTypes(viewName, data);
    const template = this.updateSdt(await this.getTemplateAsString(), data);

    //TODO: fix fileName
    const prefix = `${userId}/${modelId}`;
    const sdtFileName = `${prefix}/model.sdt`;
    await this.outputBucketField.putObject(sdtFileName, template);

    const sdtParser = await SdtParser.parseSdtString(template, viewName);

    const status: IQueryResponse = await this.getQueryResponse();
    let sgnFileName = '';
    let sgcFileName = '';
    if (status.status === QUERY_STATUS.FAILED) {
      throw status.error;
    } else {
      const fileNames = await this.processData(sdtParser, prefix);
      sgnFileName = fileNames.sgnFileName;
      sgcFileName = fileNames.sgcFileName;
    }

    return {sdtFileName, sgnFileName, sgcFileName};
  }

  private async processData(
    sdtParser: SdtParser,
    filePrefix: string
  ): Promise<{sgcFileName: string; sgnFileName: string}> {
    const sgcFileName = `${filePrefix}/model.sgc`;
    const sgnFileName = `${filePrefix}/model.sgn`;
    const resultsStream = new streams.AthenaQueryReadStream(
      this.athenaManager,
      this.queryId as string,
      1000
    );

    const glyphStream = new GlyphStream(sdtParser);
    const forkingStream = new streams.ForkingStream(resultsStream, glyphStream);

    const sgnStream = new SgnStream();
    const sgcStream = new SgcStream();

    const sgnUploadStream = new PassThrough();
    const sgcUploadStream = new PassThrough();

    //TODO: figure out our file names
    const sgnDestStream = this.outputBucketField.getUploadStream(
      sgnFileName,
      sgnUploadStream
    );
    const sgcDestStream = this.outputBucketField.getUploadStream(
      sgcFileName,
      sgcUploadStream
    );

    forkingStream.fork('sgnStream', sgnStream, sgnUploadStream);
    forkingStream.fork('sgcStream', sgcStream, sgcUploadStream);

    forkingStream.startPipeline();

    await Promise.all([sgnDestStream.done(), sgcDestStream.done()]);
    return {sgcFileName, sgnFileName};
  }

  private async getQueryResponse(): Promise<IQueryResponse> {
    let status: IQueryResponse;
    do {
      status = (await this.queryRunner?.getQueryStatus()) as IQueryResponse;
    } while (
      status.status === QUERY_STATUS.RUNNING ||
      status.status === QUERY_STATUS.UNKNOWN
    );
    return status;
  }

  private async startQuery(
    data: Map<string, string>,
    viewName: string
  ): Promise<void> {
    const xCol = data.get('x_axis') ?? '';
    const yCol = data.get('y_axis') ?? '';
    const zCol = data.get('z_axis') ?? '';

    this.queryRunner = new QueryRunner(
      viewName,
      xCol,
      yCol,
      zCol,
      this.databaseNameField
    );

    //TODO: we will need to add error handling here.
    this.queryId = await this.queryRunner.startQuery();
  }

  updateSdt(template: string, data: Map<string, string>): string {
    const functionX = this.getFunction(data, 'type_x', 'x_func');
    const functionY = this.getFunction(data, 'type_y', 'y_func');
    const functionZ = this.getFunction(data, 'type_z', 'z_func');

    const xMin = (data.get('x_direction') ?? 'ASC') === 'ASC' ? -205 : 205;
    const xDiff = (data.get('x_direction') ?? 'ASC') === 'ASC' ? 410 : -410;
    const yMin = (data.get('y_direction') ?? 'ASC') === 'ASC' ? -205 : 205;
    const yDiff = (data.get('y_direction') ?? 'ASC') === 'ASC' ? 410 : -410;
    const zMin = (data.get('z_direction') ?? 'ASC') === 'ASC' ? 1 : 70;
    const zDiff = (data.get('z_direction') ?? 'ASC') === 'ASC' ? 70 : -70;
    const colorMin =
      (data.get('z_direction') ?? 'ASC') === 'ASC' ? '0,255,255' : '255,0,0';
    const colorDiff =
      (data.get('z_direction') ?? 'ASC') === 'ASC'
        ? '255,-255,-255'
        : '-255,255,255';

    const updatedTemplate = template
      .replace('ROOT_ID', data.get('model_id') ?? '')
      .replace('_HOST_', '_data.csv')
      .replace('_NAME_', '_data.csv')
      .replace('FUNCTION_X', functionX)
      .replace('FUNCTION_Y', functionY)
      .replace('FUNCTION_Z', functionZ)
      .replace('X_MIN', xMin.toString())
      .replace('X_DIFF', xDiff.toString())
      .replace('Y_MIN', yMin.toString())
      .replace('Y_DIFF', yDiff.toString())
      .replace('Z_MIN', zMin.toString())
      .replace('Z_DIFF', zDiff.toString())
      .replace('COLOR_MIN', colorMin)
      .replace('COLOR_DIFF', colorDiff)
      .replace('FIELD_X', data.get('x_axis') ?? '')
      .replace('FIELD_Y', data.get('y_axis') ?? '')
      .replace('FIELD_Z', data.get('z_axis') ?? '')
      .replace(
        'TYPE_X',
        (data.get('type_x') ?? 'string') === 'string' ? 'Text' : 'Real'
      )
      .replace(
        'TYPE_Y',
        (data.get('type_y') ?? 'string') === 'string' ? 'Text' : 'Real'
      )
      .replace(
        'TYPE_Z',
        (data.get('type_z') ?? 'string') === 'string' ? 'Text' : 'Real'
      );

    return updatedTemplate;
  }
  getFunction(data: Map<string, string>, key: string, func: string) {
    if (data.get(key) !== 'string') {
      if ((data.get(func) ?? '') === 'LOG') return 'Logarithmic Interpolation';
      return 'Linear Interpolation';
    } else {
      return 'Text Interpolation';
    }
  }
}

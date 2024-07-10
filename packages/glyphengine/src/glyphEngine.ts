import {aws, error, logging, generalPurposeFunctions, streams} from 'core';
import {fileIngestionTypes, databaseTypes, glyphEngineTypes} from 'types';
import {SdtParser} from './io';
import {QueryRunner} from './io/queryRunner';
import {IQueryResponse} from './interfaces';
import {QUERY_STATUS} from './constants';
import {GlyphStream} from './io/glyphStream';
import {SgcStream} from './io/sgcStream';
import {SgnStream} from './io/sgnStream';
import {PassThrough} from 'stream';
import {processTrackingService, Heartbeat, projectService} from 'business';

export class GlyphEngine {
  private readonly templateKey: string;

  private readonly inputBucketField: aws.S3Manager;
  private readonly outputBucketField: aws.S3Manager;

  private readonly athenaManager: aws.AthenaManager;

  private readonly processId: string;

  private queryRunner?: QueryRunner;
  private queryId?: string;
  private query: string;
  private initedField: boolean;

  constructor(
    inputS3Manager: aws.S3Manager,
    outputS3Manager: aws.S3Manager,
    athenaManager: aws.AthenaManager,
    processId: string
  ) {
    this.templateKey = 'templates/template_new.sdt';

    this.inputBucketField = inputS3Manager;
    this.outputBucketField = outputS3Manager;

    this.athenaManager = athenaManager;

    this.processId = processId;
    this.initedField = false;

    this.query = '';
  }

  public async init(): Promise<void> {
    if (!this.initedField) {
      try {
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
    data.set('x_axis', data.get('x_axis')?.replaceAll('.', '').replaceAll(' ', '_') ?? '');
    data.set('y_axis', data.get('y_axis')?.replaceAll('.', '').replaceAll(' ', '_') ?? '');
    data.set('z_axis', data.get('z_axis')?.replaceAll('.', '').replaceAll(' ', '_') ?? '');
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

  private async getDataTypes(viewName: string, data: Map<string, string>): Promise<void> {
    try {
      const tableDef = await this.athenaManager.getTableDescription(viewName);
      const project = (await projectService.getProject(data.get('model_id') as string)) as databaseTypes.IProject;
      if (!project) {
        throw new error.UnexpectedError(`Project ${data.get('model_id')}not found`);
      }
      setColType('x', tableDef, data, project);
      setColType('y', tableDef, data, project);
      setColType('z', tableDef, data, project);
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
        columnType: fileIngestionTypes.constants.FIELD_TYPE;
      }[],
      data: Map<string, string>,
      project: databaseTypes.IProject
    ): void {
      const col = data.get(`${prefix}_axis`);
      const colxType =
        tableDef.find((d) => d.columnName === col)?.columnType ?? fileIngestionTypes.constants.FIELD_TYPE.UNKNOWN;

      let colAsString = 'string';
      if (colxType !== fileIngestionTypes.constants.FIELD_TYPE.STRING) {
        let foundType = fileIngestionTypes.constants.FIELD_TYPE.UNKNOWN;
        for (let i = 0; i < project.files.length; i++) {
          const file = project.files[i];
          for (let j = 0; j < file.columns.length; j++) {
            if (file.columns[j].name === col) {
              foundType = file.columns[j].fieldType;
              break;
            }
          }
        }
        if (foundType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER) {
          colAsString = 'number';
        } else if (foundType === fileIngestionTypes.constants.FIELD_TYPE.DATE) {
          colAsString = 'date';
        }
      }
      data.set(`type_${prefix}`, colAsString);
    }
  }

  private async getTemplateAsString(): Promise<string> {
    try {
      const rStream = await this.inputBucketField.getObjectStream(this.templateKey);

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
  private validateInput(data: Map<string, string>): void {
    const requiredFileds = ['x_axis', 'y_axis', 'z_axis', 'client_id', 'model_id'];
    requiredFileds.forEach((field) => {
      if (!data.get(field)) throw new error.InvalidArgumentError(`${field} is required`, field, data);
    });
  }
  public async process(
    data: Map<string, string>
  ): Promise<{sdtFileName: string; sgnFileName: string; sgcFileName: string}> {
    await processTrackingService.updateProcessStatus(
      this.processId,
      databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
      `File Ingestion has started : ${new Date()}`
    );
    //Use the default of 1 minute.
    //we can change it later if we want.
    //this is set as the second parameter on the constructor.
    const heartBeat = new Heartbeat(this.processId);
    await heartBeat.start();
    try {
      this.validateInput(data);
      this.cleanupData(data);
      const modelId = data.get('model_id') as string;
      const clientId = data.get('client_id') as string;
      const payloadHash = data.get('payload_hash') as string;

      const viewName = generalPurposeFunctions.fileIngestion.getViewName(clientId, modelId);

      data.set('view_name', viewName);

      await processTrackingService.addProcessMessage(
        this.processId,
        `Getting the data types and updating the SDT: ${new Date()}`
      );
      await this.getDataTypes(viewName, data);

      //Start our query now before we do any processing
      await processTrackingService.addProcessMessage(this.processId, `Starting the query: ${new Date()}`);
      await this.startQuery(data, viewName);

      const template = this.updateSdt(await this.getTemplateAsString(), data);

      //bucket/client/workspaceId/ProjectId/output/model.sdt
      const prefix = `client/${clientId}/${modelId}/output`;
      const sdtFileName = `${prefix}/${payloadHash}.sdt`;
      await this.outputBucketField.putObject(sdtFileName, template);

      const {xCol, yCol, zCol, isXDate, xDateGrouping, isYDate, yDateGrouping, isZDate, zColName, zAccumulatorType} =
        this.formatCols(data);

      const initialParser = new SdtParser(
        isXDate,
        xDateGrouping,
        isYDate,
        yDateGrouping,
        isZDate,
        xCol,
        yCol,
        zCol,
        zColName,
        zAccumulatorType
      );
      const sdtParser = await initialParser.parseSdtString(template, viewName, data, this.athenaManager);
      await processTrackingService.addProcessMessage(
        this.processId,
        `Waiting for the query to complete: ${new Date()}`
      );
      const status: IQueryResponse = await this.getQueryResponse();
      let sgnFileName = '';
      let sgcFileName = '';
      if (status.status === QUERY_STATUS.FAILED) {
        throw status.error;
      } else {
        await processTrackingService.addProcessMessage(
          this.processId,
          `Creating Gyphs and uploading files: ${new Date()}`
        );

        const fileNames = await this.processData(sdtParser as unknown as SdtParser, prefix, payloadHash);
        sgnFileName = fileNames.sgnFileName;
        sgcFileName = fileNames.sgcFileName;
      }
      const retval = {sdtFileName, sgnFileName, sgcFileName};
      heartBeat.stop();
      await processTrackingService.completeProcess(
        this.processId,
        retval,
        databaseTypes.constants.PROCESS_STATUS.COMPLETED
      );
      return retval;
    } catch (err) {
      const e = new error.UnexpectedError(
        'An unexpected error occurred while processing the data. See the inner error for additional information',
        err
      );
      e.publish();
      heartBeat.stop();
      await processTrackingService.addProcessError(this.processId, e);
      await processTrackingService.completeProcess(this.processId, {}, databaseTypes.constants.PROCESS_STATUS.FAILED);

      throw e;
    }
  }

  private async processData(
    sdtParser: SdtParser,
    filePrefix: string,
    payloadHash: string
  ): Promise<{sgcFileName: string; sgnFileName: string}> {
    //bucket/client/workspaceId/ProjectId/output/model.sgc
    const sgcFileName = `${filePrefix}/${payloadHash}.sgc`;
    //bucket/client/workspaceId/ProjectId/output/model.sgn
    const sgnFileName = `${filePrefix}/${payloadHash}.sgn`;
    const resultsStream = new streams.AthenaQueryReadStream(this.athenaManager, this.queryId as string, 1000);

    const glyphStream = new GlyphStream(sdtParser);
    const forkingStream = new streams.ForkingStream(resultsStream, glyphStream);

    const sgnStream = new SgnStream();
    const sgcStream = new SgcStream();

    const sgnUploadStream = new PassThrough();
    const sgcUploadStream = new PassThrough();

    const sgnDestStream = this.outputBucketField.getUploadStream(sgnFileName, sgnUploadStream);
    const sgcDestStream = this.outputBucketField.getUploadStream(sgcFileName, sgcUploadStream);

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
    } while (status.status === QUERY_STATUS.RUNNING || status.status === QUERY_STATUS.UNKNOWN);
    return status;
  }

  private formatCols(data: Map<string, string>): {
    isXDate: boolean;
    xDateGrouping: glyphEngineTypes.constants.DATE_GROUPING;
    isYDate: boolean;
    yDateGrouping: glyphEngineTypes.constants.DATE_GROUPING;
    isZDate: boolean;
    xCol: string;
    yCol: string;
    zCol: string;
    xColName: string;
    yColName: string;
    zColName: string;
    zAccumulatorType: glyphEngineTypes.constants.ACCUMULATOR_TYPE;
  } {
    const xCol = data.get('x_axis') as string;
    const yCol = data.get('y_axis') as string;
    const zColName = data.get('z_axis') as string;
    const isXDate = data.get('type_x') === 'date'; // comes from this.getDataType
    const isYDate = data.get('type_y') === 'date'; // comes from this.getDataType
    const isZDate = data.get('type_z') === 'date'; // comes from this.getDataType
    const xDateGrouping = data.get('x_date_grouping') as glyphEngineTypes.constants.DATE_GROUPING;
    const yDateGrouping = data.get('y_date_grouping') as glyphEngineTypes.constants.DATE_GROUPING;
    const zAccumulatorType = data.get('accumulatorType') as glyphEngineTypes.constants.ACCUMULATOR_TYPE;

    let groupByXColumn: glyphEngineTypes.constants.DATE_GROUPING | string;
    let groupByYColumn: glyphEngineTypes.constants.DATE_GROUPING | string;
    if (isXDate) {
      groupByXColumn = GlyphEngine.getDateGroupingFunction(xCol, xDateGrouping);
    } else {
      groupByXColumn = `"${xCol}"`;
    }
    if (isYDate) {
      groupByYColumn = GlyphEngine.getDateGroupingFunction(yCol, yDateGrouping);
    } else {
      groupByYColumn = `"${yCol}"`;
    }

    const accumulatorFunction: glyphEngineTypes.constants.ACCUMULATOR_TYPE | string =
      GlyphEngine.getAccumulatorFunction(isZDate, zAccumulatorType);
    return {
      isXDate,
      xDateGrouping,
      isYDate,
      yDateGrouping,
      isZDate,
      xCol: groupByXColumn,
      yCol: groupByYColumn,
      zCol: accumulatorFunction,
      xColName: xCol,
      yColName: yCol,
      zColName,
      zAccumulatorType,
    };
  }

  private async startQuery(data: Map<string, string>, viewName: string): Promise<void> {
    //TODO: need some validation here
    const filter = (data.get('filter') as string) ?? undefined;
    const {xCol, yCol, zCol, xColName, yColName, zColName} = this.formatCols(data);

    this.queryRunner = new QueryRunner({
      databaseName: this.athenaManager.databaseName,
      viewName,
      xCol,
      yCol,
      zCol,
      xColName,
      yColName,
      zColName,
      filter,
    });
    await this.queryRunner.init();
    this.queryId = await this.queryRunner.startQuery();
    this.query = this.queryRunner.query;
  }

  public static getAccumulatorFunction(
    isZDate: boolean,
    accumulatorType: glyphEngineTypes.constants.ACCUMULATOR_TYPE
  ): glyphEngineTypes.constants.ACCUMULATOR_TYPE | string {
    if (isZDate) {
      return `COUNT(zColumn)`;
    }
    switch (accumulatorType) {
      case glyphEngineTypes.constants.ACCUMULATOR_TYPE.AVG:
        return `AVG(zColumn)`;
      case glyphEngineTypes.constants.ACCUMULATOR_TYPE.MIN:
        return `MIN(zColumn)`;
      case glyphEngineTypes.constants.ACCUMULATOR_TYPE.MAX:
        return `MAX(zColumn)`;
      case glyphEngineTypes.constants.ACCUMULATOR_TYPE.COUNT:
        return `COUNT(zColumn)`;
      default: // Assuming SUM as default
        return `SUM(zColumn)`;
    }
  }
  // Maps date grouping to PRESTO compatible SQL functions
  public static getDateGroupingFunction(
    columnName: string,
    dateGroup: glyphEngineTypes.constants.DATE_GROUPING
  ): glyphEngineTypes.constants.DATE_GROUPING | string {
    return generalPurposeFunctions.presto.generatePrestoDateConversionStatement(columnName, dateGroup);
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
    const colorMin = (data.get('z_direction') ?? 'ASC') === 'ASC' ? '0,255,255' : '255,0,0';
    const colorDiff = (data.get('z_direction') ?? 'ASC') === 'ASC' ? '255,-255,-255' : '-255,255,255';
    const updatedTemplate = template
      .replace('ROOT_ID', data.get('model_id') as string)
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
      .replace('FIELD_X', data.get('x_axis') as string)
      .replace('FIELD_Y', data.get('y_axis') as string)
      .replace('FIELD_Z', data.get('z_axis') as string)
      .replace('TYPE_X', (data.get('type_x') as string) === 'string' ? 'Text' : 'Real')
      .replace('TYPE_Y', (data.get('type_y') as string) === 'string' ? 'Text' : 'Real')
      .replace('TYPE_Z', (data.get('type_z') as string) === 'string' ? 'Text' : 'Real');

    return updatedTemplate;
  }

  getFunction(data: Map<string, string>, key: string, func: string) {
    if (data.get(key) !== 'string') {
      if ((data.get(func) as string) === 'LOG') return 'Logarithmic Interpolation';
      return 'Linear Interpolation';
    } else {
      return 'Text Interpolation';
    }
  }
}

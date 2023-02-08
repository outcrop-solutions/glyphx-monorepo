import {aws, error, logging, generalPurposeFunctions} from '@glyphx/core';
import {fileIngestion} from '@glyphx/types';
import {Readable} from 'node:stream';

export class GlyphEngine {
  private readonly template_key = 'public/templates/template_new.sdt';
  private readonly inputBucketNameField: string;
  private readonly outputBucketNameField: string;

  private readonly inputBucketField: aws.S3Manager;
  private readonly outputBucketField: aws.S3Manager;

  private readonly databaseNameField: string;
  private readonly athenaManager: aws.AthenaManager;

  private initedField: boolean;

  constructor(
    inputBucketName: string,
    outputBucketName: string,
    databaseName: string
  ) {
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
      await this.inputBucketField.init();
      await this.outputBucketField.init();
      await this.athenaManager.init();
      await logging.Logger.init();
      this.initedField = true;
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
    clientId: string,
    modelId: string,
    data: Map<string, string>
  ): Promise<void> {
    const viewName = generalPurposeFunctions.fileIngestion.getViewName(
      clientId,
      modelId
    );

    data.set('view_name', viewName);

    const tableDef = await this.athenaManager.getTableDescription(viewName);
    setColType('x', tableDef, data);
    setColType('y', tableDef, data);
    setColType('z', tableDef, data);

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
    const rStream = await this.inputBucketField.getObjectStream(
      this.template_key
    );

    const chunks: Array<any> = [];
    for await (const chunk of rStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const str = buffer.toString('utf-8');
    return str;
  }

  public async process(data: Map<string, string>): Promise<void> {
    this.cleanupData(data);

    const userId = data.get('user_id') ?? '';
    const modelId = data.get('model_id') ?? '';
    const clientId = data.get('client_id') ?? '';

    const xFunc = data.get('x_func') ?? '';
    const yFunc = data.get('y_func') ?? '';
    const zFunc = data.get('z_func') ?? '';

    const xDir = data.get('x_dir') ?? '';
    const yDir = data.get('y_dir') ?? '';
    const zDir = data.get('z_dir') ?? '';
  }
}

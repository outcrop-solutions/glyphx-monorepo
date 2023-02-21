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

    await this.getDataTypes(clientId, modelId, data);
    const template = this.updateSdt(await this.getTemplateAsString(), data);

    const fileName = `${userId}/${modelId}/model.sdt`;
    await this.outputBucketField.putObject(fileName, template);
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

import {aws, secretBinders, error} from '@glyphx/core';

@secretBinders.bindSecrets('db/athena')
class AthenaConnection {
  @secretBinders.boundProperty()
  private databaseName: string;
  private connectionField?: aws.AthenaManager;

  private initedField: boolean;
  public get connection(): aws.AthenaManager {
    if (!this.connectionField)
      throw new error.InvalidOperationError(
        'You must make a call to init before you can access the connection property',
        {}
      );
    return this.connectionField;
  }
  //not sure why instanbul does not pick up our call to this but we clearly call it in your tests.
  //istanbul ignore next
  public get inited(): boolean {
    return this.initedField;
  }
  constructor() {
    this.databaseName = '';
    this.initedField = false;
  }

  @secretBinders.initializer
  public async init(): Promise<void> {
    if (!this.initedField) {
      this.connectionField = new aws.AthenaManager(this.databaseName);
      await this.connectionField.init();
      this.initedField = true;
    }
  }
}

export default new AthenaConnection();

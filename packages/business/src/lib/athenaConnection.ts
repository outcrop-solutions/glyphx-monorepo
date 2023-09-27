import {aws, bindSecrets, boundProperty, initializer, error} from 'core';

@bindSecrets('db/athena')
class AthenaConnection {
  @boundProperty()
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

  @initializer
  public async init(): Promise<void> {
    if (!this.initedField) {
      this.connectionField = new aws.AthenaManager(this.databaseName);
      await this.connectionField.init();
      this.initedField = true;
    }
  }
}

const athenaConnection = new AthenaConnection();
export default athenaConnection;

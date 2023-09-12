import {aws, bindSecrets, boundProperty, initializer, error} from 'core';

@bindSecrets('file/s3')
class S3Connection {
  @boundProperty()
  private bucketName: string;
  private s3ManagerField?: aws.S3Manager;
  private initedField: boolean;

  public get s3Manager(): aws.S3Manager {
    if (!this.s3ManagerField) {
      throw new error.InvalidOperationError(
        'You must make a call to init before you can access the s3Manager property',
        {}
      );
    }
    return this.s3ManagerField!;
  }
  //istanbul ignore next
  public get inited(): boolean {
    return this.initedField;
  }

  constructor() {
    this.bucketName = '';
    this.initedField = false;
  }

  @initializer
  public async init(): Promise<void> {
    if (!this.initedField) {
      this.s3ManagerField = new aws.S3Manager(this.bucketName);
      await this.s3ManagerField.init();
      this.initedField = true;
    }
  }
}

const s3Connection = new S3Connection();
export default s3Connection;

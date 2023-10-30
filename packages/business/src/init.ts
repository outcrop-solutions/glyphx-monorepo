// import {logging} from 'core';
import {EmailClient} from 'email';
import databaseConnection from './lib/databaseConnection';
import athenaConnection from './lib/athenaConnection';
import s3Connection from './lib/s3Connection';
import {StripeClient} from './lib/stripe';

export class Initializer {
  static initedField = false;
  /**
   * return the inited field indicating that the init method has been called.
   */
  public get inited(): boolean {
    return Initializer.initedField;
  }

  public static async init(): Promise<void> {
    // await logging.Logger.init();
    await databaseConnection.init();
    await athenaConnection.init();
    await s3Connection.init();
    await EmailClient.init();
    await StripeClient.init();
    Initializer.initedField = true;
  }
}

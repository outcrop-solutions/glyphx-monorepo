import {logging} from '@glyphx/core';
import {EmailClient} from '@glyphx/email';
import databaseConnection from 'lib/databaseConnection';
import athenaConnection from 'lib/athenaConnection';
import {StripeClient} from 'lib/stripe';

export class Initializer {
  static initedField = false;
  /**
   * return the inited field indicating that the init method has been called.
   */
  public get inited(): boolean {
    return Initializer.initedField;
  }

  public static async init() {
    await logging.Logger.init();
    await databaseConnection.init();
    await athenaConnection.init();
    await EmailClient.init();
    await StripeClient.init();
  }
}

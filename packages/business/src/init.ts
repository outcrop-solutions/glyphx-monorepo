import {logging} from '@glyphx/core';
import {EmailClient} from '@glyphx/email';
import databaseConnection from 'lib/databaseConnection';
import athenaConnection from 'lib/athenaConnection';
import {StripeClient} from 'lib/stripe';
export class Initializer {
  public static async init() {
    await logging.Logger.init();
    await databaseConnection.init();
    await athenaConnection.init();
    await EmailClient.init();
    await StripeClient.init();
  }
}

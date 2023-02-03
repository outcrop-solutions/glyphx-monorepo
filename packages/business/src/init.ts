import {logging} from '@glyphx/core';
import databaseConnection from './lib/server/databaseConnection';
import athenaConnection from './lib/server/athenaConnection';
export class Initializer {
  public static async init() {
    await logging.Logger.init();
    await databaseConnection.init();
    await athenaConnection.init();
  }
}

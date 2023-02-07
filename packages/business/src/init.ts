import {logging} from '@glyphx/core';
import connection from './lib/databaseConnection';

export class Initializer {
  public static async init() {
    await logging.Logger.init();
    await connection.init();
  }
}

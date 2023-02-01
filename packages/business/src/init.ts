import {logging} from '@glyphx/core';
import connection from './lib/server/databaseConnection';
export async function init() {
  await logging.Logger.init();
  await connection.init();
}

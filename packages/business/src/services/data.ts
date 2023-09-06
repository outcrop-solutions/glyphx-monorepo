import AthenaConnection from '../lib/athenaConnection';
import {error} from 'core';

export class DataService {
  public static async getDataByGlyphxIds(tableName: string, glyphxIds: number[]): Promise<any[]> {
    const query = `SELECT * FROM ${tableName} WHERE glyphx_id__ IN (${glyphxIds.join(',')})`;
    try {
      const results = await AthenaConnection.connection.runQuery(query);
      return results;
    } catch (err) {
      const e = new error.DataServiceError(
        `An unexpected Error occurred while getting the data for the rowIds: ${glyphxIds.join(
          ', '
        )} from the table: ${tableName}.  See the inner error for additional details`,
        'Data',
        'getDataByGlyphxIds',
        {tableName, glyphxIds},
        err
      );

      e.publish();
      throw e;
    }
  }

  public static async getDataByTableName(tableName: string): Promise<any[]> {
    const query = `SELECT * FROM "${tableName}"`;
    try {
      const results = await AthenaConnection.connection.runQuery(query);
      return results;
    } catch (err) {
      const e = new error.DataServiceError(
        `An unexpected Error occurred while getting the data from the table: ${tableName}.  See the inner error for additional details`,
        'Data',
        'getDataByTableName',
        {tableName},
        err
      );

      e.publish();
      throw e;
    }
  }
}

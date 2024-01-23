import AthenaConnection from '../lib/athenaConnection';
import {error} from 'core';

export class DataService {
  public static async getDataByGlyphxIds(
    tableName: string,
    glyphxIds: number[],
    pageSize: number = 50,
    pageNumber: number = 0,
    isExport: boolean = false
  ): Promise<any[]> {
    const offset = pageNumber * pageSize;
    const query = isExport
      ? `SELECT * FROM ${tableName} WHERE glyphx_id__ IN (${glyphxIds.join(',')})`
      : `SELECT * FROM ${tableName} WHERE glyphx_id__ IN (${glyphxIds.join(',')})  OFFSET ${offset} LIMIT ${pageSize}`;

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

  public static async getDataByTableName(
    tableName: string,
    pageSize: number = 50,
    pageNumber: number = 0
  ): Promise<any[]> {
    const offset = pageNumber * pageSize;
    const query = `SELECT * FROM "${tableName}" OFFSET ${offset} LIMIT ${pageSize}`;
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

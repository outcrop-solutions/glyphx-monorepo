import athenaConnection from 'lib/athenaConnection';
import {error} from '@glyphx/core';

/**
 * A Service to provide table operations against AWS Athena.
 */
export class TableService {
  public static async getMaxRowId(tableName: string): Promise<number> {
    try {
      const databaseName = athenaConnection.connection.databaseName;

      //TODO: once we cut over to the new file ingestor and there are no old projects we can consider
      //using max(glyphx_id) instead of count.
      const queryString = `SELECT COUNT(*) as count FROM "${databaseName}"."${tableName}"`;

      const result = await athenaConnection.connection.runQuery(queryString);

      const numberOfRows = result[0].count;

      const numberedResult = Number(numberOfRows);

      return numberedResult;
    } catch (err) {
      const e = new error.DataServiceError(
        `An unexpected error occurred while retreiving the row count for table: ${tableName}.  See the inner error for additional information`,
        'table',
        'getMaxRowId',
        {tableName: tableName},
        err
      );
      e.publish();
      throw e;
    }
  }
}

import {aws, error} from '@glyphx/core';
import {QUERY_STATUS} from '../constants';
import {IQueryResponse} from '../interfaces';

export class QueryRunner {
  private readonly xColumn: string;
  private readonly yColumn: string;
  private readonly zColumn: string;
  private readonly athenaManager: aws.AthenaManager;
  private inited: boolean;
  private readonly viewName: string;
  private readonly databaseName: string;
  private queryId?: string;
  private queryStatusField?: IQueryResponse;
  constructor(
    viewName: string,
    xcolumn: string,
    yColumn: string,
    zColumn: string,
    databaseName: string
  ) {
    this.viewName = viewName;
    this.xColumn = xcolumn;
    this.yColumn = yColumn;
    this.zColumn = zColumn;
    this.databaseName = databaseName;
    this.athenaManager = new aws.AthenaManager(databaseName);
    this.inited = false;
  }

  public async getQueryStatus(): Promise<IQueryResponse> {
    if (!this.queryId) {
      throw new error.InvalidOperationError(
        'You must call startQuery() before calling getQueryStatus()',
        {}
      );
    }
    if (
      this.queryStatusField?.status !== QUERY_STATUS.SUCCEEDED &&
      this.queryStatusField?.status !== QUERY_STATUS.FAILED
    ) {
      const status = await this.athenaManager.getQueryStatus(this.queryId);
      const statusCode =
        QUERY_STATUS[status.QueryExecution?.Status?.State ?? 'UNKNOWN'] ??
        QUERY_STATUS.UNKNOWN;
      this.queryStatusField = {
        status: statusCode,
        error:
          status.QueryExecution?.Status?.State === 'FAILED'
            ? status.QueryExecution.Status?.AthenaError?.ErrorMessage
            : undefined,
      };
    }
    return this.queryStatusField as IQueryResponse;
  }

  async init() {
    if (!this.inited) {
      await this.athenaManager.init();
      this.inited = true;
    }
  }
  //TODO: need to add the filter
  async startQuery() {
    const query = `WITH temp as (SELECT glyphx_id__ as "rowid", "${this.xColumn}","${this.yColumn}","${this.zColumn}" FROM "${this.databaseName}"."${this.viewName}")  SELECT array_join(array_agg(rowid) , '|') as "rowids", "${this.xColumn}", "${this.yColumn}", SUM("${this.zColumn}") as "${this.zColumn}"  FROM temp GROUP BY "${this.xColumn}", "${this.yColumn}";`;

    //this is already wrapped in a GlyphxError so no need to wrap it again
    this.queryId = await this.athenaManager.startQuery(query);

    this.queryStatusField = {
      status: QUERY_STATUS.RUNNING,
    };
    return this.queryId;
  }
}

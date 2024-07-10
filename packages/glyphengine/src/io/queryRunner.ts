import {aws, error} from 'core';
import {QUERY_STATUS} from '../constants';
import {IQueryResponse} from '../interfaces';
import {glyphEngineTypes} from 'types';

type QueryRunnerConstructor = {
  databaseName: string;
  viewName: string;
  xCol: string;
  yCol: string;
  zCol: string;
  xColName: string;
  yColName: string;
  zColName: string;
  filter?: string;
};

export class QueryRunner {
  private readonly xColName: string;
  private readonly yColName: string;
  private readonly zColName: string;
  private readonly xCol: string;
  private readonly yCol: string;
  private readonly zCol: string;
  private readonly athenaManager: aws.AthenaManager;
  private inited: boolean;
  private readonly viewName: string;
  private readonly databaseName: string;
  private queryId?: string;
  private queryStatusField?: IQueryResponse;
  private readonly filter: string;
  private queryField: string;
  constructor({
    databaseName,
    viewName,
    xCol,
    yCol,
    zCol,
    xColName,
    yColName,
    zColName,
    filter,
  }: QueryRunnerConstructor) {
    this.viewName = viewName;
    this.xCol = xCol;
    this.yCol = yCol;
    this.zCol = zCol;
    this.xColName = xColName;
    this.yColName = yColName;
    this.zColName = zColName;
    this.databaseName = databaseName;
    this.athenaManager = new aws.AthenaManager(databaseName);
    this.inited = false;
    this.filter = this.composeFilter(filter);
    this.queryField = '';
  }

  public get query(): string {
    return this.queryField;
  }

  private composeFilter(filter: string | undefined): string {
    if (!filter?.trim()) {
      return '';
    } else {
      return `WHERE ${filter.trim()}`;
    }
  }

  public async getQueryStatus(): Promise<IQueryResponse> {
    if (!this.queryId) {
      throw new error.InvalidOperationError('You must call startQuery() before calling getQueryStatus()', {});
    }
    if (
      this.queryStatusField?.status !== QUERY_STATUS.SUCCEEDED &&
      this.queryStatusField?.status !== QUERY_STATUS.FAILED
    ) {
      const status = await this.athenaManager.getQueryStatus(this.queryId);
      const statusCode = QUERY_STATUS[status.QueryExecution?.Status?.State ?? 'UNKNOWN'] ?? QUERY_STATUS.UNKNOWN;
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

  async startQuery() {
    // Handle Date Grouping for xColumn and yColumn

    const query = `
    WITH temp as (
        SELECT glyphx_id__ as rowid, 
        ${this.xCol} as groupedXColumn, 
        ${this.yCol} as groupedYColumn, 
        ${this.zColName} as zColumn
        FROM "${this.databaseName}"."${this.viewName}" 
        ${this.filter}
    )  
    SELECT array_join(array_agg(rowid), '|') as "rowids", 
    groupedXColumn as x_${this.xColName}, 
    groupedYColumn as y_${this.yColName}, 
    ${this.zCol} as ${this.zColName}
    FROM temp 
    GROUP BY groupedXColumn, groupedYColumn;
`;
    //this is already wrapped in a GlyphxError so no need to wrap it again
    this.queryField = query;
    this.queryId = await this.athenaManager.startQuery(query);
    this.queryStatusField = {
      status: QUERY_STATUS.RUNNING,
    };
    return this.queryId;
  }
}

// "
// //    WITH temp as (
// //        SELECT
//        "col1" as xColumn,
//      "col2" as yColumn,
//      SUM(zColumn) as zColumn
//      FROM "glyphx_testclientidd8c241b87b4a4c748ae24e244f5f15a2_654bc344fcad52d12ed973d6_view"

//      GROUP BY "col1", "col2"
//    )
//    SELECT
//      MIN(xColumn) as "mincol1",
//      MAX(xColumn) as "maxcol1",
//      MIN(yColumn) as "mincol2",
//      MAX(yColumn) as "maxcol2",
//      MIN(zColumn) as "mincol4",
//      MAX(zColumn) as "maxcol4"
//    FROM temp;
//  ";

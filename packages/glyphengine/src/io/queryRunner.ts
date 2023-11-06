import {aws, error} from 'core';
import {QUERY_STATUS} from '../constants';
import {IQueryResponse} from '../interfaces';
import {glyphEngineTypes} from 'types';

type QueryRunnerConstructor = {
  databaseName: string;
  viewName: string;
  xColumn: string;
  yColumn: string;
  zColumn: string;
  isXDate: boolean;
  isYDate: boolean;
  isZDate: boolean;
  xDateGrouping: glyphEngineTypes.constants.DATE_GROUPING;
  yDateGrouping: glyphEngineTypes.constants.DATE_GROUPING;
  zAccumulatorType: glyphEngineTypes.constants.ACCUMULATOR_TYPE;
  filter?: string;
};

export class QueryRunner {
  private readonly xColumn: string;
  private readonly yColumn: string;
  private readonly isXDate: boolean;
  private readonly isYDate: boolean;
  private readonly isZDate: boolean;
  private readonly zColumn: string;
  private readonly accumulatorType: glyphEngineTypes.constants.ACCUMULATOR_TYPE;
  private readonly xDateGrouping: glyphEngineTypes.constants.DATE_GROUPING;
  private readonly yDateGrouping: glyphEngineTypes.constants.DATE_GROUPING;
  private readonly athenaManager: aws.AthenaManager;
  private inited: boolean;
  private readonly viewName: string;
  private readonly databaseName: string;
  private queryId?: string;
  private queryStatusField?: IQueryResponse;
  private readonly filter: string;
  constructor({
    databaseName,
    viewName,
    xColumn,
    isXDate,
    isYDate,
    isZDate,
    yColumn,
    zColumn,
    zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM,
    xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR,
    yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR,
    filter,
  }: QueryRunnerConstructor) {
    this.viewName = viewName;
    this.xColumn = xColumn;
    this.yColumn = yColumn;
    this.zColumn = zColumn;
    this.xDateGrouping = xDateGrouping;
    this.yDateGrouping = yDateGrouping;
    this.isXDate = isXDate;
    this.isYDate = isYDate;
    this.isZDate = isZDate;
    this.accumulatorType = zAccumulatorType;
    this.databaseName = databaseName;
    this.athenaManager = new aws.AthenaManager(databaseName);
    this.inited = false;
    this.filter = this.composeFilter(filter);
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

  private getAccumulatorFunction(
    columnName: string,
    accumulatorType: glyphEngineTypes.constants.ACCUMULATOR_TYPE
  ): glyphEngineTypes.constants.ACCUMULATOR_TYPE | string {
    switch (accumulatorType) {
      case glyphEngineTypes.constants.ACCUMULATOR_TYPE.AVG:
        return `AVG(zColumn)`;
      case glyphEngineTypes.constants.ACCUMULATOR_TYPE.MIN:
        return `MIN(zColumn)`;
      case glyphEngineTypes.constants.ACCUMULATOR_TYPE.MAX:
        return `MAX(zColumn)`;
      case glyphEngineTypes.constants.ACCUMULATOR_TYPE.COUNT:
        return `COUNT(zColumn)`;
      default: // Assuming SUM as default
        return `SUM(zColumn)`;
    }
  }

  // Maps date grouping to PRESTO compatible SQL functions
  private getDateGroupingFunction(
    columnName: string,
    dateGroup: glyphEngineTypes.constants.DATE_GROUPING
  ): glyphEngineTypes.constants.DATE_GROUPING | string {
    switch (dateGroup) {
      case glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR:
        return `DATE_FORMAT("${columnName}", '%Y-%j')`;
      case glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_MONTH:
        return `DAY("${columnName}")`;
      case glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_WEEK:
        return `CAST(EXTRACT(DOW FROM "${columnName}") AS INTEGER)`;
      case glyphEngineTypes.constants.DATE_GROUPING.WEEK_OF_YEAR:
        return `WEEK("${columnName}")`;
      case glyphEngineTypes.constants.DATE_GROUPING.MONTH_OF_YEAR:
        return `MONTH("${columnName}")`;
      case glyphEngineTypes.constants.DATE_GROUPING.YEAR:
        return `YEAR("${columnName}")`;
      case glyphEngineTypes.constants.DATE_GROUPING.QUARTER:
        return `QUARTER("${columnName}")`;
      default:
        return `"${columnName}"`;
    }
  }

  async startQuery() {
    // Handle Date Grouping for xColumn and yColumn

    let groupByXColumn: glyphEngineTypes.constants.DATE_GROUPING | string;
    let groupByYColumn: glyphEngineTypes.constants.DATE_GROUPING | string;
    if (this.isXDate) {
      groupByXColumn = this.getDateGroupingFunction(this.xColumn, this.xDateGrouping);
    } else {
      groupByXColumn = `"${this.xColumn}"`;
    }
    if (this.isYDate) {
      groupByYColumn = this.getDateGroupingFunction(this.yColumn, this.yDateGrouping);
    } else {
      groupByYColumn = `"${this.yColumn}"`;
    }

    const accumulatorFunction: glyphEngineTypes.constants.ACCUMULATOR_TYPE | string = this.getAccumulatorFunction(
      this.zColumn,
      this.accumulatorType
    );

    const query = `
    WITH temp as (
        SELECT glyphx_id__ as rowid, 
        ${groupByXColumn} as groupedXColumn, 
        ${groupByYColumn} as groupedYColumn, 
        ${this.zColumn} as zColumn
        FROM "${this.databaseName}"."${this.viewName}" 
        ${this.filter}
    )  
    SELECT array_join(array_agg(rowid), '|') as "rowids", 
    groupedXColumn, 
    groupedYColumn, 
    ${accumulatorFunction} as zValue  
    FROM temp 
    GROUP BY groupedXColumn, groupedYColumn;
`;

    //this is already wrapped in a GlyphxError so no need to wrap it again
    this.queryId = await this.athenaManager.startQuery(query);

    this.queryStatusField = {
      status: QUERY_STATUS.RUNNING,
    };
    return this.queryId;
  }
}

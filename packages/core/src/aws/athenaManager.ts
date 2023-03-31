import {
  AthenaClient,
  StartQueryExecutionCommand,
  StartQueryExecutionCommandInput,
  GetQueryExecutionCommand,
  GetQueryExecutionCommandOutput,
  GetQueryResultsCommand,
  GetQueryResultsCommandOutput,
  GetQueryResultsCommandInput,
  GetDatabaseCommand,
  ResultSet,
  paginateGetQueryResults,
  AthenaPaginationConfiguration,
} from '@aws-sdk/client-athena';
import {ResultSetConverter} from './util/resultsetConverter';
import {Paginator} from '@aws-sdk/types';
import * as error from '../error';
import {fileIngestion} from '@glyphx/types';

/**
 * The data catalog name that is used to find our database.
 */
export const DATA_CATALOG_NAME = 'AwsDataCatalog';

/**
 * Wraps the @aws-sdk/client-athena library for running queries against
 * an Athena database.
 */
export class AthenaManager {
  private readonly athenaClientField: AthenaClient;
  private readonly databaseNameField: string;
  /**
   * A boolean which indicated whether or not the {@link init} function has been called.
   */
  private initedField: boolean;

  /**
   * The accessor to determine the value of {@link initedField}
   */
  public get inited(): boolean {
    return this.initedField;
  }

  /**
   * An accessor to get the underlying AthenaClient that is associated with
   * this instance.
   *
   * @throws InvalidOperationException - if {@link init} has not been previously called on this instance.
   */
  public get athenaClient(): AthenaClient {
    if (!this.initedField)
      throw new error.InvalidOperationError(
        'you must call init before you can retreive the athena client',
        {}
      );
    return this.athenaClientField;
  }

  /**
   * An accessor which returns the database name used to contruct the object.
   */
  public get databaseName(): string {
    return this.databaseNameField;
  }

  /**
   * Constructs a new AthenaManager object.
   *
   * @param databaseName -- the name of the database to attach this instance to.
   */
  constructor(databaseName: string) {
    this.initedField = false;
    this.databaseNameField = databaseName;
    this.athenaClientField = new AthenaClient({});
  }

  /**
   *
   * initializes our {@link athenaClient}.  This must be called
   * before any other acessors or functions are called.
   *
   * @throws InvalidArgumentError - if an ocurres while checking for the existance of the database
   * named in {@link databaseName}
   */
  public async init(): Promise<void> {
    try {
      await this.athenaClientField.send(
        new GetDatabaseCommand({
          CatalogName: DATA_CATALOG_NAME,
          DatabaseName: this.databaseNameField,
        })
      );

      this.initedField = true;
    } catch (err) {
      throw new error.InvalidArgumentError(
        `An unexpected error occurred while checking for the existance of the database ${this.databaseName}.  Are you sure that it exists and that you have permissions to access it`,
        'databaseName',
        this.databaseName,
        err
      );
    }
  }
  /**
   * Will execute the query against Athena.  Athena completes the query offline, so this funciton will start the query
   *
   * @param queryString - the query to execute.
   * @returns the query id of the query that was started.
   * @throws QueryExecutionError - if an error occurs while starting the query.
   */
  public async startQuery(
    queryString: string,
    outputLocation?: string
  ): Promise<string> {
    const dataContext = {
      Database: this.databaseName,
      Catalog: DATA_CATALOG_NAME,
    };

    const startQueryCommandInput: StartQueryExecutionCommandInput = {
      QueryExecutionContext: dataContext,
      QueryString: queryString,
    };

    if (outputLocation) {
      startQueryCommandInput.ResultConfiguration = {
        OutputLocation: outputLocation,
      };
    }

    const startQueryCommand = new StartQueryExecutionCommand(
      startQueryCommandInput
    );

    try {
      const startQueryResults = await this.athenaClient.send(startQueryCommand);

      const queryId = startQueryResults.QueryExecutionId as string;
      return queryId;
    } catch (err) {
      throw new error.QueryExecutionError(
        'An error occuered while processing the query.  See the inner error for details',
        queryString,
        err
      );
    }
  }

  public async getQueryStatus(
    queryId: string
  ): Promise<GetQueryExecutionCommandOutput> {
    try {
      const getQueryStatusCommand = new GetQueryExecutionCommand({
        QueryExecutionId: queryId,
      });

      const queryStatus = await this.athenaClient.send(getQueryStatusCommand);

      return queryStatus;
    } catch (err) {
      throw new error.QueryExecutionError(
        'An error occuered while getting the query status.  See the inner error for details',
        queryId,
        err
      );
    }
  }

  /**
   * Will execute the query against Athena.  Athena completes the query offline, so this funciton will start the query
   * then check its progress until it completes.  Once complete, it will retreive the results and format them
   * as an array of JSON objects.
   *
   * @param queryString - the query to execute.  Can be a SELECT, UPDATE or other command that does not return a result set.
   * @param waitTime - the number of seconds to wait for a query to finish.  Default is 10 seconds.
   *
   * @returns the query results as an array of objects.  If the query is a command that does not contain a ResultSet. this
   * will return an empty array [].
   *
   * @throws QueryTimeoutError -- if the query times out before a result is available.
   * @throws InvalidOperationError -- in response to any other exceptions thrown by the @aws-sdk/client-athena package.
   */

  public async runQuery(
    queryString: string,
    waitTime = 10,
    includeHeaderRow = false
  ): Promise<Record<string, unknown>[]> {
    try {
      const queryId = await this.startQuery(queryString);

      const adjustedWaitTime = waitTime * 1000; //Convert seconds to milliseconds
      const endTime = new Date(new Date().getTime() + adjustedWaitTime);
      //eslint-disable-next-line
      while (true) {
        const queryStatus = await this.getQueryStatus(queryId);
        //istanbul ignore next

        if (queryStatus.QueryExecution?.Status?.State === 'SUCCEEDED') break;
        else if (queryStatus.QueryExecution?.Status?.State === 'FAILED') {
          throw new error.QueryExecutionError(
            'An error occuered while processing the query.  See the inner error for details',
            queryString,
            queryStatus.QueryExecution?.Status?.AthenaError
          );
        }

        if (new Date().getTime() > endTime.getTime())
          throw new error.QueryTimeoutError(
            'The query timed out while waiting for results to be processed',
            queryString,
            waitTime
          );
      }

      const queryResultsCommand = new GetQueryResultsCommand({
        QueryExecutionId: queryId,
      });

      const results = await this.athenaClient.send(queryResultsCommand);
      const convertedResults = ResultSetConverter.fromResultset(
        results.ResultSet as Required<ResultSet>,
        includeHeaderRow
      );
      return convertedResults as Record<string, unknown>[];
    } catch (err) {
      if (
        err instanceof error.QueryTimeoutError ||
        err instanceof error.QueryExecutionError
      )
        throw err;
      else {
        throw new error.InvalidOperationError(
          'An unexpected error occrred while running the query.  See the inner error for additional details',
          {queryString, waitTime},
          err
        );
      }
    }
  }

  public async getPagedQueryResults(
    queryId: string,
    pageSize = 1000
  ): Promise<Paginator<GetQueryResultsCommandOutput>> {
    try {
      const queryStatus = await this.getQueryStatus(queryId);
      if (queryStatus.QueryExecution?.Status?.State === 'SUCCEEDED') {
        const paginationConfig: AthenaPaginationConfiguration = {
          client: this.athenaClient,
          pageSize: pageSize,
        };

        const params: GetQueryResultsCommandInput = {
          QueryExecutionId: queryId,
        };
        const pager = paginateGetQueryResults(paginationConfig, params);
        return pager;
      } else if (queryStatus.QueryExecution?.Status?.State === 'FAILED') {
        throw new error.QueryExecutionError(
          'An error occurred while processing the query.  See the inner error for details',
          queryId,
          queryStatus.QueryExecution?.Status?.AthenaError
        );
      } else {
        throw new error.InvalidOperationError(
          `The query for queryId: ${queryId} has not completed.  You should make sure that the query has completed before trying to retrieve a pager for the results.`,
          {}
        );
      }
    } catch (err) {
      if (
        err instanceof error.QueryExecutionError ||
        err instanceof error.InvalidOperationError
      )
        throw err;

      throw new error.InvalidOperationError(
        'An unexpected error occrred while getting the pager.  See the inner error for additional details',
        {queryId, pageSize},
        err
      );
    }
  }
  /**
   * Will return a boolean indicating whether or not the table exists
   * in our database.  This function wraps the function {@link runQuery}
   * and will not catch any exeptions that it throws.
   *
   * @param tableName -- the name of the table to search the database for.
   *
   *
   * @throws QueryTimeoutError -- if the query times out before a result is available.
   * @throws InvalidOperationError -- in response to any other exceptions thrown by the @aws-sdk/client-athena package.
   */
  public async tableExists(tableName: string): Promise<boolean> {
    const tableExistsQuery = `SHOW TABLES '${tableName}'`;
    const results = await this.runQuery(tableExistsQuery, 10, true);
    if (results.length > 0) return true;
    else return false;
  }

  /**
   * Will return a boolean indicating whether or not the view exists
   * in our database.  This function wraps the function {@link runQuery}
   * and will not catch any exeptions that it throws.
   *
   * @param viewName-- the name of the table to search the database for.
   *
   *
   * @throws QueryTimeoutError -- if the query times out before a result is available.
   * @throws InvalidOperationError -- in response to any other exceptions thrown by the @aws-sdk/client-athena package.
   */
  public async viewExists(viewName: string): Promise<boolean> {
    const viewExistsQuery = `SHOW VIEWS LIKE '${viewName}'`;
    const results = await this.runQuery(viewExistsQuery, 10, true);
    if (results.length > 0) return true;
    else return false;
  }

  /**
   * Will silently drop a table in the database.  There is no indication
   * whether or not the table actually existed. This function wraps the
   * function {@link runQuery} and will not catch any exeptions that it throws.
   *
   * @param tableName -- the name of the table to drop.
   *
   *
   * @throws QueryTimeoutError -- if the query times out before a result is available.
   * @throws InvalidOperationError -- in response to any other exceptions thrown by the @aws-sdk/client-athena package.
   */
  public async dropTable(tableName: string): Promise<void> {
    const dropQuery = `DROP TABLE IF EXISTS ${tableName};`;
    await this.runQuery(dropQuery);
  }

  /**
   * Will silently drop a view in the database.  There is no indication
   * whether or not the view actually existed. This function wraps the
   * function {@link runQuery} and will not catch any exeptions that it throws.
   *
   * @param viewName -- the name of the view to drop.
   *
   *
   * @throws QueryTimeoutError -- if the query times out before a result is available.
   * @throws InvalidOperationError -- in response to any other exceptions thrown by the @aws-sdk/client-athena package.
   */
  public async dropView(viewName: string): Promise<void> {
    const dropQuery = `DROP VIEW IF EXISTS "${viewName}";`;
    await this.runQuery(dropQuery);
  }

  public async getTableDescription(
    tableName: string
  ): Promise<
    {columnName: string; columnType: fileIngestion.constants.FIELD_TYPE}[]
  > {
    const query = `DESCRIBE \`${tableName}\`;`;
    const results = await this.runQuery(query, 10, true);
    const cleanResults = results.map(r => {
      const dirty = r.col_name as string;
      const split = dirty.split('\t');
      const colTypeString = split[1].trim();
      let colType = fileIngestion.constants.FIELD_TYPE.UNKNOWN;
      if (colTypeString === 'string' || colTypeString.startsWith('varchar(')) {
        colType = fileIngestion.constants.FIELD_TYPE.STRING;
      } else if (colTypeString === 'bigint') {
        colType = fileIngestion.constants.FIELD_TYPE.INTEGER;
      } else if (colTypeString === 'double') {
        colType = fileIngestion.constants.FIELD_TYPE.NUMBER;
      } else {
        throw new error.InvalidOperationError(
          `The column type: ${colTypeString} for column: ${split[0].trim()}is not a known column type.`,
          {columnDefinition: r}
        );
      }
      return {
        columnName: split[0].trim(),
        columnType: colType,
      };
    });
    return cleanResults;
  }
}

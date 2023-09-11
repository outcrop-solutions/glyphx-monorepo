import {Readable} from 'stream';
import {AthenaManager} from '../aws/athenaManager';
import {ResultSetConverter} from '../aws/util/resultsetConverter';
import {ResultSet, GetQueryResultsCommandOutput} from '@aws-sdk/client-athena';
import {Paginator} from '@aws-sdk/types';
import * as error from '../error';

export class AthenaQueryReadStream extends Readable {
  private readonly queryId: string;
  private readonly athenaManager: AthenaManager;
  private paginator?: Paginator<GetQueryResultsCommandOutput>;
  private readonly dataIterator: AsyncGenerator<any, any, any>;
  private pageSize: number;

  constructor(athenaManager: AthenaManager, queryId: string, pageSize = 1000) {
    super({objectMode: true});
    this.queryId = queryId;
    this.athenaManager = athenaManager;
    this.pageSize = pageSize;
    this.dataIterator = this.fetchData();
  }

  private async *fetchData() {
    let nextToken: string;
    let includeHeader = false;
    try {
      const paginator = await this.athenaManager.getPagedQueryResults(this.queryId, this.pageSize);
      do {
        const page = (await paginator.next()) as any;
        nextToken = page.value.NextToken;
        const convertedPage = ResultSetConverter.fromResultset(
          page.value.ResultSet as Required<ResultSet>,
          includeHeader
        );
        for (let i = 0; i < convertedPage.length; i++) {
          const row = convertedPage[i];
          yield row;
        }
        includeHeader = true;
      } while (nextToken);
    } catch (err: any) {
      const e = new error.DatabaseOperationError(
        `An unexpected error occurred while fetching data from Athena: ${err.message}.  See the inner error for additional information`,
        'athena',
        'getPagedQueryResults',
        err
      );
      this.emit('error', e);
    } finally {
      //if we hit an error condition this will ensure that we stop reading data and the pipeline will complete
      yield null;
    }
  }
  override async _read(): Promise<void> {
    const data = await this.dataIterator.next();
    this.push(data.value);
  }
}

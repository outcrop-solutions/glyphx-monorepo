import {Readable} from 'stream';
import {AthenaManager} from '../aws/athenaManager';
import {AthenaClient, GetQueryResultsCommand, DATA_CATALOG_NAME} from '@aws-sdk/client-athena';
export class AthenaQueryReadStream extends Readable {
  private readonly query: string;
  private readonly athenaManager: AthenaManager;
  private readonly athenaClient: AthenaClient;

  constructor(athenaManager: AthenaManager, query: string) {
    super();
    this.query = query;
    this.athenaManager = athenaManager;
    this.athenaClient = this.athenaManager.athenaClient;
	
  }

  override async _read(): Promise<void> {
	  const params = {
  		QueryString: this.query,
		QueryExecutionContext: {
			Database: this.athenaManager.databaseName,
			Catalog: DATA_CATALOG_NAME
		},
		ClientRequestToken: Date.now().toString(),
		QueryExecutionId: Date.now().toString(),
};

// Execute the Athena query and get the results as a stream
const command = new GetQueryResultsCommand(params);
const paginator = this.athenaClient.paginate(command);
	this.push(

  }
}

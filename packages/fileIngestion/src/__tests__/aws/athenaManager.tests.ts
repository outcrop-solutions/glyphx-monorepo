import {assert} from 'chai';
import {AthenaManager} from '@aws';
//eslint-disable-next-line
import {mockClient} from 'aws-sdk-client-mock';
import {
  GetDatabaseCommand,
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
} from '@aws-sdk/client-athena';
import ResultSetMock from './resultSetMocks.json';
import {error} from '@glyphx/core';

describe('#aws/AthenaManager', () => {
  context('init', () => {
    let athenaMock: any;

    beforeEach(() => {
      athenaMock = mockClient(AthenaClient);
    });

    afterEach(() => {
      athenaMock.restore();
    });
    it('should successfully initialize our athena manager', async () => {
      athenaMock.on(GetDatabaseCommand).resolves(true as any);
      const athenaManager = new AthenaManager('jpstestdatabase');
      let errored = false;
      try {
        await athenaManager.init();
      } catch (err) {
        errored = true;
      }

      assert.isFalse(errored);
      assert.isTrue(athenaManager.inited);
    });

    it('should throw an InvalidArgumentError when Athena throws an exception', async () => {
      const errorMessage = 'oops I did it again';
      athenaMock.on(GetDatabaseCommand).rejects(errorMessage);

      const athenaManager = new AthenaManager('jpstestdatabase');
      let errored = false;
      try {
        await athenaManager.init();
      } catch (err) {
        errored = true;
        assert.instanceOf(err, error.InvalidArgumentError);
        assert.strictEqual((err as any).innerError.message, errorMessage);
      }

      assert.isTrue(errored);
      assert.isFalse(athenaManager.inited);
    });
  });

  context('Run Query', () => {
    let athenaMock: any;

    beforeEach(() => {
      athenaMock = mockClient(AthenaClient);
    });

    afterEach(() => {
      athenaMock.restore();
    });
    it('Should run a command with no results', async () => {
      athenaMock.on(GetDatabaseCommand).resolves(true as any);
      athenaMock.on(StartQueryExecutionCommand).resolves({
        QueryExecutionId: 'some random id',
      });

      athenaMock.on(GetQueryExecutionCommand).resolves({
        QueryExecution: {
          Status: {
            State: 'SUCCEEDED',
          },
        },
      });

      athenaMock.on(GetQueryResultsCommand).resolves({
        ResultSet: {
          ResultSetMetadata: {
            ColumnInfo: [],
          },
          Rows: [],
        },
      });

      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      const queryResults = await athenaManager.runQuery(
        "Create a table syntaz doesn't matter"
      );

      assert.isArray(queryResults);
      assert.strictEqual(queryResults.length, 0);
    });
    it('Should run our query and send back results', async () => {
      athenaMock.on(GetDatabaseCommand).resolves(true as any);
      athenaMock.on(StartQueryExecutionCommand).resolves({
        QueryExecutionId: 'some random id',
      });

      athenaMock.on(GetQueryExecutionCommand).resolves({
        QueryExecution: {
          Status: {
            State: 'SUCCEEDED',
          },
        },
      });

      athenaMock.on(GetQueryResultsCommand).resolves(ResultSetMock);

      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      const queryResults = await athenaManager.runQuery(
        'SELECT * FROM someTable LIMIT 100'
      );

      assert.isArray(queryResults);
      assert.strictEqual(queryResults.length, 100);
    });
    it('Should throw an exception when AthenaClient throws an exception', async () => {
      athenaMock.on(GetDatabaseCommand).resolves(true as any);
      athenaMock.on(StartQueryExecutionCommand).resolves({
        QueryExecutionId: 'some random id',
      });

      athenaMock.on(GetQueryExecutionCommand).rejects('An Error has occurred');
      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();

      let hasErrored = false;
      try {
        await athenaManager.runQuery('SELECT * FROM someTable LIMIT 100');
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        hasErrored = true;
      }

      assert.isTrue(hasErrored);
    });

    it('Throw a QueryTimeout error', async () => {
      athenaMock.on(GetDatabaseCommand).resolves(true as any);
      athenaMock.on(StartQueryExecutionCommand).resolves({
        QueryExecutionId: 'some random id',
      });

      athenaMock.on(GetQueryExecutionCommand).resolves({
        QueryExecution: {
          Status: {
            State: 'RUNNING',
          },
        },
      });

      athenaMock.on(GetQueryResultsCommand).resolves(ResultSetMock);

      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      let hasErrored = false;
      try {
        await athenaManager.runQuery('SELECT * FROM someTable LIMIT 100', 0.1);
      } catch (err) {
        assert.instanceOf(err, error.QueryTimeoutError);
        hasErrored = true;
      }

      assert.isTrue(hasErrored);
    });
  });

  context('acessors', () => {
    it('will throw an InvalidOperationException if the athenaClient accessor is called before init is called', () => {
      const athenaManager = new AthenaManager('jpstestdatabase');
      let hasErrored = false;
      try {
        athenaManager.athenaClient;
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        hasErrored = true;
      }

      assert.isTrue(hasErrored);
    });
  });
});

import 'mocha';
import {assert} from 'chai';
import {AthenaManager} from '../../aws';
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
import * as error from '../../error';
import {createSandbox} from 'sinon';
import {fileIngestion} from '@glyphx/types';
import {ResultSetConverter} from '../../aws/util/resultsetConverter';

describe('#aws/AthenaManager', () => {
  context('init', () => {
    let athenaMock: any;

    beforeEach(() => {
      athenaMock = mockClient(AthenaClient as any);
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
    const sandbox = createSandbox();

    beforeEach(() => {
      athenaMock = mockClient(AthenaClient as any);
    });

    afterEach(() => {
      athenaMock.restore();
      sandbox.restore();
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
        assert.instanceOf(err, error.QueryExecutionError);
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

    it('Should throw an invalidOperationError when an unexpected eror is thrown', async () => {
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

      sandbox.replace(
        ResultSetConverter,
        'fromResultset',
        sandbox.stub().throws('oops I did it again')
      );
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

  context('tableExists', () => {
    const sandbox = createSandbox();
    beforeEach(() => {
      sandbox.replace(
        AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(undefined as void)
      );
    });

    afterEach(() => {
      sandbox.restore();
    });
    it('will return true when a table exists', async () => {
      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();

      sandbox.replace(
        athenaManager,
        'runQuery',
        sandbox.fake.resolves([{tab_name: 'table1'}])
      );

      assert.isTrue(await athenaManager.tableExists('sometable'));
    });
    it('will return false when a table does not exist', async () => {
      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();

      sandbox.replace(athenaManager, 'runQuery', sandbox.fake.resolves([]));

      assert.isFalse(await athenaManager.tableExists('sometable'));
    });

    it('will not catch or process an error from runQuery', async () => {
      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      const errorString = 'Oops I did it again';
      sandbox.replace(
        athenaManager,
        'runQuery',
        sandbox.fake.rejects(errorString)
      );
      let errored = false;
      try {
        await athenaManager.tableExists('sometable');
      } catch (err) {
        assert.strictEqual((err as any).message, errorString);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
  context('viewExists', () => {
    const sandbox = createSandbox();
    beforeEach(() => {
      sandbox.replace(
        AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(undefined as void)
      );
    });

    afterEach(() => {
      sandbox.restore();
    });
    it('will return true when a viewexists', async () => {
      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();

      sandbox.replace(
        athenaManager,
        'runQuery',
        sandbox.fake.resolves([{tab_name: 'table1'}])
      );

      assert.isTrue(await athenaManager.viewExists('sometable'));
    });
    it('will return false when a viewdoes not exist', async () => {
      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();

      sandbox.replace(athenaManager, 'runQuery', sandbox.fake.resolves([]));

      assert.isFalse(await athenaManager.viewExists('sometable'));
    });

    it('will not catch or process an error from runQuery', async () => {
      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      const errorString = 'Oops I did it again';
      sandbox.replace(
        athenaManager,
        'runQuery',
        sandbox.fake.rejects(errorString)
      );
      let errored = false;
      try {
        await athenaManager.viewExists('sometable');
      } catch (err) {
        assert.strictEqual((err as any).message, errorString);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('dropTable', () => {
    const sandbox = createSandbox();
    beforeEach(() => {
      sandbox.replace(
        AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(undefined as void)
      );
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('will drop the table', async () => {
      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      sandbox.replace(athenaManager, 'runQuery', sandbox.fake.resolves([]));
      let errored = false;
      try {
        await athenaManager.dropTable('sometable');
      } catch (err) {
        errored = true;
      }

      assert.isFalse(errored);
    });
    it('will not catch or process an error from runQuery', async () => {
      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      const errorString = 'Oops I did it again';
      sandbox.replace(
        athenaManager,
        'runQuery',
        sandbox.fake.rejects(errorString)
      );
      let errored = false;
      try {
        await athenaManager.dropTable('sometable');
      } catch (err) {
        assert.strictEqual((err as any).message, errorString);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
  context('dropView', () => {
    const sandbox = createSandbox();
    beforeEach(() => {
      sandbox.replace(
        AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(undefined as void)
      );
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('will drop the view', async () => {
      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      sandbox.replace(athenaManager, 'runQuery', sandbox.fake.resolves([]));
      let errored = false;
      try {
        await athenaManager.dropView('sometable');
      } catch (err) {
        errored = true;
      }

      assert.isFalse(errored);
    });
    it('will not catch or process an error from runQuery', async () => {
      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      const errorString = 'Oops I did it again';
      sandbox.replace(
        athenaManager,
        'runQuery',
        sandbox.fake.rejects(errorString)
      );
      let errored = false;
      try {
        await athenaManager.dropView('sometable');
      } catch (err) {
        assert.strictEqual((err as any).message, errorString);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('getTableDescription', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    it('will get a table description', async () => {
      sandbox.replace(
        AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );

      sandbox.replace(
        AthenaManager.prototype,
        'runQuery',
        sandbox.fake.resolves([
          {col_name: 'col1      \tbigint\t'},
          {col_name: 'col2      \tstring\t'},
          {col_name: 'col3      \tdouble\t'},
          {col_name: 'col4      \tvarchar(100)\t'},
        ])
      );

      const athenaManager = new AthenaManager('glyphx-etl-db');
      await athenaManager.init();

      const r = await athenaManager.getTableDescription(
        '-etl-data-lake-csv-9ea5173fc201fb5a489bffc6a3c642eb'
      );

      assert.isArray(r);
      assert.strictEqual(r.length, 4);

      assert.strictEqual(r[0].columnName, 'col1');
      assert.strictEqual(
        r[0].columnType,
        fileIngestion.constants.FIELD_TYPE.INTEGER
      );

      assert.strictEqual(r[1].columnName, 'col2');
      assert.strictEqual(
        r[1].columnType,
        fileIngestion.constants.FIELD_TYPE.STRING
      );

      assert.strictEqual(r[2].columnName, 'col3');
      assert.strictEqual(
        r[2].columnType,
        fileIngestion.constants.FIELD_TYPE.NUMBER
      );
      assert.strictEqual(r[3].columnName, 'col4');
      assert.strictEqual(
        r[3].columnType,
        fileIngestion.constants.FIELD_TYPE.STRING
      );
    });

    it('will throw an invalidOperationException when it encounters an unknown column type', async () => {
      sandbox.replace(
        AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(true as unknown as void)
      );

      sandbox.replace(
        AthenaManager.prototype,
        'runQuery',
        sandbox.fake.resolves([
          {col_name: 'col1      \tfoo\t'},
          {col_name: 'col2      \tstring\t'},
          {col_name: 'col3      \tdouble\t'},
        ])
      );

      const athenaManager = new AthenaManager('glyphx-etl-db');
      await athenaManager.init();
      let errored = false;
      try {
        await athenaManager.getTableDescription(
          '-etl-data-lake-csv-9ea5173fc201fb5a489bffc6a3c642eb'
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
  context('StartQuery', () => {
    let athenaMock: any;

    beforeEach(() => {
      athenaMock = mockClient(AthenaClient as any);
    });

    afterEach(() => {
      athenaMock.restore();
    });
    it('Should successfully start a query', async () => {
      const queryId = 'testQueryId';
      athenaMock.on(GetDatabaseCommand).resolves(true as any);
      athenaMock.on(StartQueryExecutionCommand).resolves({
        QueryExecutionId: queryId,
      });

      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      const startedQueryId = await athenaManager.startQuery(
        "Select * from  a table syntax doesn't matter"
      );

      assert.strictEqual(startedQueryId, queryId);
    });

    it('Should throw a QueryExecutionError when the underlying connection fails', async () => {
      athenaMock.on(GetDatabaseCommand).resolves(true as any);
      athenaMock
        .on(StartQueryExecutionCommand)
        .rejects('something bad happened');

      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      let errored = false;
      try {
        await athenaManager.startQuery(
          "Select * from  a table syntax doesn't matter"
        );
      } catch (err) {
        assert.instanceOf(err, error.QueryExecutionError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('getQueryStatus', () => {
    let athenaMock: any;

    beforeEach(() => {
      athenaMock = mockClient(AthenaClient as any);
    });

    afterEach(() => {
      athenaMock.restore();
    });

    it('Should report that the query has succeeded ', async () => {
      const queryId = 'testQueryId';
      const queryState = 'SUCCEEDED';
      athenaMock.on(GetDatabaseCommand).resolves(true as any);

      athenaMock.on(GetQueryExecutionCommand).resolves({
        QueryExecution: {
          Status: {
            State: queryState,
          },
        },
      });

      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      const queryStatus = await athenaManager.getQueryStatus(queryId);

      assert.strictEqual(queryStatus.QueryExecution?.Status?.State, queryState);
    });

    it('Should throw a QueryExecutionError if the underlying connection throws an error ', async () => {
      const queryId = 'testQueryId';
      const queryState = 'SUCCEEDED';
      athenaMock.on(GetDatabaseCommand).resolves(true as any);

      athenaMock.on(GetQueryExecutionCommand).rejects('something bad happened');

      const athenaManager = new AthenaManager('jpstestdatabase');
      await athenaManager.init();
      let errored = false;
      try {
        await athenaManager.getQueryStatus(queryId);
      } catch (err) {
        assert.instanceOf(err, error.QueryExecutionError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
});

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

    beforeEach(() => {
      athenaMock = mockClient(AthenaClient as any);
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
});

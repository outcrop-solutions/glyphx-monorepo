import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {error, aws} from 'core';
import {QueryRunner} from '../../io/queryRunner';
import {QUERY_STATUS} from '../../constants';

describe('#io/QueryRunner', () => {
  context('constructor', () => {
    it('will construct a new QueryRunner', () => {
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn) as any;
      assert.strictEqual(queryRunner.viewName, viewName);
      assert.strictEqual(queryRunner.xColumn, xColumn);
      assert.strictEqual(queryRunner.yColumn, yColumn);
      assert.strictEqual(queryRunner.zColumn, zColumn);
      assert.strictEqual(queryRunner.databaseName, databaseName);
      assert.instanceOf(queryRunner.athenaManager, aws.AthenaManager);
      assert.isFalse(queryRunner.inited);
    });
  });

  context('init', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will initialize the query runner', async () => {
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn) as any;
      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').resolves();
      await queryRunner.init();
      assert.isTrue(initStub.calledOnce);
      assert.isTrue(queryRunner.inited);
    });

    it('will only initialize the query runner once', async () => {
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn) as any;
      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').resolves();
      await queryRunner.init();
      await queryRunner.init();
      assert.isTrue(initStub.calledOnce);
      assert.isTrue(queryRunner.inited);
    });

    it('will pass through an error if the underlying athena init errors', async () => {
      const err = new error.GlyphxError('An Error has occurred', 999);
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn) as any;
      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').rejects(err);
      let errored = false;
      try {
        await queryRunner.init();
      } catch (e) {
        assert.strictEqual(err, e);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(initStub.calledOnce);
    });
  });

  context('startQuery', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    const regexString =
      'WITH\\s*temp\\s*as\\s*\\(SELECT\\s*(\\w*)\\s*as\\s*"rowid",\\s*"(\\w*)","(\\w*)","(\\w*)"\\s*FROM\\s*"(\\w*)"\\."(\\w*)"(.*)\\)\\s*SELECT\\s*array_join\\(array_agg\\(rowid\\)\\s*,\\s*\'\\|\'\\)\\s*as\\s*"rowids",\\s*"(\\w*)",\\s*"(\\w*)",\\s*SUM\\("(\\w*)"\\)\\s*as\\s*"(\\w*)"\\s*FROM\\s*temp\\s*GROUP\\s*BY\\s*"(\\w*)",\\s*"(\\w*)';

    it('will start a query', async () => {
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn) as any;

      const queryId = 'testQueryId';
      const queryStub = sandbox.stub(queryRunner.athenaManager, 'startQuery').resolves(queryId);
      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').resolves();
      await queryRunner.init();
      const result = await queryRunner.startQuery();
      assert.strictEqual(result, queryId);
      assert.isTrue(queryStub.calledOnce);
      const query = queryStub.getCall(0).args[0];

      const queryRegex = new RegExp(regexString, 'gm');
      const match = queryRegex.exec(query) as string[];
      assert.isNotEmpty(match);
      assert.strictEqual(match.length, 14);
      assert.strictEqual(match[1], 'glyphx_id__');
      assert.strictEqual(match[2], xColumn);
      assert.strictEqual(match[3], yColumn);
      assert.strictEqual(match[4], zColumn);
      assert.strictEqual(match[5], databaseName);
      assert.strictEqual(match[6], viewName);
      //No filter in this test
      assert.isEmpty(match[7].trim());
      assert.strictEqual(match[8], xColumn);
      assert.strictEqual(match[9], yColumn);
      assert.strictEqual(match[10], zColumn);
      assert.strictEqual(match[11], zColumn);
      assert.strictEqual(match[12], xColumn);
      assert.strictEqual(match[13], yColumn);
      assert.isTrue(initStub.calledOnce);
    });

    it('will start a query with a filter', async () => {
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const filter = 'foo = bar';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn, filter) as any;

      const queryId = 'testQueryId';
      const queryStub = sandbox.stub(queryRunner.athenaManager, 'startQuery').resolves(queryId);
      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').resolves();
      await queryRunner.init();
      const result = await queryRunner.startQuery();
      assert.strictEqual(result, queryId);
      assert.isTrue(queryStub.calledOnce);
      const query = queryStub.getCall(0).args[0];

      const queryRegex = new RegExp(regexString, 'gm');
      const match = queryRegex.exec(query) as string[];
      assert.isNotEmpty(match);
      assert.strictEqual(match.length, 14);
      assert.strictEqual(match[1], 'glyphx_id__');
      assert.strictEqual(match[2], xColumn);
      assert.strictEqual(match[3], yColumn);
      assert.strictEqual(match[4], zColumn);
      assert.strictEqual(match[5], databaseName);
      assert.strictEqual(match[6], viewName);
      assert.strictEqual(match[7].trim(), `WHERE ${filter}`);
      assert.strictEqual(match[8], xColumn);
      assert.strictEqual(match[9], yColumn);
      assert.strictEqual(match[10], zColumn);
      assert.strictEqual(match[11], zColumn);
      assert.strictEqual(match[12], xColumn);
      assert.strictEqual(match[13], yColumn);
      assert.isTrue(initStub.calledOnce);
    });
    it('will pass through an error when the underlying connection throws an error', async () => {
      const err = new error.GlyphxError('An Error has occurred', 999);
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn) as any;

      const queryStub = sandbox.stub(queryRunner.athenaManager, 'startQuery').rejects(err);
      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').resolves();
      await queryRunner.init();
      let errored = false;
      try {
        await queryRunner.startQuery();
      } catch (e) {
        assert.strictEqual(err, e);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(queryStub.calledOnce);
      assert.isTrue(initStub.calledOnce);
    });
  });

  context('getQueryStatus', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will get the success status of a query', async () => {
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn) as any;

      const queryId = 'testQueryId';

      queryRunner.queryId = queryId;

      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').resolves();
      await queryRunner.init();

      const queryStub = sandbox.stub(queryRunner.athenaManager, 'getQueryStatus').resolves({
        QueryExecution: {
          Status: {
            State: 'SUCCEEDED',
          },
        },
      });
      const result = await queryRunner.getQueryStatus();
      assert.strictEqual(result.status, 'SUCCEEDED');
      assert.isTrue(queryStub.calledOnce);
      assert.isTrue(initStub.calledOnce);
    });

    it('will get the failed status of a query', async () => {
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn) as any;

      const queryId = 'testQueryId';

      queryRunner.queryId = queryId;

      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').resolves();
      await queryRunner.init();

      const errorMessage = 'I Have Failed';
      const queryStub = sandbox.stub(queryRunner.athenaManager, 'getQueryStatus').resolves({
        QueryExecution: {
          Status: {
            State: 'FAILED',
            AthenaError: {
              ErrorMessage: errorMessage,
            },
          },
        },
      });
      const result = await queryRunner.getQueryStatus();
      assert.strictEqual(result.status, 'FAILED');
      assert.strictEqual(result.error, errorMessage);
      assert.isTrue(queryStub.calledOnce);
      assert.isTrue(initStub.calledOnce);
    });

    it('will not try to get a new status if the result is already SUCCEEDED', async () => {
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn) as any;

      const queryId = 'testQueryId';

      queryRunner.queryId = queryId;
      queryRunner.queryStatusField = {status: QUERY_STATUS.SUCCEEDED};
      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').resolves();
      await queryRunner.init();

      const errorMessage = 'I Have Failed';
      const queryStub = sandbox.stub(queryRunner.athenaManager, 'getQueryStatus').resolves({
        QueryExecution: {
          Status: {
            State: 'FAILED',
            AthenaError: {
              ErrorMessage: errorMessage,
            },
          },
        },
      });
      const result = await queryRunner.getQueryStatus();
      assert.strictEqual(result.status, 'SUCCEEDED');
      assert.isFalse(queryStub.called);
      assert.isTrue(initStub.calledOnce);
    });

    it('will not try to get a new status if the result is already iFAILED', async () => {
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn) as any;

      const queryId = 'testQueryId';

      queryRunner.queryId = queryId;
      queryRunner.queryStatusField = {status: QUERY_STATUS.FAILED};
      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').resolves();
      await queryRunner.init();

      const queryStub = sandbox.stub(queryRunner.athenaManager, 'getQueryStatus').resolves({
        QueryExecution: {
          Status: {
            State: 'SUCCEEDED',
          },
        },
      });
      const result = await queryRunner.getQueryStatus();
      assert.strictEqual(result.status, 'FAILED');
      assert.isFalse(queryStub.called);
      assert.isTrue(initStub.calledOnce);
    });

    it('will set the status to UNKNOWN if it does not understand the response from athena', async () => {
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn) as any;

      const queryId = 'testQueryId';

      queryRunner.queryId = queryId;

      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').resolves();
      await queryRunner.init();

      const queryStub = sandbox.stub(queryRunner.athenaManager, 'getQueryStatus').resolves({
        QueryExecution: {
          Status: {
            State: 'FOO',
          },
        },
      });
      const result = await queryRunner.getQueryStatus();
      assert.strictEqual(result.status, 'UNKNOWN');
      assert.isTrue(queryStub.calledOnce);
      assert.isTrue(initStub.calledOnce);
    });

    it('will set the status to UNKNOWN if it does not get a response from athena', async () => {
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn) as any;

      const queryId = 'testQueryId';

      queryRunner.queryId = queryId;

      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').resolves();
      await queryRunner.init();

      const queryStub = sandbox.stub(queryRunner.athenaManager, 'getQueryStatus').resolves({
        QueryExecution: {},
      });
      const result = await queryRunner.getQueryStatus();
      assert.strictEqual(result.status, 'UNKNOWN');
      assert.isTrue(queryStub.calledOnce);
      assert.isTrue(initStub.calledOnce);
    });

    it('Will throw an InvalidOperationError if the queryId has not been set', async () => {
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const queryRunner = new QueryRunner(databaseName, viewName, xColumn, yColumn, zColumn) as any;

      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').resolves();
      await queryRunner.init();

      const queryStub = sandbox.stub(queryRunner.athenaManager, 'getQueryStatus').resolves({
        QueryExecution: {},
      });
      let errored = false;
      try {
        await queryRunner.getQueryStatus();
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isFalse(queryStub.called);
      assert.isTrue(initStub.calledOnce);
    });
  });
});

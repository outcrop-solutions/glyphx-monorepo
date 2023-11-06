import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {error, aws} from 'core';
import {QueryRunner} from '../../io/queryRunner';
import {QUERY_STATUS} from '../../constants';
import {glyphEngineTypes} from 'types';

describe('#io/QueryRunner', () => {
  context('constructor', () => {
    it('will construct a new QueryRunner', () => {
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;
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
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;
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
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;
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
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;
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

  context('getAccumulatorFunction', () => {
    const viewName = 'testViewName';
    const xColumn = 'testXColumn';
    const yColumn = 'testYColumn';
    const zColumn = 'testZColumn';
    const databaseName = 'testDatabaseName';
    const isXDate = false;
    const isYDate = false;
    const isZDate = false;
    const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
    const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
    const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

    const queryRunner = new QueryRunner({
      databaseName,
      viewName,
      xColumn,
      yColumn,
      zColumn,
      isXDate,
      isYDate,
      isZDate,
      xDateGrouping,
      yDateGrouping,
      zAccumulatorType,
    }) as any;

    it('should return the correct AVG function', () => {
      const result = queryRunner.getAccumulatorFunction('testColumn', glyphEngineTypes.constants.ACCUMULATOR_TYPE.AVG);
      assert.strictEqual(result, 'AVG("testColumn")');
    });

    it('should return the correct MIN function', () => {
      const result = queryRunner.getAccumulatorFunction('testColumn', glyphEngineTypes.constants.ACCUMULATOR_TYPE.MIN);
      assert.strictEqual(result, 'MIN("testColumn")');
    });

    it('should return the correct MAX function', () => {
      const result = queryRunner.getAccumulatorFunction('testColumn', glyphEngineTypes.constants.ACCUMULATOR_TYPE.MAX);
      assert.strictEqual(result, 'MAX("testColumn")');
    });

    it('should return the correct COUNT function', () => {
      const result = queryRunner.getAccumulatorFunction(
        'testColumn',
        glyphEngineTypes.constants.ACCUMULATOR_TYPE.COUNT
      );
      assert.strictEqual(result, 'COUNT("testColumn")');
    });

    it('should return the correct SUM function', () => {
      const result = queryRunner.getAccumulatorFunction('testColumn', glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM);
      assert.strictEqual(result, 'SUM("testColumn")');
    });
  });

  context('getDateGroupingFunction', () => {
    const viewName = 'testViewName';
    const xColumn = 'testXColumn';
    const yColumn = 'testYColumn';
    const zColumn = 'testZColumn';
    const databaseName = 'testDatabaseName';
    const isXDate = false;
    const isYDate = false;
    const isZDate = false;
    const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
    const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
    const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

    const queryRunner = new QueryRunner({
      databaseName,
      viewName,
      xColumn,
      yColumn,
      zColumn,
      isXDate,
      isYDate,
      isZDate,
      xDateGrouping,
      yDateGrouping,
      zAccumulatorType,
    }) as any;
    it('should return the correct DAY_OF_YEAR function', () => {
      const result = queryRunner.getDateGroupingFunction(
        'testDateColumn',
        glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR
      );
      assert.strictEqual(result, 'DATE_FORMAT("testDateColumn", \'%Y-%j\')');
    });

    it('should return the correct DAY_OF_MONTH function', () => {
      const result = queryRunner.getDateGroupingFunction(
        'testDateColumn',
        glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_MONTH
      );
      assert.strictEqual(result, 'DAY("testDateColumn")');
    });

    it('should return the correct DAY_OF_WEEK function', () => {
      const result = queryRunner.getDateGroupingFunction(
        'testDateColumn',
        glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_WEEK
      );
      assert.strictEqual(result, 'CAST(EXTRACT(DOW FROM "testDateColumn") AS INTEGER)');
    });

    it('should return the correct WEEK_OF_YEAR function', () => {
      const result = queryRunner.getDateGroupingFunction(
        'testDateColumn',
        glyphEngineTypes.constants.DATE_GROUPING.WEEK_OF_YEAR
      );
      assert.strictEqual(result, 'WEEK("testDateColumn")');
    });

    it('should return the correct MONTH_OF_YEAR function', () => {
      const result = queryRunner.getDateGroupingFunction(
        'testDateColumn',
        glyphEngineTypes.constants.DATE_GROUPING.MONTH_OF_YEAR
      );
      assert.strictEqual(result, 'MONTH("testDateColumn")');
    });

    it('should return the correct YEAR function', () => {
      const result = queryRunner.getDateGroupingFunction(
        'testDateColumn',
        glyphEngineTypes.constants.DATE_GROUPING.YEAR
      );
      assert.strictEqual(result, 'YEAR("testDateColumn")');
    });

    it('should return the correct QUARTER function', () => {
      const result = queryRunner.getDateGroupingFunction(
        'testDateColumn',
        glyphEngineTypes.constants.DATE_GROUPING.QUARTER
      );
      assert.strictEqual(result, 'QUARTER("testDateColumn")');
    });

    it('should return the original column name when an unknown date grouping is provided', () => {
      const result = queryRunner.getDateGroupingFunction('testDateColumn', 'UNKNOWN_GROUPING');
      assert.strictEqual(result, '"testDateColumn"');
    });
  });

  context('startQuery', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will start a query', async () => {
      const regexString = `WITH\\s*temp\\s*as\\s*\\(\\s*SELECT\\s*glyphx_id__\\s*as\\s*rowid,\\s*"([^"]+)"\\s*as\\s*groupedXColumn,\\s*"([^"]+)"\\s*as\\s*groupedYColumn,\\s*"([^"]+)"\\s*as\\s*zColumn\\s*FROM\\s*"([^"]+)"\\."([^"]+)"\\s*\\)\\s*SELECT\\s*array_join\\(array_agg\\(rowid\\),\\s*'\\|'\\)\\s*as\\s*"rowids",\\s*groupedXColumn,\\s*groupedYColumn,\\s*SUM\\("([^"]+)"\\)\\s*as\\s*zValue\\s*FROM\\s*temp\\s*GROUP\\s*BY\\s*groupedXColumn,\\s*groupedYColumn;`;
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;

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
      assert.strictEqual(match.length, 7); // There are only 7 capture groups in the regex provided
      assert.strictEqual(match[1], xColumn); // The expected value for groupedXColumn
      assert.strictEqual(match[2], yColumn); // The expected value for groupedYColumn
      assert.strictEqual(match[3], zColumn); // The expected value for zColumn
      assert.strictEqual(match[4], databaseName); // The expected value for the database name
      assert.strictEqual(match[5], viewName); // The expected value for the view name
      assert.strictEqual(match[6], zColumn); // The expected column name used in the SUM function
      assert.isTrue(initStub.calledOnce);
    });

    it('will start a query where x and y are dates', async () => {
      const regexString = `WITH\\s*temp\\s*as\\s*\\(\\s*SELECT\\s*glyphx_id__\\s*as\\s*rowid,\\s*(DATE_FORMAT\\("([^"]+)",\\s*'[^']+'\\)|"[^"]+")\\s*as\\s*groupedXColumn,\\s*(DATE_FORMAT\\("([^"]+)",\\s*'[^']+'\\)|"[^"]+")\\s*as\\s*groupedYColumn,\\s*"([^"]+)"\\s*as\\s*zColumn\\s*FROM\\s*"([^"]+)"\\."([^"]+)"\\s*\\)\\s*SELECT\\s*array_join\\(array_agg\\(rowid\\),\\s*'\\|'\\)\\s*as\\s*"rowids",\\s*groupedXColumn,\\s*groupedYColumn,\\s*SUM\\("([^"]+)"\\)\\s*as\\s*zValue\\s*FROM\\s*temp\\s*GROUP\\s*BY\\s*groupedXColumn,\\s*groupedYColumn;`;

      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const isXDate = true;
      const isYDate = true;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;

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
      assert.strictEqual(match.length, 9); // There are only 7 capture groups in the regex provided
      assert.strictEqual(match[1], `DATE_FORMAT("${xColumn}", '%Y-%j')`);
      assert.strictEqual(match[3], `DATE_FORMAT("${yColumn}", '%Y-%j')`);
      assert.strictEqual(match[5], zColumn); // The expected value for zColumn
      assert.strictEqual(match[6], databaseName); // The expected value for the database name
      assert.strictEqual(match[7], viewName); // The expected value for the view name
      assert.strictEqual(match[8], zColumn); // The expected column name used in the SUM function
      assert.isTrue(initStub.calledOnce);
    });

    it('will start a query with a filter', async () => {
      const regexStringWFilter = `WITH\\s*temp\\s*as\\s*\\(\\s*SELECT\\s*glyphx_id__\\s*as\\s*rowid,\\s*"([^"]+)"\\s*as\\s*groupedXColumn,\\s*"([^"]+)"\\s*as\\s*groupedYColumn,\\s*"([^"]+)"\\s*as\\s*zColumn\\s*FROM\\s*"([^"]+)"\\."([^"]+)"(\\s+WHERE\\s+.+?)?\\s*\\)\\s*SELECT\\s*array_join\\(array_agg\\(rowid\\),\\s*'\\|'\\)\\s*as\\s*"rowids",\\s*groupedXColumn,\\s*groupedYColumn,\\s*SUM\\("([^"]+)"\\)\\s*as\\s*zValue\\s*FROM\\s*temp\\s*GROUP\\s*BY\\s*groupedXColumn,\\s*groupedYColumn;
`;
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const filter = 'foo = bar';
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
        filter,
      }) as any;

      const queryId = 'testQueryId';
      const queryStub = sandbox.stub(queryRunner.athenaManager, 'startQuery').resolves(queryId);
      const initStub = sandbox.stub(queryRunner.athenaManager, 'init').resolves();
      await queryRunner.init();
      const result = await queryRunner.startQuery();
      assert.strictEqual(result, queryId);
      assert.isTrue(queryStub.calledOnce);
      const query = queryStub.getCall(0).args[0];

      const queryRegex = new RegExp(regexStringWFilter, 'gm');
      const match = queryRegex.exec(query) as string[];
      assert.isNotEmpty(match);
      assert.strictEqual(match.length, 8); // Adjust this to the actual number of capturing groups in your regex.
      assert.strictEqual(match[1], xColumn); // groupedXColumn
      assert.strictEqual(match[2], yColumn); // groupedYColumn
      assert.strictEqual(match[3], zColumn); // zColumn
      assert.strictEqual(match[4], databaseName); // Database name
      assert.strictEqual(match[5], viewName); // View name
      assert.strictEqual(match[7], zColumn); // Column name in SUM function
      // If the filter is expected to be present, check for it
      assert.include(query, `WHERE ${filter}`); // Checks if the WHERE clause is present in the query

      assert.isTrue(initStub.calledOnce);
    });
    it('will pass through an error when the underlying connection throws an error', async () => {
      const err = new error.GlyphxError('An Error has occurred', 999);
      const viewName = 'testViewName';
      const xColumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';
      const databaseName = 'testDatabaseName';
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;

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
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;

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
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;

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
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;

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
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;

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
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;

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
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;

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
      const isXDate = false;
      const isYDate = false;
      const isZDate = false;
      const xDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const yDateGrouping = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const zAccumulatorType = glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

      const queryRunner = new QueryRunner({
        databaseName,
        viewName,
        xColumn,
        yColumn,
        zColumn,
        isXDate,
        isYDate,
        isZDate,
        xDateGrouping,
        yDateGrouping,
        zAccumulatorType,
      }) as any;

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

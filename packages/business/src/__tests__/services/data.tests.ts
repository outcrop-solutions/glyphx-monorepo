import 'mocha';
import {assert} from 'chai';
import {dataService, projectService} from '../../services';
import {createSandbox} from 'sinon';
import athenaConnection from '../../lib/athenaConnection';
import {aws, error} from 'core';
import {fileIngestionTypes, databaseTypes} from 'types';

class MockAthenaConnection {
  private readonly retrunedValue: any;
  private readonly throwValue: boolean;

  constructor(returnedValue: any, throwValue = false) {
    this.retrunedValue = returnedValue;
    this.throwValue = throwValue;
  }

  async runQuery(): Promise<Record<string, any>[]> {
    if (this.throwValue) throw this.retrunedValue;
    else return this.retrunedValue as unknown as Record<string, any>[];
  }
}

describe('#services/data', () => {
  context('getDataByGlyphxIds', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    it('will get the row count from the table', async () => {
      const value = [
        {col1: 'value1', col2: 'value2'},
        {col1: 'value3', col2: 'value4'},
        {col1: 'value5', col2: 'value6'},
        {col1: 'value7', col2: 'value8'},
        {col1: 'value9', col2: 'value10'},
      ];
      sandbox.replaceGetter(
        athenaConnection,
        'connection',
        () => new MockAthenaConnection(value) as unknown as aws.AthenaManager
      );

      const result = await dataService.getDataByGlyphxIds('testProjectName', 'testTableName', [1, 2, 3, 4, 5]);

      assert.deepEqual(result, value);
    });

    it('will publish and throw a DataServiceError when one of the underlyiong methods throws an error', async () => {
      const value = 'something bad has happened';
      sandbox.replaceGetter(
        athenaConnection,
        'connection',
        () => new MockAthenaConnection(value, true) as unknown as aws.AthenaManager
      );
      let didPublish = false;
      function fakePublish() {
        didPublish = true;
      }

      const publishOverride = sandbox.stub();
      publishOverride.callsFake(fakePublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);
      let errored = false;
      try {
        await dataService.getDataByGlyphxIds('testProjectName', 'testTableName', [1, 2, 3, 4, 5]);
      } catch (err) {
        assert.instanceOf(err, error.DataServiceError);
        errored = true;
      }

      assert.isTrue(errored);
      assert.isTrue(didPublish);
    });
  });

  context('getDataByTableName', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    it('will get the row count from the table', async () => {
      const value = [
        {col1: 'value1', col2: 'value2'},
        {col1: 'value3', col2: 'value4'},
        {col1: 'value5', col2: 'value6'},
        {col1: 'value7', col2: 'value8'},
        {col1: 'value9', col2: 'value10'},
      ];
      sandbox.replaceGetter(
        athenaConnection,
        'connection',
        () => new MockAthenaConnection(value) as unknown as aws.AthenaManager
      );

      const result = await dataService.getDataByTableName('testTableName');

      assert.deepEqual(result, value);
    });

    it('will publish and throw a DataServiceError when one of the underlyiong methods throws an error', async () => {
      const value = 'something bad has happened';
      sandbox.replaceGetter(
        athenaConnection,
        'connection',
        () => new MockAthenaConnection(value, true) as unknown as aws.AthenaManager
      );
      let didPublish = false;
      function fakePublish() {
        didPublish = true;
      }

      const publishOverride = sandbox.stub();
      publishOverride.callsFake(fakePublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);
      let errored = false;
      try {
        await dataService.getDataByTableName('testTableName');
      } catch (err) {
        assert.instanceOf(err, error.DataServiceError);
        errored = true;
      }

      assert.isTrue(errored);
      assert.isTrue(didPublish);
    });
  });
  context('buildQuery', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    it('will build the correct query for normal ids', async () => {
      const projectId = 'testProjectId';
      const tableName = 'testTableName';
      const glyphxIds = [1, 2, 3, 4, 5];

      const expectedOutput = `SELECT * FROM ${tableName} WHERE glyphx_id__ IN (1,2,3,4,5) ORDER BY glyphx_id__ OFFSET 0 LIMIT 50`;

      let result = await dataService.buildQuery(projectId, tableName, glyphxIds, 50, 0, false);
      assert.equal(result, expectedOutput);
    });

    it('will build reverse lookup query with non date fields', async () => {
      const projectId = 'testProjectId';
      const tableName = 'testTableName';
      const glyphxIds = [-9999, 1];

      let projectStub = sandbox.stub(projectService, 'getProject');
      projectStub.resolves({
        state: {
          properties: {
            X: {
              key: 'column_x',
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
            },
            Y: {
              key: 'column_y',
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
            },
          },
        },
      } as unknown as databaseTypes.IProject);
      let runQueryStub = sandbox.stub();
      runQueryStub.callsFake(async (queryString: string) => {
        assert.equal(
          queryString,
          `SELECT column_x AS column_x, column_y AS column_y FROM ${tableName} WHERE glyphx_id__ IN (1)`
        );
        return [{column_x: 1, column_y: 2}];
      });

      let mockAthenaConnection = {
        runQuery: runQueryStub,
      } as unknown as aws.AthenaManager;

      let athenaConnectionStub = sandbox.replaceGetter(athenaConnection, 'connection', () => mockAthenaConnection);

      let result = await dataService.buildQuery(projectId, tableName, glyphxIds, 50, 0, false);

      assert.equal(
        result,
        `SELECT * FROM ${tableName} WHERE (column_x = 1 AND column_y = 2) ORDER BY glyphx_id__ OFFSET 0 LIMIT 50`
      );

      assert.isTrue(projectStub.calledOnce);
      assert.isTrue(runQueryStub.calledOnce);
    });

    it('will build reverse lookup query with non date fields and a mix of regular fields', async () => {
      const projectId = 'testProjectId';
      const tableName = 'testTableName';
      const glyphxIds = [2, -9999, 1, 3, -9999, 4, 5];

      let projectStub = sandbox.stub(projectService, 'getProject');
      projectStub.resolves({
        state: {
          properties: {
            X: {
              key: 'column_x',
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
            },
            Y: {
              key: 'column_y',
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
            },
          },
        },
      } as unknown as databaseTypes.IProject);
      let runQueryStub = sandbox.stub();
      runQueryStub.callsFake(async (queryString: string) => {
        assert.equal(
          queryString,
          `SELECT column_x AS column_x, column_y AS column_y FROM ${tableName} WHERE glyphx_id__ IN (1,4)`
        );
        return [
          {column_x: 1, column_y: 2},
          {column_x: 3, column_y: 4},
        ];
      });

      let mockAthenaConnection = {
        runQuery: runQueryStub,
      } as unknown as aws.AthenaManager;

      let athenaConnectionStub = sandbox.replaceGetter(athenaConnection, 'connection', () => mockAthenaConnection);

      let result = await dataService.buildQuery(projectId, tableName, glyphxIds, 50, 0, false);

      assert.equal(
        result,
        `SELECT * FROM ${tableName} WHERE glyphx_id__ IN (2,3,5) OR ((column_x = 1 AND column_y = 2) OR (column_x = 3 AND column_y = 4)) ORDER BY glyphx_id__ OFFSET 0 LIMIT 50`
      );

      assert.isTrue(projectStub.calledOnce);
      assert.isTrue(runQueryStub.calledOnce);
    });

    it('will build reverse lookup query with a date field', async () => {
      const projectId = 'testProjectId';
      const tableName = 'testTableName';
      const glyphxIds = [-9999, 1];

      let projectStub = sandbox.stub(projectService, 'getProject');
      projectStub.resolves({
        state: {
          properties: {
            X: {
              key: 'column_x',
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
            },
            Y: {
              key: 'column_y',
              dataType: fileIngestionTypes.constants.FIELD_TYPE.DATE,
              dateGrouping: 'qualified_day_of_month',
            },
          },
        },
      } as unknown as databaseTypes.IProject);
      let runQueryStub = sandbox.stub();
      runQueryStub.callsFake(async (queryString: string) => {
        assert.equal(
          queryString,
          `SELECT column_x AS column_x, (year(from_unixtime("column_y"/1000)) * 10000) + (month(from_unixtime("column_y"/1000)) * 100) + day_of_month(from_unixtime("column_y"/1000)) AS column_y FROM ${tableName} WHERE glyphx_id__ IN (1)`
        );
        return [{column_x: 1, column_y: 20240710}];
      });

      let mockAthenaConnection = {
        runQuery: runQueryStub,
      } as unknown as aws.AthenaManager;

      let athenaConnectionStub = sandbox.replaceGetter(athenaConnection, 'connection', () => mockAthenaConnection);

      let result = await dataService.buildQuery(projectId, tableName, glyphxIds, 50, 0, false);

      assert.equal(
        result,
        `SELECT * FROM ${tableName} WHERE (column_x = 1 AND (year(from_unixtime("column_y"/1000)) * 10000) + (month(from_unixtime("column_y"/1000)) * 100) + day_of_month(from_unixtime("column_y"/1000)) = 20240710) ORDER BY glyphx_id__ OFFSET 0 LIMIT 50`
      );

      assert.isTrue(projectStub.calledOnce);
      assert.isTrue(runQueryStub.calledOnce);
    });

    it('will pass through an exception', async () => {
      const projectId = 'testProjectId';
      const tableName = 'testTableName';
      const glyphxIds = [-9999, 1];
      let error = 'I am an error';

      let projectStub = sandbox.stub(projectService, 'getProject');
      projectStub.rejects(error);
      let errored = false;
      try {
        await dataService.buildQuery(projectId, tableName, glyphxIds, 50, 0, false);
      } catch (err) {
        assert.equal(err, error);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('getLookUpFilter', () => {
    //A good part of this was tested with buildQuery, but there are a couple of exceptions that we need to test here.
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('will throw a data not found error if the project cannot be found', async () => {
      let projectId = 'testProjectId';
      let tableName = 'testTableName';
      let lookupIds = [1, 2, 3, 4, 5];

      let projectStub = sandbox.stub(projectService, 'getProject');
      projectStub.resolves(null);

      let errored = false;
      try {
        await dataService.getLookUpFilter(projectId, tableName, lookupIds);
      } catch (err) {
        errored = true;
        assert.instanceOf(err, error.DataNotFoundError);
      }
      assert.isTrue(errored);
    });

    it('will throw a data not found error if the project cannot be found', async () => {
      let projectId = 'testProjectId';
      let tableName = 'testTableName';
      let lookupIds = [1, 2, 3, 4, 5];

      let projectStub = sandbox.stub(projectService, 'getProject');
      projectStub.resolves({
        state: {
          properties: {
            X: {
              key: 'column_x',
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
            },
            Y: {
              key: 'column_y',
              dataType: fileIngestionTypes.constants.FIELD_TYPE.DATE,
              dateGrouping: 'qualified_day_of_month',
            },
          },
        },
      } as unknown as databaseTypes.IProject);

      let runQueryStub = sandbox.stub();
      runQueryStub.callsFake(async (queryString: string) => {
        return [{column_x: 1, column_y: 2}];
      });

      let mockAthenaConnection = {
        runQuery: runQueryStub,
      } as unknown as aws.AthenaManager;

      let athenaConnectionStub = sandbox.replaceGetter(athenaConnection, 'connection', () => mockAthenaConnection);

      let errored = false;
      try {
        await dataService.getLookUpFilter(projectId, tableName, lookupIds);
      } catch (err) {
        errored = true;
        assert.instanceOf(err, error.DataNotFoundError);
      }
      assert.isTrue(errored);
    });

    it('it will pass though any errors thrown by called functions', async () => {
      let projectId = 'testProjectId';
      let tableName = 'testTableName';
      let lookupIds = [1, 2, 3, 4, 5];
      let error = 'I am an error';

      let projectStub = sandbox.stub(projectService, 'getProject');
      projectStub.rejects(error);
      let errored = false;
      try {
        await dataService.getLookUpFilter(projectId, tableName, lookupIds);
      } catch (err) {
        errored = true;
        assert.equal(err, error);
      }
      assert.isTrue(errored);
    });
  });
});

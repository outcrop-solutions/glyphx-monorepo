import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {aws, error} from '@glyphx/core';
import {MinMaxCalculator} from '../../io/minMaxCalulator';
import athenaClient from '../../io/athenaClient';

class MockAthenaClient {
  private data: any;
  private throwError: boolean;
  constructor(data: any, throwError = false) {
    this.data = data;
    this.throwError = throwError;
  }

  public async runQuery(): Promise<any> {
    if (this.throwError) {
      throw this.data;
    }
    return this.data;
  }
}
describe('#io/minMaxCalculator', () => {
  const tableName = 'testTableName';
  const xColumn = 'testxColumn';
  const yColumn = 'testyColumn';
  const zColumn = 'testzColumn';
  const filter = 'col1 >= 0';

  const minMaxRow: Record<string, string | number> = {};
  minMaxRow[`min${xColumn}`] = 0;
  minMaxRow[`max${xColumn}`] = 100;
  minMaxRow[`min${yColumn}`] = 0;
  minMaxRow[`max${yColumn}`] = 100;
  minMaxRow[`min${zColumn}`] = 'a';
  minMaxRow[`max${zColumn}`] = 'z';

  const minMaxData = [minMaxRow];

  context('constructor', () => {
    it('will create a new instance', () => {
      const minMaxCalculator = new MinMaxCalculator(
        tableName,
        xColumn,
        yColumn,
        zColumn,
        filter
      ) as any;
      assert.equal(minMaxCalculator.tableName, tableName);
      assert.equal(minMaxCalculator.xColumnName, xColumn);
      assert.equal(minMaxCalculator.yColumnName, yColumn);
      assert.equal(minMaxCalculator.zColumnName, zColumn);
      assert.equal(minMaxCalculator.filter, filter);
    });
  });

  context('load', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will load our data from athena', async () => {
      sandbox.replaceGetter(
        athenaClient,
        'connection',
        () => new MockAthenaClient(minMaxData) as unknown as aws.AthenaManager
      );
      const minMaxCalculator = new MinMaxCalculator(
        tableName,
        xColumn,
        yColumn,
        zColumn,
        filter
      ) as any;

      await minMaxCalculator.load();

      const minMax = minMaxCalculator.minMax;
      assert.strictEqual(minMax.x.columnName, xColumn);
      assert.strictEqual(minMax.x.min, minMaxRow[`min${xColumn}`]);
      assert.strictEqual(minMax.x.max, minMaxRow[`max${xColumn}`]);
      assert.strictEqual(minMax.y.columnName, yColumn);
      assert.strictEqual(minMax.y.min, minMaxRow[`min${yColumn}`]);
      assert.strictEqual(minMax.y.max, minMaxRow[`max${yColumn}`]);
      assert.strictEqual(minMax.z.columnName, zColumn);
      assert.strictEqual(minMax.z.min, minMaxRow[`min${zColumn}`]);
      assert.strictEqual(minMax.z.max, minMaxRow[`max${zColumn}`]);
    });

    it('will pass through an error thrown from the underlying client', async () => {
      sandbox.replaceGetter(
        athenaClient,
        'connection',
        () =>
          new MockAthenaClient(minMaxData, true) as unknown as aws.AthenaManager
      );
      const minMaxCalculator = new MinMaxCalculator(
        tableName,
        xColumn,
        yColumn,
        zColumn,
        filter
      ) as any;
      let errored = false;
      try {
        await minMaxCalculator.load();
      } catch (err: any) {
        assert.deepEqual(err, minMaxData);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will load our data from athena without a filter', async () => {
      const mockClient = new MockAthenaClient(
        minMaxData
      ) as unknown as aws.AthenaManager;
      const queryStub = sandbox.stub();
      queryStub.resolves(minMaxData);
      sandbox.replace(mockClient, 'runQuery', queryStub);
      sandbox.replaceGetter(athenaClient, 'connection', () => mockClient);
      const minMaxCalculator = new MinMaxCalculator(
        tableName,
        xColumn,
        yColumn,
        zColumn
      ) as any;

      await minMaxCalculator.load();
      assert.isTrue(queryStub.calledOnce);
      const query = queryStub.getCall(0).args[0];
      assert.isFalse(query.includes('WHERE'));
    });
  });

  context('getMinMax', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will throw an InvalidOperationError when we call get minMax before calling load', () => {
      sandbox.replaceGetter(
        athenaClient,
        'connection',
        () => new MockAthenaClient(minMaxData) as unknown as aws.AthenaManager
      );
      const minMaxCalculator = new MinMaxCalculator(
        tableName,
        xColumn,
        yColumn,
        zColumn,
        filter
      ) as any;

      assert.throws(() => minMaxCalculator.minMax, error.InvalidOperationError);
    });
  });
});

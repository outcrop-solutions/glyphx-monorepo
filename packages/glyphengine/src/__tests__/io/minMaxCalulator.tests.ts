import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {aws, error} from 'core';
import {MinMaxCalculator} from '../../io/minMaxCalulator';

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
  minMaxRow[`min_x_${xColumn}`] = 0;
  minMaxRow[`max_x_${xColumn}`] = 100;
  minMaxRow[`min_y_${yColumn}`] = 0;
  minMaxRow[`max_y_${yColumn}`] = 100;
  minMaxRow[`min_z_${zColumn}`] = 'a';
  minMaxRow[`max_z_${zColumn}`] = 'z';

  const minMaxData = [minMaxRow];

  context('constructor', () => {
    it('will create a new instance', () => {
      const athenaManager = new aws.AthenaManager('testDatabaseName');
      const minMaxCalculator = new MinMaxCalculator(
        'xCol',
        'yCol',
        'zCol',
        'zCol',
        athenaManager,
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
      const athenaManager = new MockAthenaClient(minMaxData) as unknown as aws.AthenaManager;
      const minMaxCalculator = new MinMaxCalculator(
        'xCol',
        'yCol',
        'zCol',
        'zCol',
        athenaManager,
        tableName,
        xColumn,
        yColumn,
        zColumn,
        filter
      ) as any;

      await minMaxCalculator.load();

      const minMax = minMaxCalculator.minMax;
      console.log({minMax});
      assert.strictEqual(minMax.x.columnName, xColumn);
      assert.strictEqual(minMax.x.min, minMaxRow[`min_x_${xColumn}`]);
      assert.strictEqual(minMax.x.max, minMaxRow[`max_x_${xColumn}`]);
      assert.strictEqual(minMax.y.columnName, yColumn);
      assert.strictEqual(minMax.y.min, minMaxRow[`min_y_${yColumn}`]);
      assert.strictEqual(minMax.y.max, minMaxRow[`max_y_${yColumn}`]);
      assert.strictEqual(minMax.z.columnName, zColumn);
      assert.strictEqual(minMax.z.min, minMaxRow[`min_z_${zColumn}`]);
      assert.strictEqual(minMax.z.max, minMaxRow[`max_z_${zColumn}`]);
    });

    it('will pass through an error thrown from the underlying client', async () => {
      const athenaManager = new MockAthenaClient(minMaxData, true) as unknown as aws.AthenaManager;
      const minMaxCalculator = new MinMaxCalculator(
        'xCol',
        'yCol',
        'zCol',
        'zCol',
        athenaManager,
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
      const mockClient = new MockAthenaClient(minMaxData) as unknown as aws.AthenaManager;
      const queryStub = sandbox.stub();
      queryStub.resolves(minMaxData);
      sandbox.replace(mockClient, 'runQuery', queryStub);
      const minMaxCalculator = new MinMaxCalculator(
        'xCol',
        'yCol',
        'zCol',
        'zCol',
        mockClient,
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
      const athenaManager = new MockAthenaClient(minMaxData) as unknown as aws.AthenaManager;
      const minMaxCalculator = new MinMaxCalculator(
        'xCol',
        'yCol',
        'zCol',
        'zCol',
        athenaManager,
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

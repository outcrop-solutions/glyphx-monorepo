import 'mocha';
import {assert} from 'chai';
import {dataService} from '../../services';
import {createSandbox} from 'sinon';
import athenaConnection from '../../lib/athenaConnection';
import {aws, error} from 'core';

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

      const result = await dataService.getDataByGlyphxIds(
        'testTableName',
        [1, 2, 3, 4, 5]
      );

      assert.deepEqual(result, value);
    });

    it('will publish and throw a DataServiceError when one of the underlyiong methods throws an error', async () => {
      const value = 'something bad has happened';
      sandbox.replaceGetter(
        athenaConnection,
        'connection',
        () =>
          new MockAthenaConnection(value, true) as unknown as aws.AthenaManager
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
        await dataService.getDataByGlyphxIds('testTableName', [1, 2, 3, 4, 5]);
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
        () =>
          new MockAthenaConnection(value, true) as unknown as aws.AthenaManager
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
});

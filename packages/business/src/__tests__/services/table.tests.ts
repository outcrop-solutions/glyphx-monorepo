import 'mocha';
import {assert} from 'chai';
import {tableService} from '../../services';
import {createSandbox} from 'sinon';
import athenaConnection from '../../lib/server/athenaConnection';
import {aws, error} from '@glyphx/core';

class MockAthenaConnection {
  private readonly retrunedValue: any;
  private readonly throwValue: boolean;

  constructor(returnedValue: any, throwValue = false) {
    this.retrunedValue = returnedValue;
    this.throwValue = throwValue;
  }

  async runQuery(query: string): Promise<Record<string, any>[]> {
    if (this.throwValue) throw this.retrunedValue;
    else return this.retrunedValue as unknown as Record<string, any>[];
  }
}

describe('#services/table', () => {
  context('getMaxRowId', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    it('will get the row count from the table', async () => {
      const value = 6300;
      sandbox.replaceGetter(
        athenaConnection,
        'connection',
        () =>
          new MockAthenaConnection([
            {
              count: value,
            },
          ]) as unknown as aws.AthenaManager
      );

      const result = await tableService.getMaxRowId('testTableName');

      assert.strictEqual(result, value);
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
        await tableService.getMaxRowId('testTableName');
      } catch (err) {
        assert.instanceOf(err, error.DataServiceError);
        errored = true;
      }

      assert.isTrue(errored);
      assert.isTrue(didPublish);
    });
  });
});

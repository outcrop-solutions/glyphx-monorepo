import {assert} from 'chai';
import {SinonSandbox, createSandbox} from 'sinon';
import {S3Manager, AthenaManager} from '@glyphx/core';
import {BasicAthenaProcessor} from '@fileProcessing';
import {error} from '@glyphx/core';
describe('fileProcessing/BasicAthenaProcessor', () => {
  context('init', () => {
    let sandbox: SinonSandbox;

    before(() => {
      sandbox = createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('will initialize a BasicAthenaProcessor', async () => {
      const bucketName = 'someBucketName';
      const databaseName = 'someDatabaseName';

      sandbox.replace(
        S3Manager.prototype,
        'init',
        sandbox.fake.resolves(undefined as void)
      );
      sandbox.replace(
        AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(undefined as void)
      );

      const athenaProcessor = new BasicAthenaProcessor(
        bucketName,
        databaseName
      );

      let errored = false;
      try {
        await athenaProcessor.init();
      } catch (err) {
        errored = true;
      }

      assert.isFalse(errored);

      assert.isTrue(athenaProcessor['inited']);
    });
    it('will throw an invalidArgumentError if S3Manager or AthenaManager throw an error', async () => {
      const bucketName = 'someBucketName';
      const databaseName = 'someDatabaseName';

      const errorString = 'An erorr has occurred';
      sandbox.replace(
        S3Manager.prototype,
        'init',
        sandbox.fake.throws(errorString)
      );
      sandbox.replace(
        AthenaManager.prototype,
        'init',
        sandbox.fake.throws(errorString)
      );

      const athenaProcessor = new BasicAthenaProcessor(
        bucketName,
        databaseName
      );

      let errored = false;
      try {
        await athenaProcessor.init();
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);

      assert.isFalse(athenaProcessor['inited']);
    });
  });
});

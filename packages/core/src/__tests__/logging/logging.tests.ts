import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {Logger} from '../../logging';

describe('#util/logging', () => {
  context('logger', () => {
    let sandBox: sinon.SinonSandbox;
    let storedLogLevel: string | undefined = '';
    before(async () => {
      storedLogLevel = process.env.LOG_LEVEL;
      //for these tests turn on all log levels
      process.env.LOG_LEVEL = 'silly';
      await Logger.init();
      sandBox = createSandbox();
    });

    afterEach(() => {
      sandBox.restore();
    });

    after(() => {
      //retore our log level so that there are no
      // downstream effects
      process.env.LOG_LEVEL = storedLogLevel;
    });
    it('should log a silly message to the console', () => {
      const correlationId = 'correlationId';
      const message = 'I am the silly message';

      const stub = sandBox.stub((console as any)['_stdout'], 'write');
      Logger.silly(correlationId, message);

      assert.isTrue(stub.calledOnce);
      //eslint-disable-next-line
      let args: any;
      assert.doesNotThrow(() => {
        args = JSON.parse(stub.args[0][0]);
      });

      assert.strictEqual(args.level, 'silly');
      assert.isOk(args.message);
      assert.strictEqual(args.message?.body, message);
    });

    it('should log a debug  message to the console', () => {
      const correlationId = 'correlationId';
      const message = 'I am the debug message';

      const stub = sandBox.stub((console as any)['_stdout'], 'write');
      Logger.debug(correlationId, message);

      assert.isTrue(stub.calledOnce);
      //eslint-disable-next-line
      let args: any;
      assert.doesNotThrow(() => {
        args = JSON.parse(stub.args[0][0]);
      });

      assert.strictEqual(args.level, 'debug');
      assert.isOk(args.message);
      assert.strictEqual(args.message?.body, message);
    });

    it('should log a verbose message to the console', () => {
      const correlationId = 'correlationId';
      const message = 'I am the info message';

      const stub = sandBox.stub((console as any)['_stdout'], 'write');
      Logger.verbose(correlationId, message);

      assert.isTrue(stub.calledOnce);
      //eslint-disable-next-line
      let args: any;
      assert.doesNotThrow(() => {
        args = JSON.parse(stub.args[0][0]);
      });

      assert.strictEqual(args.level, 'verbose');
      assert.isOk(args.message);
      assert.strictEqual(args.message?.body, message);
    });

    it('should log an info message to the console', () => {
      const correlationId = 'correlationId';
      const message = 'I am the info message';

      const stub = sandBox.stub((console as any)['_stdout'], 'write');
      Logger.info(correlationId, message);

      assert.isTrue(stub.calledOnce);
      //eslint-disable-next-line
      let args: any;
      assert.doesNotThrow(() => {
        args = JSON.parse(stub.args[0][0]);
      });

      assert.strictEqual(args.level, 'info');
      assert.isOk(args.message);
      assert.strictEqual(args.message?.body, message);
    });

    it('should log a warning message to the console', () => {
      const correlationId = 'correlationId';
      const message = 'I am the warn message';

      const stub = sandBox.stub((console as any)['_stdout'], 'write');
      Logger.warn(correlationId, message);

      assert.isTrue(stub.calledOnce);
      //eslint-disable-next-line
      let args: any;
      assert.doesNotThrow(() => {
        args = JSON.parse(stub.args[0][0]);
      });

      assert.strictEqual(args.level, 'warn');
      assert.isOk(args.message);
      assert.strictEqual(args.message?.body, message);
    });

    it('should log an error message to the console', () => {
      const correlationId = 'correlationId';
      const message = 'I am the error message';

      const stub = sandBox.stub((console as any)['_stdout'], 'write');
      Logger.error(correlationId, message);

      assert.isTrue(stub.calledOnce);
      //eslint-disable-next-line
      let args: any;
      assert.doesNotThrow(() => {
        args = JSON.parse(stub.args[0][0]);
      });

      assert.strictEqual(args.level, 'error');
      assert.isOk(args.message);
      assert.strictEqual(args.message?.body, message);
    });
  });

  context('logger init', () => {
    let sandBox: sinon.SinonSandbox;
    let storedLogLevel: string | undefined = '';
    before(async () => {
      storedLogLevel = process.env.LOG_LEVEL;
      //for these tests turn on all log levels
      await Logger.init();
      sandBox = createSandbox();
    });

    afterEach(async () => {
      sandBox.restore();
      process.env.LOG_LEVEL = storedLogLevel;
      await Logger.init();
    });

    it('should re-init our logger to info so silly does not work', async () => {
      process.env.LOG_LEVEL = 'info';
      await Logger.init();

      const stub = sandBox.stub((console as any)['_stdout'], 'write');
      const correlationId = 'correlationId';
      const message = 'I am the  message';

      Logger.silly(correlationId, message);
      assert.isFalse(stub.calledOnce);

      Logger.info(correlationId, message);
      assert.isTrue(stub.calledOnce);

      process.env.LOG_LEVEL = 'silly';
      await Logger.init();

      Logger.silly(correlationId, message);
      assert.isTrue(stub.called);

      Logger.info(correlationId, message);
      assert.isTrue(stub.calledThrice);
    });
  });
});

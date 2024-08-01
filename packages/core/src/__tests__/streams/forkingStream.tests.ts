import 'mocha';
import {assert} from 'chai';
import {ForkingStream} from '../../streams';
import {Readable, Transform} from 'stream';
import {createSandbox} from 'sinon';
import {InvalidOperationError, InvalidArgumentError} from '../../error';
import {PIPELINE_STATUS} from '../../constants';

const STREAM_DATA =
  'I am the stream data. It really makes no difference what you set here; as long as you set something'.split(' ');

describe('#stream/ForkingStream', () => {
  const sandbox = createSandbox();

  let inputStream: Readable;
  let transform1Count: number;
  let transformStream1: Transform;

  let transform2Count: number;
  let transformStream2: Transform;

  let transform3Count: number;
  let transformStream3: Transform;

  let transform4Count: number;
  let transformStream4: Transform;

  let transform5Count: number;
  let transformStream5: Transform;

  let errorTransform1ErrorCount: number;
  let errorTtransformStream1: Transform;

  let errorTransform2ErrorCount: number;
  let errorTtransformStream2: Transform;
  beforeEach(() => {
    inputStream = Readable.from(STREAM_DATA);

    transform1Count = 0;
    transformStream1 = new Transform({
      transform: (chunk, encoding, callback) => {
        transform1Count++;
        callback(null, chunk);
      },
    });

    transform2Count = 0;
    transformStream2 = new Transform({
      transform: (chunk, encoding, callback) => {
        transform2Count++;
        callback(null, chunk);
      },
    });

    transform3Count = 0;
    transformStream3 = new Transform({
      transform: (chunk, encoding, callback) => {
        transform3Count++;
        callback(null, chunk);
      },
    });

    transform4Count = 0;
    transformStream4 = new Transform({
      transform: (chunk, encoding, callback) => {
        transform4Count++;
        callback(null, chunk);
      },
    });

    transform5Count = 0;
    transformStream5 = new Transform({
      transform: (chunk, encoding, callback) => {
        transform5Count++;
        callback(null, chunk);
      },
    });

    errorTransform1ErrorCount = 0;
    errorTtransformStream1 = new Transform({
      transform: (chunk, encoding, callback) => {
        errorTransform1ErrorCount++;
        callback(Error('an error has occurred'), chunk);
      },
    });

    errorTransform2ErrorCount = 0;
    errorTtransformStream2 = new Transform({
      transform: (chunk, encoding, callback) => {
        errorTransform2ErrorCount++;
        callback(Error('an error has occurred'), chunk);
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });
  context('constructor', () => {
    it('Should successfully build a new object passing a single base stream', () => {
      const splitStream = new ForkingStream(inputStream);

      assert.isOk(splitStream['start']);
      //assert.isOk(splitStream['basePipe']);
      assert.strictEqual(splitStream['forks'].length, 0);

      assert.isTrue(splitStream.isSafe);
      assert.isTrue(splitStream['start'].isPaused());
    });

    it('Should successfully build a new object passing a single base stream and multiple transforms', () => {
      const spy = sandbox.spy(ForkingStream.prototype, 'addStreams');
      const splitStream = new ForkingStream(inputStream, transformStream1, transformStream2);

      assert.isOk(splitStream['start']);
      //assert.isOk(splitStream['basePipe']);
      assert.strictEqual(splitStream['forks'].length, 0);

      assert.isTrue(splitStream.isSafe);
      assert.isTrue(splitStream['start'].isPaused());

      assert.strictEqual(spy.callCount, 1);
      assert.strictEqual(spy.firstCall.args.length, 2);
    });
  });

  context('add streams', () => {
    it('should add a stream to an existing object', () => {
      const spy = sandbox.spy(ForkingStream.prototype, 'addStreams');
      const splitStream = new ForkingStream(inputStream);

      splitStream.addStreams(transformStream1, transformStream2);

      assert.strictEqual(spy.callCount, 1);
      assert.strictEqual(spy.firstCall.args.length, 2);
    });
    it('should throw an exception when it is not safe', () => {
      const splitStream = new ForkingStream(inputStream);
      splitStream.startPipeline();
      assert.throws(() => {
        splitStream.addStreams(transformStream1, transformStream2);
      }, InvalidOperationError);
    });
  });

  context('fork', () => {
    it('should fork a stream', () => {
      const splitStream = new ForkingStream(inputStream);
      const fork = splitStream.fork('fork1', transformStream1);

      assert.isOk(fork);
      assert.isAtLeast(splitStream['forks'].length, 1);

      const privateFork = splitStream['forks'].find((f) => f.forkName === 'fork1');

      assert.isOk(privateFork);
    });
    it('should fork 2 streams', () => {
      const splitStream = new ForkingStream(inputStream);
      const fork = splitStream.fork('fork1', transformStream1);
      const fork2 = splitStream.fork('fork2', transformStream2);

      assert.isOk(fork);
      assert.isOk(fork2);
      assert.isAtLeast(splitStream['forks'].length, 2);

      const privateFork = splitStream['forks'].find((f) => f.forkName === 'fork1');

      assert.isOk(privateFork);
      const privateFork2 = splitStream['forks'].find((f) => f.forkName === 'fork2');

      assert.isOk(privateFork2);
    });
    it('should throw an InvalidOperationError if not safe to fork a stream', () => {
      const splitStream = new ForkingStream(inputStream);
      splitStream.startPipeline();

      assert.throws(() => {
        splitStream.fork('fork1', transformStream1);
      }, InvalidOperationError);
    });
  });

  context('addStreamstoFork', () => {
    it('should add a stream to a fork', () => {
      const splitStream = new ForkingStream(inputStream);
      const fork = splitStream.fork('fork1', transformStream1);

      splitStream.addStreamsToFork('fork1', transformStream3);

      assert.strictEqual(fork.streams.length, 2);
    });
    it('should throw an InvalidOperationError when adding a stream to a fork that is unsafe', () => {
      const splitStream = new ForkingStream(inputStream);
      splitStream.fork('fork1', transformStream1);

      splitStream.startPipeline();

      assert.throws(() => {
        splitStream.addStreamsToFork('fork1', transformStream3);
      }, InvalidOperationError);
    });
    it('should throw an InvalidArgumentError when adding a stream to a fork that is does not exist', () => {
      const splitStream = new ForkingStream(inputStream);
      splitStream.fork('fork1', transformStream1);

      assert.throws(() => {
        splitStream.addStreamsToFork('fork2', transformStream3);
      }, InvalidArgumentError);
    });
  });

  context('functional testing', () => {
    it('should fork our stream at the same branch point and process both pipelines', async () => {
      const splitStream = new ForkingStream(inputStream, transformStream1);
      splitStream.fork('fork1', transformStream2, transformStream3);
      splitStream.fork('fork2', transformStream4, transformStream5);

      const numberOfCalls = STREAM_DATA.length;

      splitStream.startPipeline();
      await splitStream.done();

      assert.isTrue(splitStream.completed);
      assert.strictEqual(transform1Count, numberOfCalls);
      assert.strictEqual(transform2Count, numberOfCalls);
      assert.strictEqual(transform3Count, numberOfCalls);
      assert.strictEqual(transform4Count, numberOfCalls);
      assert.strictEqual(transform5Count, numberOfCalls);
      assert.strictEqual(splitStream.status, PIPELINE_STATUS.COMPLETE);
      assert.strictEqual(splitStream['forks'][0].pipelineStatus, PIPELINE_STATUS.COMPLETE);
      assert.strictEqual(splitStream['forks'][1].pipelineStatus, PIPELINE_STATUS.COMPLETE);
    });
    it('It will run just our base stream with no forks', async () => {
      const splitStream = new ForkingStream(inputStream, transformStream1);

      const numberOfCalls = STREAM_DATA.length;

      splitStream.startPipeline();
      await splitStream.done();

      assert.isTrue(splitStream.completed);
      assert.strictEqual(transform1Count, numberOfCalls);
    });
    it('It fork a stream with no additional streams', async () => {
      const splitStream = new ForkingStream(inputStream, transformStream1);
      splitStream.fork('fork1');
      const numberOfCalls = STREAM_DATA.length;

      splitStream.startPipeline();
      await splitStream.done();

      assert.isTrue(splitStream.completed);
      assert.strictEqual(transform1Count, numberOfCalls);
    });
    it('should fork our stream at the same branch point and process both pipelines fork 1 will error', async () => {
      const splitStream = new ForkingStream(inputStream, transformStream1);
      splitStream.fork('fork1', errorTtransformStream1, transformStream3);
      splitStream.fork('fork2', transformStream4, transformStream5);

      const numberOfCalls = STREAM_DATA.length;
      splitStream.startPipeline();
      assert.isTrue(splitStream.started);
      assert.isTrue(splitStream.unsafe);
      assert.strictEqual(splitStream.status, PIPELINE_STATUS.RUNNING);
      let errored = false;
      try {
        await splitStream.done();
      } catch (err) {
        assert.instanceOf(err, InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(splitStream.errored);

      assert.strictEqual(transform1Count, numberOfCalls);
      assert.strictEqual(errorTransform1ErrorCount, 1);
      assert.strictEqual(splitStream.status, PIPELINE_STATUS.ERROR);
      assert.strictEqual(splitStream['forks'][0].pipelineStatus, PIPELINE_STATUS.ERROR);
      assert.strictEqual(splitStream['forks'][1].pipelineStatus, PIPELINE_STATUS.CANCELLED);
    });
    it('should fork our stream at the same branch point and process both pipelines a base stream will error', async () => {
      const splitStream = new ForkingStream(inputStream, errorTtransformStream2, transformStream1);
      splitStream.fork('fork1', transformStream2, transformStream3);
      splitStream.fork('fork2', transformStream4, transformStream5);

      splitStream.startPipeline();
      assert.isTrue(splitStream.started);
      assert.isTrue(splitStream.unsafe);
      assert.strictEqual(splitStream.status, PIPELINE_STATUS.RUNNING);
      let errored = false;
      try {
        await splitStream.done();
      } catch (err) {
        assert.instanceOf(err, InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(splitStream.errored);

      assert.strictEqual(errorTransform2ErrorCount, 1);
      assert.strictEqual(splitStream.status, PIPELINE_STATUS.ERROR);
      assert.strictEqual(splitStream['forks'][0].pipelineStatus, PIPELINE_STATUS.CANCELLED);
      assert.strictEqual(splitStream['forks'][1].pipelineStatus, PIPELINE_STATUS.CANCELLED);
    });
    it('Should throw an exception if we call start twice', async () => {
      const splitStream = new ForkingStream(inputStream, transformStream1);
      splitStream.fork('fork1', transformStream2, transformStream3);
      splitStream.fork('fork2', transformStream4, transformStream5);

      let errored = false;
      try {
        splitStream.startPipeline();
        splitStream.startPipeline();
        await splitStream.done();
      } catch (err) {
        assert.instanceOf(err, InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
});

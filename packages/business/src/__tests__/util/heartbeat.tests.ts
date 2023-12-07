// import {processTrackingService} from '../../services';
// import 'mocha';
// import {assert} from 'chai';
// import {Heartbeat} from '../../util';
// import {createSandbox, useFakeTimers} from 'sinon';
// import {error} from 'core';

// describe('#util/heartBeat', () => {
//   context('constructor', () => {
//     it('should create a new Heartbeat', () => {
//       const processId = 'testProcessId';
//       const interval = 1000;
//       const heartbeat = new Heartbeat(processId, interval);
//       assert.equal(heartbeat.processId, processId);
//       assert.equal(heartbeat.interval, interval);
//       assert.isNotOk((heartbeat as any).timer);
//       assert.isFalse((heartbeat as any).internalStop);
//     });
//   });
//   context('start', () => {
//     const sandbox = createSandbox();
//     afterEach(() => {
//       sandbox.restore();
//     });
//     it('should call ping which will call ProcessTrackingService and set the timeout.', async () => {
//       const processId = 'testProcessId';
//       const interval = 60000;
//       const heartbeat = new Heartbeat(processId, interval);
//       const setHeartbeatStub = sandbox.stub();
//       setHeartbeatStub.resolves();
//       sandbox.replace(processTrackingService, 'setHeartbeat', setHeartbeatStub);
//       let started = false;
//       heartbeat.on('started', () => {
//         started = true;
//       });
//       await heartbeat.start();
//       assert.isTrue(setHeartbeatStub.calledOnce);
//       assert.isOk((heartbeat as any).timer);
//       assert.isTrue(started);
//       heartbeat.stop();
//     });

//     it('should throw a InvalidOperationError when start has already been called', async () => {
//       const processId = 'testProcessId';
//       const interval = 60000;
//       const heartbeat = new Heartbeat(processId, interval);
//       const setHeartbeatStub = sandbox.stub();
//       setHeartbeatStub.resolves();
//       sandbox.replace(processTrackingService, 'setHeartbeat', setHeartbeatStub);

//       await heartbeat.start();
//       let errored = false;
//       try {
//         await heartbeat.start();
//       } catch (err) {
//         errored = true;
//         assert.instanceOf(err, error.InvalidOperationError);
//       }
//       assert.isTrue(errored);
//       assert.isTrue(setHeartbeatStub.calledOnce);
//       assert.isOk((heartbeat as any).timer);
//       heartbeat.stop();
//     });
//   });

//   context('ping', () => {
//     let clock: any;
//     const sandbox = createSandbox();
//     beforeEach(() => {
//       clock = useFakeTimers();
//     });

//     afterEach(() => {
//       sandbox.restore();
//       clock.restore();
//     });

//     it('will call ProcessTrackingService and set the timeout.', async () => {
//       const processId = 'testProcessId';
//       const interval = 60000;
//       const heartbeat = new Heartbeat(processId, interval);
//       const setHeartbeatStub = sandbox.stub();
//       setHeartbeatStub.resolves();
//       sandbox.replace(processTrackingService, 'setHeartbeat', setHeartbeatStub);

//       let heartbeatEmitted = false;
//       heartbeat.on('heartbeat', () => {
//         heartbeatEmitted = true;
//       });

//       await heartbeat.start();

//       clock.tick(70000);
//       await Promise.resolve();
//       heartbeat.stop();
//       assert.isTrue(setHeartbeatStub.calledTwice);
//       assert.isTrue(heartbeatEmitted);
//     });

//     it('will fail with an error passed as an event', async () => {
//       const processId = 'testProcessId';
//       const interval = 60000;
//       const heartbeat = new Heartbeat(processId, interval);
//       const setHeartbeatStub = sandbox.stub();
//       setHeartbeatStub.resolves();
//       setHeartbeatStub.onCall(1).rejects('Somethig went wrong');
//       sandbox.replace(processTrackingService, 'setHeartbeat', setHeartbeatStub);

//       let errored = false;
//       heartbeat.on('error', (err) => {
//         assert.instanceOf(err, error.UnexpectedError);
//         errored = true;
//       });
//       await heartbeat.start();
//       clock.tick(60000);
//       await Promise.resolve();
//       assert.isTrue(setHeartbeatStub.calledTwice);
//       clock.tick(60000);
//       await Promise.resolve();
//       heartbeat.stop();
//       assert.isFalse(setHeartbeatStub.calledThrice);
//       assert.isTrue(errored);
//     });
//   });
//   context('stop', () => {
//     const sandbox = createSandbox();

//     afterEach(() => {
//       sandbox.restore();
//     });

//     it('should stop the heartbeat', async () => {
//       const processId = 'testProcessId';
//       const interval = 60000;
//       const heartbeat = new Heartbeat(processId, interval);
//       const setHeartbeatStub = sandbox.stub();
//       setHeartbeatStub.resolves();
//       sandbox.replace(processTrackingService, 'setHeartbeat', setHeartbeatStub);
//       let stopped = false;
//       heartbeat.on('stopped', () => {
//         stopped = true;
//       });

//       await heartbeat.start();
//       heartbeat.stop();
//       assert.isTrue(setHeartbeatStub.calledOnce);
//       assert.isNotOk((heartbeat as any).timer);
//       assert.isTrue(stopped);
//     });

//     it('should throw an error when stop is called when the heqartbeat is not running', async () => {
//       const processId = 'testProcessId';
//       const interval = 60000;
//       const heartbeat = new Heartbeat(processId, interval);
//       const setHeartbeatStub = sandbox.stub();
//       setHeartbeatStub.resolves();
//       sandbox.replace(processTrackingService, 'setHeartbeat', setHeartbeatStub);
//       let stopped = false;
//       heartbeat.on('stopped', () => {
//         stopped = true;
//       });

//       assert.throws(() => {
//         heartbeat.stop();
//       }, error.InvalidOperationError);
//       assert.isFalse(stopped);
//     });

//     it('should not throw an error when stop is called when the heqartbeat is not running but it failed with an internal stop', async () => {
//       const processId = 'testProcessId';
//       const interval = 60000;
//       const heartbeat = new Heartbeat(processId, interval);
//       const setHeartbeatStub = sandbox.stub();
//       setHeartbeatStub.resolves();
//       sandbox.replace(processTrackingService, 'setHeartbeat', setHeartbeatStub);
//       (heartbeat as any).internalStop = true;
//       let stopped = false;
//       heartbeat.on('stopped', () => {
//         stopped = true;
//       });

//       assert.doesNotThrow(() => {
//         heartbeat.stop();
//       }, error.InvalidOperationError);
//       assert.isFalse(stopped);
//     });
//   });
// });

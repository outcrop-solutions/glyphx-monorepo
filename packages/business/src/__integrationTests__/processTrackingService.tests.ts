import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {processTrackingService} from '../services';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

const PROCESS_ID = UNIQUE_KEY;
const PROCESS_NAME = 'processName' + UNIQUE_KEY;

describe('#ProcessTrackingService', () => {
  context('test the functions of the  ProcessTrackingService', () => {
    const mongoConnection = new MongoDbConnection();
    const processTrackingModel = mongoConnection.models.ProcessTrackingModel;
    let processTrackingId: ObjectId;
    before(async () => {
      await mongoConnection.init();
    });

    after(async () => {
      if (processTrackingId) {
        await processTrackingModel.findByIdAndDelete(processTrackingId);
      }
    });

    it('will crete a new process tracking document', async () => {
      const {processId: processTrackingProcessId} = await processTrackingService.createProcessTracking(
        PROCESS_ID,
        PROCESS_NAME
      );

      const savedDocument = await processTrackingModel.findOne({
        processId: processTrackingProcessId,
      });
      assert.isOk(savedDocument);
      processTrackingId = savedDocument?._id as ObjectId;
    });

    it('will change the status to inProcess', async () => {
      assert.isOk(processTrackingId);
      const message = 'starting the process';

      await processTrackingService.updateProcessStatus(
        processTrackingId,
        databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
        message
      );

      const status = await processTrackingService.getProcessStatus(processTrackingId);

      assert.strictEqual(status?.processStatus, databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS);
      assert.strictEqual(status?.processMessages.length, 1);
      assert.strictEqual(status?.processMessages[0], message);
    });

    it('will set a heartbeat', async () => {
      assert.isOk(processTrackingId);
      await processTrackingService.setHeartbeat(processTrackingId);
      const processTracking = await processTrackingService.getProcessTracking(processTrackingId);
      assert.isOk(processTracking?.processHeartbeat);
      assert.isAbove(
        processTracking?.processHeartbeat?.getTime() ?? 0,
        processTracking?.processStartTime.getTime() ?? 999
      );
    });

    it('will add a message', async () => {
      assert.isOk(processTrackingId);
      const message = 'continuing the process';

      await processTrackingService.addProcessMessage(processTrackingId, message);

      const messages = await processTrackingService.getProcessMessages(processTrackingId);

      assert.strictEqual(messages?.processMessages.length, 2);
      assert.strictEqual(messages?.processMessages[0], message);
    });

    it('will add an error', async () => {
      assert.isOk(processTrackingId);
      const errorObject = new error.GlyphxError('An Error has Occurred', 999);

      await processTrackingService.addProcessError(processTrackingId, errorObject);

      const messages = await processTrackingService.getProcessError(processTrackingId);

      assert.strictEqual(messages?.processError.length, 1);
      assert.strictEqual(messages?.processError[0].message, errorObject.message);
    });

    it('will complete the process', async () => {
      assert.isOk(processTrackingId);
      const resultObject = {result: 'success'};
      await processTrackingService.completeProcess(processTrackingId, resultObject);

      const result = await processTrackingService.getProcessResult(processTrackingId);
      assert.strictEqual(result?.processResult?.result, resultObject.result);

      const document = await processTrackingService.getProcessTracking(processTrackingId);
      assert.isOk(document);
      assert.isOk(document?.processEndTime);
    });

    it('will remove the process', async () => {
      assert.isOk(processTrackingId);
      await processTrackingService.removeProcessTrackingDocument(processTrackingId);

      const document = await processTrackingService.getProcessTracking(processTrackingId);
      assert.isNotOk(document);
    });
  });
});

import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {error} from 'core';
import {ProcessTrackingModel} from '../mongoose/models';
import {DBFormatter} from '../lib/format';

const UNIQUE_KEY = v4().replaceAll('-', '');

const INPUT_DATA = {
  processId: 'id_' + UNIQUE_KEY,
  processName: 'test process1' + UNIQUE_KEY,
  processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
  processStartTime: new Date(),
  processMessages: [],
  processError: [],
};

const INPUT_DATA2 = {
  processId: 'id_2' + UNIQUE_KEY,
  processName: 'test process2' + UNIQUE_KEY,
  processStatus: databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS,
  processStartTime: new Date(),
  processMessages: [],
  processError: [],
};

describe.only('#processTrackingModel', () => {
  context('test the crud functions of the processTracking model', () => {
    const mongoConnection = new MongoDbConnection();
    const format = new DBFormatter();
    const processTrackingModel = mongoConnection.models.ProcessTrackingModel;
    let processTrackingId: string;
    let processTrackingId2: string;
    before(async () => {
      await mongoConnection.init();
    });

    after(async () => {
      if (processTrackingId) {
        await processTrackingModel.findByIdAndDelete(processTrackingId);
      }

      if (processTrackingId2) {
        await processTrackingModel.findByIdAndDelete(processTrackingId2);
      }
    });

    it('add a new processTracking document', async () => {
      const processTrackingInput = JSON.parse(JSON.stringify(INPUT_DATA));
      const processTrackingDocument = await processTrackingModel.createProcessTrackingDocument(
        format.toJS(processTrackingInput)
      );
      assert.isOk(processTrackingDocument);
      assert.strictEqual(processTrackingDocument.processName, processTrackingInput.processName);
      processTrackingId = processTrackingDocument.id!;
    });

    it('retreive a process tracking document by id', async () => {
      assert.isOk(processTrackingId);
      const processTrackingDocument = await processTrackingModel.getProcessTrackingDocumentById(processTrackingId);

      assert.isOk(processTrackingDocument);
      assert.strictEqual(processTrackingDocument.id, processTrackingId.toString());
    });

    it('Get multiple process tracking documents without a filter', async () => {
      assert.isOk(processTrackingId);
      const processTrackingInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      const processTrackingDocument = await processTrackingModel.createProcessTrackingDocument(
        format.toJS(processTrackingInput)
      );

      assert.isOk(processTrackingDocument);
      processTrackingId2 = processTrackingDocument.id!;

      const processTrackingDocuments = await processTrackingModel.queryProcessTrackingDocuments();
      assert.isArray(processTrackingDocuments.results);
      assert.isAtLeast(processTrackingDocuments.numberOfItems, 2);
      const expectedDocumentCount =
        processTrackingDocuments.numberOfItems <= processTrackingDocuments.itemsPerPage
          ? processTrackingDocuments.numberOfItems
          : processTrackingDocuments.itemsPerPage;
      assert.strictEqual(processTrackingDocuments.results.length, expectedDocumentCount);
    });

    it('Get multiple process tracking documents with a filter', async () => {
      assert.isOk(processTrackingId2);
      const results = await processTrackingModel.queryProcessTrackingDocuments({
        processName: INPUT_DATA.processName,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.processName, INPUT_DATA.processName);
    });

    it('page process tracking documents', async () => {
      assert.isOk(processTrackingId2);
      const results = await processTrackingModel.queryProcessTrackingDocuments({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await processTrackingModel.queryProcessTrackingDocuments({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(results2.results[0]?.id, lastId?.toString());
    });

    it('modify a process tracking document by id', async () => {
      assert.isOk(processTrackingId);
      const input = {processName: 'I have been modified'};
      const updatedDocument = await processTrackingModel.updateProcessTrackingDocumentById(processTrackingId, input);
      assert.strictEqual(updatedDocument.processName, input.processName);
    });

    it('add an error to the processTracking Document by id', async () => {
      assert.isOk(processTrackingId);
      const errorText = 'I am error1';
      const updatedProcessTrackingDocument = await ProcessTrackingModel.addErrorsById(processTrackingId.toString(), [
        {error: errorText},
      ]);
      assert.strictEqual(updatedProcessTrackingDocument.processError.length, 1);
      assert.strictEqual(updatedProcessTrackingDocument.processError[0].error, errorText);
    });

    it('add an error to the processTracking Document by processId', async () => {
      assert.isOk(processTrackingId);
      const errorText = 'I am error2';
      const updatedProcessTrackingDocument = await ProcessTrackingModel.addErrorsByProcessId(INPUT_DATA.processId, [
        {error: errorText},
      ]);
      assert.strictEqual(updatedProcessTrackingDocument.processError.length, 2);
      assert.strictEqual(updatedProcessTrackingDocument.processError[0].error, errorText);
    });

    it('add a message to the processTracking Document by id', async () => {
      assert.isOk(processTrackingId);
      const message = 'I am message1';
      const updatedProcessTrackingDocument = await ProcessTrackingModel.addMessagesById(processTrackingId.toString(), [
        message,
      ]);
      // FIXME: the updatedProcessTrackingDocument.processMessages is returned as an array of single characters for some reason?
      assert.strictEqual(updatedProcessTrackingDocument.processMessages.length, 1);
    });

    it('remove a process tracking document by id', async () => {
      assert.isOk(processTrackingId);
      await processTrackingModel.deleteProcessTrackingDocumentById(processTrackingId);
      let errored = false;
      try {
        await processTrackingModel.getProcessTrackingDocumentById(processTrackingId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      processTrackingId = null as unknown as string;
    });

    it('remove a process tracking document by processId', async () => {
      assert.isOk(processTrackingId2);
      await processTrackingModel.deleteProcessTrackingDocumentProcessId(INPUT_DATA2.processId);
      let errored = false;
      try {
        await processTrackingModel.getProcessTrackingDocumentByProcessId(INPUT_DATA2.processId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      processTrackingId2 = null as unknown as string;
    });
  });
});

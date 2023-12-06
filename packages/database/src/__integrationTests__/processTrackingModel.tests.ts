// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks'
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#ProcessTrackingModel', () => {
  context('test the crud functions of the processTracking model', () => {
    const mongoConnection = new MongoDbConnection();
    const processTrackingModel = mongoConnection.models.ProcessTrackingModel;
    let processTrackingDocId: ObjectId;
    let processTrackingDocId2: ObjectId;

    before(async () => {
      await mongoConnection.init();
    });

    after(async () => {
      if (processTrackingDocId) {
        await processTrackingModel.findByIdAndDelete(processTrackingDocId);
      }

      if (processTrackingDocId2) {
        await processTrackingModel.findByIdAndDelete(processTrackingDocId2);
      }

    });

    it('add a new processTracking ', async () => {
      const processTrackingInput = JSON.parse(JSON.stringify(mocks.MOCK_PROCESSTRACKING));


      const processTrackingDocument = await processTrackingModel.createProcessTracking(processTrackingInput);

      assert.isOk(processTrackingDocument);
      assert.strictEqual(Object.keys(processTrackingDocument)[1], Object.keys(processTrackingInput)[1]);


      processTrackingDocId = processTrackingDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a processTracking', async () => {
      assert.isOk(processTrackingDocId);
      const processTracking = await processTrackingModel.getProcessTrackingById(processTrackingDocId);

      assert.isOk(processTracking);
      assert.strictEqual(processTracking._id?.toString(), processTrackingDocId.toString());
    });

    it('modify a processTracking', async () => {
      assert.isOk(processTrackingDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await processTrackingModel.updateProcessTrackingById(
        processTrackingDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple processTrackings without a filter', async () => {
      assert.isOk(processTrackingDocId);
      const processTrackingInput = JSON.parse(JSON.stringify(mocks.MOCK_PROCESSTRACKING));



      const processTrackingDocument = await processTrackingModel.createProcessTracking(processTrackingInput);

      assert.isOk(processTrackingDocument);

      processTrackingDocId2 = processTrackingDocument._id as mongooseTypes.ObjectId;

      const processTrackings = await processTrackingModel.queryProcessTrackings();
      assert.isArray(processTrackings.results);
      assert.isAtLeast(processTrackings.numberOfItems, 2);
      const expectedDocumentCount =
        processTrackings.numberOfItems <= processTrackings.itemsPerPage
          ? processTrackings.numberOfItems
          : processTrackings.itemsPerPage;
      assert.strictEqual(processTrackings.results.length, expectedDocumentCount);
    });

    it('Get multiple processTrackings with a filter', async () => {
      assert.isOk(processTrackingDocId2);
      const results = await processTrackingModel.queryProcessTrackings({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(processTrackingDocId2);
      const results = await processTrackingModel.queryProcessTrackings({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await processTrackingModel.queryProcessTrackings({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a processTracking', async () => {
      assert.isOk(processTrackingDocId);
      await processTrackingModel.deleteProcessTrackingById(processTrackingDocId.toString());
      let errored = false;
      try {
        await processTrackingModel.getProcessTrackingById(processTrackingDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      processTrackingDocId = null as unknown as ObjectId;
    });
  });
});

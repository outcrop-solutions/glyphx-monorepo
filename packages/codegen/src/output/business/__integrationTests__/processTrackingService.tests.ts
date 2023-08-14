// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_PROCESSTRACKING} from '../mocks';
import {processTrackingService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_PROCESSTRACKING);

describe('#ProcessTrackingService', () => {
  context('test the functions of the processTracking service', () => {
    const mongoConnection = new MongoDbConnection();
    const processTrackingModel = mongoConnection.models.ProcessTrackingModel;
    let processTrackingId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const processTrackingDocument =
        await processTrackingModel.createProcessTracking(
          MOCK_PROCESSTRACKING as unknown as databaseTypes.IProcessTracking
        );

      processTrackingId =
        processTrackingDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (processTrackingId) {
        await processTrackingModel.findByIdAndDelete(processTrackingId);
      }
    });

    it('will retreive our processTracking from the database', async () => {
      const processTracking = await processTrackingService.getProcessTracking(
        processTrackingId
      );
      assert.isOk(processTracking);

      assert.strictEqual(processTracking?.name, MOCK_PROCESSTRACKING.name);
    });

    it('will update our processTracking', async () => {
      assert.isOk(processTrackingId);
      const updatedProcessTracking =
        await processTrackingService.updateProcessTracking(processTrackingId, {
          [propKeys]: generateDataFromType(MOCK),
        });
      assert.strictEqual(updatedProcessTracking.name, INPUT_PROJECT_NAME);

      const savedProcessTracking =
        await processTrackingService.getProcessTracking(processTrackingId);

      assert.strictEqual(savedProcessTracking?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our processTracking', async () => {
      assert.isOk(processTrackingId);
      const updatedProcessTracking =
        await processTrackingService.deleteProcessTracking(processTrackingId);
      assert.strictEqual(updatedProcessTracking[propKeys[0]], propKeys[0]);

      const savedProcessTracking =
        await processTrackingService.getProcessTracking(processTrackingId);

      assert.isOk(savedProcessTracking?.deletedAt);
    });
  });
});

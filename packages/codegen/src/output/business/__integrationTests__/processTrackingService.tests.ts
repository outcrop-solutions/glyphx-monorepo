// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from '../../../../database';
import * as mocks from '../../database/mongoose/mocks';
import {processTrackingService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_PROCESSTRACKING);

describe('#ProcessTrackingService', () => {
  context('test the functions of the processTracking service', () => {
    const mongoConnection = new MongoDbConnection();
    const processTrackingModel = mongoConnection.models.ProcessTrackingModel;
    let processTrackingId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const processTrackingDocument =
        await processTrackingModel.createProcessTracking(
          mocks.MOCK_PROCESSTRACKING as unknown as databaseTypes.IProcessTracking
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
    });

    // updates and deletes
    it('will update our processTracking', async () => {
      assert.isOk(processTrackingId);
      const updatedProcessTracking =
        await processTrackingService.updateProcessTracking(processTrackingId, {
          deletedAt: new Date(),
        });
      assert.isOk(updatedProcessTracking.deletedAt);

      const savedProcessTracking =
        await processTrackingService.getProcessTracking(processTrackingId);

      assert.isOk(savedProcessTracking!.deletedAt);
    });
  });
});

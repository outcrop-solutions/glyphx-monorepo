// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_ACTIVITYLOG} from '../mocks';
import {activityLogService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_ACTIVITYLOG);

describe('#ActivityLogService', () => {
  context('test the functions of the activityLog service', () => {
    const mongoConnection = new MongoDbConnection();
    const activityLogModel = mongoConnection.models.ActivityLogModel;
    let activityLogId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const activityLogDocument = await activityLogModel.createActivityLog(
        MOCK_ACTIVITYLOG as unknown as databaseTypes.IActivityLog
      );

      activityLogId =
        activityLogDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (activityLogId) {
        await activityLogModel.findByIdAndDelete(activityLogId);
      }
    });

    it('will retreive our activityLog from the database', async () => {
      const activityLog = await activityLogService.getActivityLog(
        activityLogId
      );
      assert.isOk(activityLog);

      assert.strictEqual(activityLog?.name, MOCK_ACTIVITYLOG.name);
    });

    it('will update our activityLog', async () => {
      assert.isOk(activityLogId);
      const updatedActivityLog = await activityLogService.updateActivityLog(
        activityLogId,
        {
          [propKeys]: generateDataFromType(MOCK),
        }
      );
      assert.strictEqual(updatedActivityLog.name, INPUT_PROJECT_NAME);

      const savedActivityLog = await activityLogService.getActivityLog(
        activityLogId
      );

      assert.strictEqual(savedActivityLog?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our activityLog', async () => {
      assert.isOk(activityLogId);
      const updatedActivityLog = await activityLogService.deleteActivityLog(
        activityLogId
      );
      assert.strictEqual(updatedActivityLog[propKeys[0]], propKeys[0]);

      const savedActivityLog = await activityLogService.getActivityLog(
        activityLogId
      );

      assert.isOk(savedActivityLog?.deletedAt);
    });
  });
});

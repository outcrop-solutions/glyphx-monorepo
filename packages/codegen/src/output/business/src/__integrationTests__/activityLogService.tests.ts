// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks'
import { activityLogService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_ACTIVITYLOG)

describe('#ActivityLogService', () => {
  context('test the functions of the activityLog service', () => {
    const mongoConnection = new MongoDbConnection();
    const activityLogModel = mongoConnection.models.ActivityLogModel;
    let activityLogId: ObjectId;

    const actorModel = mongoConnection.models.UserModel;
    let actorId: ObjectId;
    const workspaceModel = mongoConnection.models.WorkspaceModel;
    let workspaceId: ObjectId;
    const projectModel = mongoConnection.models.ProjectModel;
    let projectId: ObjectId;
    const userAgentModel = mongoConnection.models.UserAgentModel;
    let userAgentId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const activityLogDocument = await activityLogModel.createActivityLog(
        // @ts-ignore
        mocks.MOCK_ACTIVITYLOG as unknown as databaseTypes.IActivityLog
      );
      activityLogId = activityLogDocument._id as unknown as mongooseTypes.ObjectId;



      const savedActorDocument = await actorModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      actorId =  savedActorDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(actorId)


      const savedWorkspaceDocument = await workspaceModel.create([mocks.MOCK_WORKSPACE], {
        validateBeforeSave: false,
      });
      workspaceId =  savedWorkspaceDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(workspaceId)


      const savedProjectDocument = await projectModel.create([mocks.MOCK_PROJECT], {
        validateBeforeSave: false,
      });
      projectId =  savedProjectDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(projectId)


      const savedUserAgentDocument = await userAgentModel.create([mocks.MOCK_USERAGENT], {
        validateBeforeSave: false,
      });
      userAgentId =  savedUserAgentDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(userAgentId)



    });

    after(async () => {
      if (activityLogId) {
        await activityLogModel.findByIdAndDelete(activityLogId);
      }
       if (actorId) {
        await actorModel.findByIdAndDelete(actorId);
      }
       if (workspaceId) {
        await workspaceModel.findByIdAndDelete(workspaceId);
      }
       if (projectId) {
        await projectModel.findByIdAndDelete(projectId);
      }
       if (userAgentId) {
        await userAgentModel.findByIdAndDelete(userAgentId);
      }
    });

    it('will retreive our activityLog from the database', async () => {
      const activityLog = await activityLogService.getActivityLog(activityLogId);
      assert.isOk(activityLog);
    });

    // updates and deletes
    it('will update our activityLog', async () => {
      assert.isOk(activityLogId);
      const updatedActivityLog = await activityLogService.updateActivityLog(activityLogId, {
        deletedAt: new Date()
      });
      assert.isOk(updatedActivityLog.deletedAt);

      const savedActivityLog = await activityLogService.getActivityLog(activityLogId);

      assert.isOk(savedActivityLog!.deletedAt);
    });
  });
});

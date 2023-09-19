// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks'
import { workspaceService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_WORKSPACE)

describe('#WorkspaceService', () => {
  context('test the functions of the workspace service', () => {
    const mongoConnection = new MongoDbConnection();
    const workspaceModel = mongoConnection.models.WorkspaceModel;
    let workspaceId: ObjectId;

    const creatorModel = mongoConnection.models.UserModel;
    let creatorId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const workspaceDocument = await workspaceModel.createWorkspace(
        // @ts-ignore
        mocks.MOCK_WORKSPACE as unknown as databaseTypes.IWorkspace
      );
      workspaceId = workspaceDocument._id as unknown as mongooseTypes.ObjectId;



      const savedCreatorDocument = await creatorModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      creatorId =  savedCreatorDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(creatorId)

    });

    after(async () => {
      if (workspaceId) {
        await workspaceModel.findByIdAndDelete(workspaceId);
      }
       if (creatorId) {
        await creatorModel.findByIdAndDelete(creatorId);
      }
    });

    it('will retreive our workspace from the database', async () => {
      const workspace = await workspaceService.getWorkspace(workspaceId);
      assert.isOk(workspace);
    });

    // updates and deletes
    it('will update our workspace', async () => {
      assert.isOk(workspaceId);
      const updatedWorkspace = await workspaceService.updateWorkspace(workspaceId, {
        deletedAt: new Date()
      });
      assert.isOk(updatedWorkspace.deletedAt);

      const savedWorkspace = await workspaceService.getWorkspace(workspaceId);

      assert.isOk(savedWorkspace!.deletedAt);
    });
  });
});

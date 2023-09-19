// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks'
import { stateService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_STATE)

describe('#StateService', () => {
  context('test the functions of the state service', () => {
    const mongoConnection = new MongoDbConnection();
    const stateModel = mongoConnection.models.StateModel;
    let stateId: ObjectId;

    const createdByModel = mongoConnection.models.UserModel;
    let createdById: ObjectId;
    const projectModel = mongoConnection.models.ProjectModel;
    let projectId: ObjectId;
    const workspaceModel = mongoConnection.models.WorkspaceModel;
    let workspaceId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const stateDocument = await stateModel.createState(
        // @ts-ignore
        mocks.MOCK_STATE as unknown as databaseTypes.IState
      );
      stateId = stateDocument._id as unknown as mongooseTypes.ObjectId;


      const savedCreatedByDocument = await createdByModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      createdById =  savedCreatedByDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(createdById)






      const savedProjectDocument = await projectModel.create([mocks.MOCK_PROJECT], {
        validateBeforeSave: false,
      });
      projectId =  savedProjectDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(projectId)


      const savedWorkspaceDocument = await workspaceModel.create([mocks.MOCK_WORKSPACE], {
        validateBeforeSave: false,
      });
      workspaceId =  savedWorkspaceDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(workspaceId)

    });

    after(async () => {
      if (stateId) {
        await stateModel.findByIdAndDelete(stateId);
      }
       if (createdById) {
        await createdByModel.findByIdAndDelete(createdById);
      }
       if (projectId) {
        await projectModel.findByIdAndDelete(projectId);
      }
       if (workspaceId) {
        await workspaceModel.findByIdAndDelete(workspaceId);
      }
    });

    it('will retreive our state from the database', async () => {
      const state = await stateService.getState(stateId);
      assert.isOk(state);
    });

    // updates and deletes
    it('will update our state', async () => {
      assert.isOk(stateId);
      const updatedState = await stateService.updateState(stateId, {
        deletedAt: new Date()
      });
      assert.isOk(updatedState.deletedAt);

      const savedState = await stateService.getState(stateId);

      assert.isOk(savedState!.deletedAt);
    });
  });
});

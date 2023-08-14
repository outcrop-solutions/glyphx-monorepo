// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_WORKSPACE} from '../mocks';
import {workspaceService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_WORKSPACE);

describe('#WorkspaceService', () => {
  context('test the functions of the workspace service', () => {
    const mongoConnection = new MongoDbConnection();
    const workspaceModel = mongoConnection.models.WorkspaceModel;
    let workspaceId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const workspaceDocument = await workspaceModel.createWorkspace(
        MOCK_WORKSPACE as unknown as databaseTypes.IWorkspace
      );

      workspaceId = workspaceDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (workspaceId) {
        await workspaceModel.findByIdAndDelete(workspaceId);
      }
    });

    it('will retreive our workspace from the database', async () => {
      const workspace = await workspaceService.getWorkspace(workspaceId);
      assert.isOk(workspace);

      assert.strictEqual(workspace?.name, MOCK_WORKSPACE.name);
    });

    it('will update our workspace', async () => {
      assert.isOk(workspaceId);
      const updatedWorkspace = await workspaceService.updateWorkspace(
        workspaceId,
        {
          [propKeys]: generateDataFromType(MOCK),
        }
      );
      assert.strictEqual(updatedWorkspace.name, INPUT_PROJECT_NAME);

      const savedWorkspace = await workspaceService.getWorkspace(workspaceId);

      assert.strictEqual(savedWorkspace?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our workspace', async () => {
      assert.isOk(workspaceId);
      const updatedWorkspace = await workspaceService.deleteWorkspace(
        workspaceId
      );
      assert.strictEqual(updatedWorkspace[propKeys[0]], propKeys[0]);

      const savedWorkspace = await workspaceService.getWorkspace(workspaceId);

      assert.isOk(savedWorkspace?.deletedAt);
    });
  });
});

// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_PROJECT} from '../mocks';
import {projectService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_PROJECT);

describe('#ProjectService', () => {
  context('test the functions of the project service', () => {
    const mongoConnection = new MongoDbConnection();
    const projectModel = mongoConnection.models.ProjectModel;
    let projectId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const projectDocument = await projectModel.createProject(
        MOCK_PROJECT as unknown as databaseTypes.IProject
      );

      projectId = projectDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (projectId) {
        await projectModel.findByIdAndDelete(projectId);
      }
    });

    it('will retreive our project from the database', async () => {
      const project = await projectService.getProject(projectId);
      assert.isOk(project);

      assert.strictEqual(project?.name, MOCK_PROJECT.name);
    });

    it('will update our project', async () => {
      assert.isOk(projectId);
      const updatedProject = await projectService.updateProject(projectId, {
        [propKeys]: generateDataFromType(MOCK),
      });
      assert.strictEqual(updatedProject.name, INPUT_PROJECT_NAME);

      const savedProject = await projectService.getProject(projectId);

      assert.strictEqual(savedProject?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our project', async () => {
      assert.isOk(projectId);
      const updatedProject = await projectService.deleteProject(projectId);
      assert.strictEqual(updatedProject[propKeys[0]], propKeys[0]);

      const savedProject = await projectService.getProject(projectId);

      assert.isOk(savedProject?.deletedAt);
    });
  });
});

// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from '../../../../database';
import * as mocks from '../../database/mongoose/mocks';
import {projectService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_PROJECT);

describe('#ProjectService', () => {
  context('test the functions of the project service', () => {
    const mongoConnection = new MongoDbConnection();
    const projectModel = mongoConnection.models.ProjectModel;
    let projectId: ObjectId;

    const workspaceModel = mongoConnection.models.WorkspaceModel;
    let workspaceId: ObjectId;
    const templateModel = mongoConnection.models.ProjectTemplateModel;
    let templateId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const projectDocument = await projectModel.createProject(
        mocks.MOCK_PROJECT as unknown as databaseTypes.IProject
      );
      projectId = projectDocument._id as unknown as mongooseTypes.ObjectId;

      const savedWorkspaceDocument = await workspaceModel.create(
        [mocks.MOCK_WORKSPACE],
        {
          validateBeforeSave: false,
        }
      );
      workspaceId = savedWorkspaceDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(workspaceId);

      const savedTemplateDocument = await templateModel.create(
        [mocks.MOCK_PROJECTTEMPLATE],
        {
          validateBeforeSave: false,
        }
      );
      templateId = savedTemplateDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(templateId);
    });

    after(async () => {
      if (projectId) {
        await projectModel.findByIdAndDelete(projectId);
      }
      if (workspaceId) {
        await workspaceModel.findByIdAndDelete(workspaceId);
      }
      if (templateId) {
        await templateModel.findByIdAndDelete(templateId);
      }
    });

    it('will retreive our project from the database', async () => {
      const project = await projectService.getProject(projectId);
      assert.isOk(project);
    });

    // updates and deletes
    it('will update our project', async () => {
      assert.isOk(projectId);
      const updatedProject = await projectService.updateProject(projectId, {
        deletedAt: new Date(),
      });
      assert.isOk(updatedProject.deletedAt);

      const savedProject = await projectService.getProject(projectId);

      assert.isOk(savedProject!.deletedAt);
    });
  });
});

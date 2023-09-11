// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks';
import {projectTemplateService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_PROJECTTEMPLATE);

describe('#ProjectTemplateService', () => {
  context('test the functions of the projectTemplate service', () => {
    const mongoConnection = new MongoDbConnection();
    const projectTemplateModel = mongoConnection.models.ProjectTemplateModel;
    let projectTemplateId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const projectTemplateDocument =
        await projectTemplateModel.createProjectTemplate(
          // @ts-ignore
          mocks.MOCK_PROJECTTEMPLATE as unknown as databaseTypes.IProjectTemplate
        );
      projectTemplateId =
        projectTemplateDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (projectTemplateId) {
        await projectTemplateModel.findByIdAndDelete(projectTemplateId);
      }
    });

    it('will retreive our projectTemplate from the database', async () => {
      const projectTemplate =
        await projectTemplateService.getProjectTemplate(projectTemplateId);
      assert.isOk(projectTemplate);
    });

    // updates and deletes
    it('will update our projectTemplate', async () => {
      assert.isOk(projectTemplateId);
      const updatedProjectTemplate =
        await projectTemplateService.updateProjectTemplate(projectTemplateId, {
          deletedAt: new Date(),
        });
      assert.isOk(updatedProjectTemplate.deletedAt);

      const savedProjectTemplate =
        await projectTemplateService.getProjectTemplate(projectTemplateId);

      assert.isOk(savedProjectTemplate!.deletedAt);
    });
  });
});

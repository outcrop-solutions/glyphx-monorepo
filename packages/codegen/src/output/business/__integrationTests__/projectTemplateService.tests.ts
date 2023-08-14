// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_PROJECTTEMPLATE} from '../mocks';
import {projectTemplateService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_PROJECTTEMPLATE);

describe('#ProjectTemplateService', () => {
  context('test the functions of the projectTemplate service', () => {
    const mongoConnection = new MongoDbConnection();
    const projectTemplateModel = mongoConnection.models.ProjectTemplateModel;
    let projectTemplateId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const projectTemplateDocument =
        await projectTemplateModel.createProjectTemplate(
          MOCK_PROJECTTEMPLATE as unknown as databaseTypes.IProjectTemplate
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
      const projectTemplate = await projectTemplateService.getProjectTemplate(
        projectTemplateId
      );
      assert.isOk(projectTemplate);

      assert.strictEqual(projectTemplate?.name, MOCK_PROJECTTEMPLATE.name);
    });

    it('will update our projectTemplate', async () => {
      assert.isOk(projectTemplateId);
      const updatedProjectTemplate =
        await projectTemplateService.updateProjectTemplate(projectTemplateId, {
          [propKeys]: generateDataFromType(MOCK),
        });
      assert.strictEqual(updatedProjectTemplate.name, INPUT_PROJECT_NAME);

      const savedProjectTemplate =
        await projectTemplateService.getProjectTemplate(projectTemplateId);

      assert.strictEqual(savedProjectTemplate?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our projectTemplate', async () => {
      assert.isOk(projectTemplateId);
      const updatedProjectTemplate =
        await projectTemplateService.deleteProjectTemplate(projectTemplateId);
      assert.strictEqual(updatedProjectTemplate[propKeys[0]], propKeys[0]);

      const savedProjectTemplate =
        await projectTemplateService.getProjectTemplate(projectTemplateId);

      assert.isOk(savedProjectTemplate?.deletedAt);
    });
  });
});

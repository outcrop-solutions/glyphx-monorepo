import 'mocha';
import {assert} from 'chai';
import {v4} from 'uuid';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {databaseTypes, fileIngestionTypes} from 'types';
import {projectTemplateService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

const INPUT_PROJECT_TEMPLATE: databaseTypes.IProjectTemplate = {
  _id: new mongooseTypes.ObjectId(),
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'projectTemplateTest',
  projects: [],
  tags: [],
  shape: [
    {
      key: '',
      type: fileIngestionTypes.constants.FIELD_TYPE,
      required: false,
      description: '',
    },
  ],
};

describe('#ProjectTemplateService', () => {
  const mongoConnection = new MongoDbConnection();

  context('test the functions of the project template service', () => {
    let projectTemplateId: ObjectId;
    // let projectTemplateDocument;

    before(async () => {
      await mongoConnection.init();
      const projectTemplateModel = mongoConnection.models.ProjectTemplateModel;

      await projectTemplateModel.createProjectTemplate(
        INPUT_PROJECT_TEMPLATE as databaseTypes.IProjectTemplate
      );

      const savedProjectTemplateDocument = await projectTemplateModel
        .findOne({name: INPUT_PROJECT_TEMPLATE.name})
        .lean();
      projectTemplateId =
        savedProjectTemplateDocument?._id as mongooseTypes.ObjectId;

      //   projectTemplateDocument = savedProjectTemplateDocument;

      assert.isOk(projectTemplateId);
    });

    after(async () => {
      const projectTemplateModel = mongoConnection.models.ProjectTemplateModel;
      await projectTemplateModel.findByIdAndDelete(projectTemplateId);

      if (projectTemplateId) {
        await projectTemplateModel.findByIdAndDelete(projectTemplateId);
      }
    });

    it('will retreive our projectTemplate from the database', async () => {
      const projectTemplate = await projectTemplateService.getProjectTemplate(
        projectTemplateId
      );
      assert.isOk(projectTemplate);

      assert.strictEqual(projectTemplate?.name, INPUT_PROJECT_TEMPLATE.name);
    });
    it('will retreive projectTemplates from the database', async () => {
      const projectTemplate = await projectTemplateService.getProjectTemplates(
        projectTemplateId
      );
      assert.isOk(projectTemplate);

      assert.strictEqual(projectTemplate?.name, INPUT_PROJECT_TEMPLATE.name);
    });
    it('will create a projectTemplate from a project', async () => {
      const projectTemplate =
        await projectTemplateService.createProjectFromTemplate(
          projectTemplateId
        );
      assert.isOk(projectTemplate);

      assert.strictEqual(projectTemplate?.name, INPUT_PROJECT_TEMPLATE.name);
    });
    it('will create a project from a projectTemplate', async () => {
      const projectTemplate =
        await projectTemplateService.cloneProjectFromTemplate(
          projectTemplateId
        );
      assert.isOk(projectTemplate);

      assert.strictEqual(projectTemplate?.name, INPUT_PROJECT_TEMPLATE.name);
    });
    it('will deactivate a projectTemplate', async () => {
      const projectTemplate = await projectTemplateService.deactivate(
        projectTemplateId
      );
      assert.isOk(projectTemplate);

      assert.strictEqual(projectTemplate?.name, INPUT_PROJECT_TEMPLATE.name);
    });
    it('will update the projectTemplate', async () => {
      const projectTemplate =
        await projectTemplateService.updateProjectTemplate(projectTemplateId);
      assert.isOk(projectTemplate);

      assert.strictEqual(projectTemplate?.name, INPUT_PROJECT_TEMPLATE.name);
    });
    it('will add tags to a project template', async () => {
      const projectTemplate = await projectTemplateService.addTags(
        projectTemplateId
      );
      assert.isOk(projectTemplate);

      assert.strictEqual(projectTemplate?.name, INPUT_PROJECT_TEMPLATE.name);
    });
    it('will remove tags from a project template', async () => {
      const projectTemplate = await projectTemplateService.removeTags(
        projectTemplateId
      );
      assert.isOk(projectTemplate);

      assert.strictEqual(projectTemplate?.name, INPUT_PROJECT_TEMPLATE.name);
    });
    it('will transform a project and make it suitable for template creation', async () => {
      const projectTemplate = await projectTemplateService.cleanProject(
        projectTemplateId
      );
      assert.isOk(projectTemplate);

      assert.strictEqual(projectTemplate?.name, INPUT_PROJECT_TEMPLATE.name);
    });
    it('will transform a project template and make it suitable for project creation', async () => {
      const projectTemplate = await projectTemplateService.cleanProjectTemplate(
        projectTemplateId
      );
      assert.isOk(projectTemplate);

      assert.strictEqual(projectTemplate?.name, INPUT_PROJECT_TEMPLATE.name);
    });
  });
});

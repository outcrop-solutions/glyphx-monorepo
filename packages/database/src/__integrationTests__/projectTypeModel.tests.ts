import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');
const INPUT_PROJECT = {
  name: 'testProject' + UNIQUE_KEY,
  template: new mongooseTypes.ObjectId(),
  owner: new mongooseTypes.ObjectId(),
  files: [],
};

const INPUT_PROJECT2 = {
  name: 'testProject2' + UNIQUE_KEY,
  template: new mongooseTypes.ObjectId(),
  owner: new mongooseTypes.ObjectId(),
  files: [],
};

const INPUT_DATA = {
  name: 'testProjectTemplate' + UNIQUE_KEY,
  projects: [],
  shape: {field1: {type: 'string', required: true}},
};

const INPUT_DATA2 = {
  name: 'testProjectTemplate2' + UNIQUE_KEY,
  projects: [],
  shape: {field1: {type: 'string', required: true}},
};

describe('#ProjectTemplateModel', () => {
  context('test the crud functions of the projectTemplate model', () => {
    const mongoConnection = new MongoDbConnection();
    const projectTemplateModel = mongoConnection.models.ProjectTemplateModel;
    let projectTemplateId: ObjectId;
    let projectTemplateId2: ObjectId;
    let projectId: ObjectId;
    let projectId2: ObjectId;
    let projectDocument: any;

    before(async () => {
      await mongoConnection.init();
      const projectModel = mongoConnection.models.ProjectModel;

      await projectModel.create([INPUT_PROJECT], {validateBeforeSave: false});
      const savedProjectDocument = await projectModel
        .findOne({name: INPUT_PROJECT.name})
        .lean();
      projectId = savedProjectDocument?._id as mongooseTypes.ObjectId;

      projectDocument = savedProjectDocument;

      assert.isOk(projectId);

      await projectModel.create([INPUT_PROJECT2], {validateBeforeSave: false});
      const savedProjectDocument2 = await projectModel
        .findOne({name: INPUT_PROJECT2.name})
        .lean();
      projectId2 = savedProjectDocument2?._id as mongooseTypes.ObjectId;

      assert.isOk(projectId2);
    });

    after(async () => {
      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);
      await projectModel.findByIdAndDelete(projectId2);

      if (projectTemplateId) {
        await projectTemplateModel.findByIdAndDelete(projectTemplateId);
      }
      if (projectTemplateId2) {
        await projectTemplateModel.findByIdAndDelete(projectTemplateId2);
      }
    });

    it('add a new projectTemplate ', async () => {
      const projectTemplateInput = JSON.parse(JSON.stringify(INPUT_DATA));
      projectTemplateInput.projects.push(projectDocument);
      const projectTemplateDocument =
        await projectTemplateModel.createProjectTemplate(projectTemplateInput);

      assert.isOk(projectTemplateDocument);
      assert.strictEqual(
        projectTemplateDocument.name,
        projectTemplateInput.name
      );
      assert.strictEqual(
        projectTemplateDocument.projects[0].name,
        projectDocument.name
      );

      projectTemplateId = projectTemplateDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a project type', async () => {
      assert.isOk(projectTemplateId);
      const projectTemplate = await projectTemplateModel.getProjectTemplateById(
        projectTemplateId
      );

      assert.isOk(projectTemplate);
      assert.strictEqual(
        projectTemplate._id?.toString(),
        projectTemplateId.toString()
      );
    });

    it('Get multiple projectTemplates without a filter', async () => {
      assert.isOk(projectTemplateId);
      const projectTemplateInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      projectTemplateInput.projects.push(projectDocument);
      const projectTemplateDocument =
        await projectTemplateModel.createProjectTemplate(projectTemplateInput);

      assert.isOk(projectTemplateDocument);
      projectTemplateId2 =
        projectTemplateDocument._id as mongooseTypes.ObjectId;

      const projectTemplates =
        await projectTemplateModel.queryProjectTemplates();
      assert.isArray(projectTemplates.results);
      assert.isAtLeast(projectTemplates.numberOfItems, 2);
      const expectedDocumentCount =
        projectTemplates.numberOfItems <= projectTemplates.itemsPerPage
          ? projectTemplates.numberOfItems
          : projectTemplates.itemsPerPage;
      assert.strictEqual(
        projectTemplates.results.length,
        expectedDocumentCount
      );
    });

    it('Get multiple projectTemplates with a filter', async () => {
      assert.isOk(projectTemplateId2);
      const results = await projectTemplateModel.queryProjectTemplates({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page projectTemplates', async () => {
      assert.isOk(projectTemplateId2);
      const results = await projectTemplateModel.queryProjectTemplates(
        {},
        0,
        1
      );
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await projectTemplateModel.queryProjectTemplates(
        {},
        1,
        1
      );
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a project from the projectTemplate', async () => {
      assert.isOk(projectTemplateId);
      const updatedProjectTemplateDocument =
        await projectTemplateModel.removeProjects(projectTemplateId, [
          projectId2,
        ]);
      assert.strictEqual(updatedProjectTemplateDocument.projects.length, 1);
      assert.strictEqual(
        updatedProjectTemplateDocument.projects[0]?._id?.toString(),
        projectId.toString()
      );
    });
    it('modify a project type', async () => {
      assert.isOk(projectTemplateId);
      const input = {name: 'testProjectName_modified' + UNIQUE_KEY};
      const updatedDocument =
        await projectTemplateModel.updateProjectTemplateById(
          projectTemplateId,
          input
        );
      assert.strictEqual(updatedDocument.name, input.name);
    });

    it('add a project to the projectTemplate', async () => {
      assert.isOk(projectTemplateId);
      const updatedProjectTemplateDocument =
        await projectTemplateModel.addProjects(projectTemplateId, [projectId2]);
      assert.strictEqual(updatedProjectTemplateDocument.projects.length, 2);
      assert.strictEqual(
        updatedProjectTemplateDocument.projects[1]?._id?.toString(),
        projectId2.toString()
      );
    });

    it('remove a project type', async () => {
      assert.isOk(projectTemplateId);
      await projectTemplateModel.deleteProjectTemplateById(projectTemplateId);
      let errored = false;
      try {
        await projectTemplateModel.getProjectTemplateById(projectTemplateId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      projectTemplateId = null as unknown as ObjectId;
    });
  });
});

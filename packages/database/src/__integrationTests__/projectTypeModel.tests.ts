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
  context('test the crud functions of the projectType model', () => {
    const mongoConnection = new MongoDbConnection();
    const projectTypeModel = mongoConnection.models.ProjectTemplateModel;
    let projectTypeId: ObjectId;
    let projectTypeId2: ObjectId;
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

      if (projectTypeId) {
        await projectTypeModel.findByIdAndDelete(projectTypeId);
      }
      if (projectTypeId2) {
        await projectTypeModel.findByIdAndDelete(projectTypeId2);
      }
    });

    it('add a new projectType ', async () => {
      const projectTypeInput = JSON.parse(JSON.stringify(INPUT_DATA));
      projectTypeInput.projects.push(projectDocument);
      const projectTypeDocument = await projectTypeModel.createProjectTemplate(
        projectTypeInput
      );

      assert.isOk(projectTypeDocument);
      assert.strictEqual(projectTypeDocument.name, projectTypeInput.name);
      assert.strictEqual(
        projectTypeDocument.projects[0].name,
        projectDocument.name
      );

      projectTypeId = projectTypeDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a project type', async () => {
      assert.isOk(projectTypeId);
      const projectType = await projectTypeModel.getProjectTemplateById(
        projectTypeId
      );

      assert.isOk(projectType);
      assert.strictEqual(projectType._id?.toString(), projectTypeId.toString());
    });

    it('Get multiple projectTypes without a filter', async () => {
      assert.isOk(projectTypeId);
      const projectTypeInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      projectTypeInput.projects.push(projectDocument);
      const projectTypeDocument = await projectTypeModel.createProjectTemplate(
        projectTypeInput
      );

      assert.isOk(projectTypeDocument);
      projectTypeId2 = projectTypeDocument._id as mongooseTypes.ObjectId;

      const projectTypes = await projectTypeModel.queryProjectTemplates();
      assert.isArray(projectTypes.results);
      assert.isAtLeast(projectTypes.numberOfItems, 2);
      const expectedDocumentCount =
        projectTypes.numberOfItems <= projectTypes.itemsPerPage
          ? projectTypes.numberOfItems
          : projectTypes.itemsPerPage;
      assert.strictEqual(projectTypes.results.length, expectedDocumentCount);
    });

    it('Get multiple projectTypes with a filter', async () => {
      assert.isOk(projectTypeId2);
      const results = await projectTypeModel.queryProjectTemplates({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page projectTypes', async () => {
      assert.isOk(projectTypeId2);
      const results = await projectTypeModel.queryProjectTemplates({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await projectTypeModel.queryProjectTemplates({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a project from the projectType', async () => {
      assert.isOk(projectTypeId);
      const updatedProjectTemplateDocument =
        await projectTypeModel.removeProjects(projectTypeId, [projectId2]);
      assert.strictEqual(updatedProjectTemplateDocument.projects.length, 1);
      assert.strictEqual(
        updatedProjectTemplateDocument.projects[0]?._id?.toString(),
        projectId.toString()
      );
    });
    it('modify a project type', async () => {
      assert.isOk(projectTypeId);
      const input = {name: 'testProjectName_modified' + UNIQUE_KEY};
      const updatedDocument = await projectTypeModel.updateProjectTemplateById(
        projectTypeId,
        input
      );
      assert.strictEqual(updatedDocument.name, input.name);
    });

    it('add a project to the projectType', async () => {
      assert.isOk(projectTypeId);
      const updatedProjectTemplateDocument = await projectTypeModel.addProjects(
        projectTypeId,
        [projectId2]
      );
      assert.strictEqual(updatedProjectTemplateDocument.projects.length, 2);
      assert.strictEqual(
        updatedProjectTemplateDocument.projects[1]?._id?.toString(),
        projectId2.toString()
      );
    });

    it('remove a project type', async () => {
      assert.isOk(projectTypeId);
      await projectTypeModel.deleteProjectTemplateById(projectTypeId);
      let errored = false;
      try {
        await projectTypeModel.getProjectTemplateById(projectTypeId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      projectTypeId = null as unknown as ObjectId;
    });
  });
});

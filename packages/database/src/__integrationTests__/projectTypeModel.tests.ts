import 'mocha';
import {assert} from 'chai';
import {mongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const uniqueKey = v4().replaceAll('-', '');
const inputProject = {
  name: 'testProject' + uniqueKey,
  isTemplate: false,
  type: new mongooseTypes.ObjectId(),
  owner: new mongooseTypes.ObjectId(),
  files: [],
};

const inputProject2 = {
  name: 'testProject2' + uniqueKey,
  isTemplate: false,
  type: new mongooseTypes.ObjectId(),
  owner: new mongooseTypes.ObjectId(),
  files: [],
};

const inputData = {
  name: 'testProjectType' + uniqueKey,
  projects: [],
  shape: {field1: {type: 'string', required: true}},
};

describe('#ProjectTypeModel', () => {
  context('test the crud functions of the projectType model', () => {
    const mongoConnection = new mongoDbConnection();
    const projectTypeModel = mongoConnection.models.ProjectTypeModel;
    let projectTypeId: ObjectId;
    let projectId: ObjectId;
    let projectId2: ObjectId;
    let projectDocument: any;
    let projectDocument2: any;

    before(async () => {
      await mongoConnection.init();
      const projectModel = mongoConnection.models.ProjectModel;

      await projectModel.create([inputProject], {validateBeforeSave: false});
      const savedProjectDocument = await projectModel
        .findOne({name: inputProject.name})
        .lean();
      projectId = savedProjectDocument?._id as mongooseTypes.ObjectId;

      projectDocument = savedProjectDocument;

      assert.isOk(projectId);

      await projectModel.create([inputProject2], {validateBeforeSave: false});
      const savedProjectDocument2 = await projectModel
        .findOne({name: inputProject2.name})
        .lean();
      projectId2 = savedProjectDocument2?._id as mongooseTypes.ObjectId;

      projectDocument2 = savedProjectDocument2;

      assert.isOk(projectId2);
    });

    after(async () => {
      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);
      await projectModel.findByIdAndDelete(projectId2);

      if (projectTypeId) {
        await projectTypeModel.findByIdAndDelete(projectTypeId);
      }
    });

    it('add a new projectType ', async () => {
      const projectTypeInput = JSON.parse(JSON.stringify(inputData));
      projectTypeInput.projects.push(projectDocument);
      const projectTypeDocument = await projectTypeModel.createProjectType(
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
      const projectType = await projectTypeModel.getProjectTypeById(
        projectTypeId
      );

      assert.isOk(projectType);
      assert.strictEqual(projectType._id?.toString(), projectTypeId.toString());
    });

    it('modify a project type', async () => {
      assert.isOk(projectTypeId);
      const input = {name: 'testProjectName_modified' + uniqueKey};
      const updatedDocument = await projectTypeModel.updateProjectTypeById(
        projectTypeId,
        input
      );
      assert.strictEqual(updatedDocument.name, input.name);
    });

    it('add a project to the projectType', async () => {
      assert.isOk(projectTypeId);
      const updatedProjectTypeDocument = await projectTypeModel.addProjects(
        projectTypeId,
        [projectId2]
      );
      assert.strictEqual(updatedProjectTypeDocument.projects.length, 2);
      assert.strictEqual(
        updatedProjectTypeDocument.projects[1]?._id?.toString(),
        projectId2.toString()
      );
    });

    it('remove a project from the projectType', async () => {
      assert.isOk(projectTypeId);
      const updatedProjectTypeDocument = await projectTypeModel.removeProjects(
        projectTypeId,
        [projectId2]
      );
      assert.strictEqual(updatedProjectTypeDocument.projects.length, 1);
      assert.strictEqual(
        updatedProjectTypeDocument.projects[0]?._id?.toString(),
        projectId.toString()
      );
    });

    it('remove a project type', async () => {
      assert.isOk(projectTypeId);
      await projectTypeModel.deleteProjectTypeById(projectTypeId);
      let errored = false;
      try {
        const document = await projectTypeModel.getProjectTypeById(
          projectTypeId
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      projectTypeId = null as unknown as ObjectId;
    });
  });
});

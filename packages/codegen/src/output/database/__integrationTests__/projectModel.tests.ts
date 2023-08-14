// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#ProjectModel', () => {
  context('test the crud functions of the project model', () => {
    const mongoConnection = new MongoDbConnection();
    const projectModel = mongoConnection.models.ProjectModel;
    let projectId: ObjectId;
    let memberId: ObjectId;
    let projectId2: ObjectId;
    let workspaceId: ObjectId;
    let projectTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let projectTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const projectTemplateModel = mongoConnection.models.ProjectTemplateModel;

      await workspaceModel.create([INPUT_WORKSPACE], {
        validateBeforeSave: false,
      });
      const savedWorkspaceDocument = await workspaceModel
        .findOne({name: INPUT_WORKSPACE.name})
        .lean();
      workspaceId = savedWorkspaceDocument?._id as mongooseTypes.ObjectId;
      workspaceDocument = savedWorkspaceDocument;
      assert.isOk(workspaceId);

      await memberModel.create([INPUT_MEMBER], {
        validateBeforeSave: false,
      });
      const savedMemberDocument = await memberModel
        .findOne({email: INPUT_MEMBER.email})
        .lean();
      memberId = savedMemberDocument?._id as mongooseTypes.ObjectId;
      memberDocument = savedMemberDocument;
      assert.isOk(memberId);

      await projectTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedProjectTemplateDocument = await projectTemplateModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      projectTemplateId =
        savedProjectTemplateDocument?._id as mongooseTypes.ObjectId;

      projectTemplateDocument = savedProjectTemplateDocument;

      assert.isOk(projectTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const projectTemplateModel = mongoConnection.models.ProjectTemplateModel;
      await projectTemplateModel.findByIdAndDelete(projectTemplateId);

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (projectId) {
        await projectModel.findByIdAndDelete(projectId);
      }

      if (projectId2) {
        await projectModel.findByIdAndDelete(projectId2);
      }
    });

    it('add a new project ', async () => {
      const projectInput = JSON.parse(JSON.stringify(INPUT_DATA));
      projectInput.workspace = workspaceDocument;
      projectInput.template = projectTemplateDocument;

      const projectDocument = await projectModel.createProject(projectInput);

      assert.isOk(projectDocument);
      assert.strictEqual(projectDocument.name, projectInput.name);
      assert.strictEqual(
        projectDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      projectId = projectDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a project', async () => {
      assert.isOk(projectId);
      const project = await projectModel.getProjectById(projectId);

      assert.isOk(project);
      assert.strictEqual(project._id?.toString(), projectId.toString());
    });

    it('modify a project', async () => {
      assert.isOk(projectId);
      const input = {description: 'a modified description'};
      const updatedDocument = await projectModel.updateProjectById(
        projectId,
        input
      );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple projects without a filter', async () => {
      assert.isOk(projectId);
      const projectInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      projectInput.workspace = workspaceDocument;
      projectInput.type = projectTemplateDocument;

      const projectDocument = await projectModel.createProject(projectInput);

      assert.isOk(projectDocument);

      projectId2 = projectDocument._id as mongooseTypes.ObjectId;

      const projects = await projectModel.queryProjects();
      assert.isArray(projects.results);
      assert.isAtLeast(projects.numberOfItems, 2);
      const expectedDocumentCount =
        projects.numberOfItems <= projects.itemsPerPage
          ? projects.numberOfItems
          : projects.itemsPerPage;
      assert.strictEqual(projects.results.length, expectedDocumentCount);
    });

    it('Get multiple projects with a filter', async () => {
      assert.isOk(projectId2);
      const results = await projectModel.queryProjects({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
      assert.isOk(projectId2);
      const results = await projectModel.queryProjects({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await projectModel.queryProjects({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a project', async () => {
      assert.isOk(projectId);
      await projectModel.deleteProjectById(projectId);
      let errored = false;
      try {
        await projectModel.getProjectById(projectId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      projectId = null as unknown as ObjectId;
    });
  });
});

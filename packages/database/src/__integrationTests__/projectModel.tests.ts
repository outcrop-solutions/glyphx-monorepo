// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks'
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#ProjectModel', () => {
  context('test the crud functions of the project model', () => {
    const mongoConnection = new MongoDbConnection();
    const projectModel = mongoConnection.models.ProjectModel;
    let projectDocId: string;
    let projectDocId2: string;
    let workspaceId: string;
    let workspaceDocument: any;
    let templateId: string;
    let templateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const savedWorkspaceDocument = await workspaceModel.create([mocks.MOCK_WORKSPACE], {
        validateBeforeSave: false,
      });
      workspaceId =  savedWorkspaceDocument[0]!._id.toString();
      assert.isOk(workspaceId)
      const templateModel = mongoConnection.models.ProjectTemplateModel;
      const savedTemplateDocument = await templateModel.create([mocks.MOCK_PROJECTTEMPLATE], {
        validateBeforeSave: false,
      });
      templateId =  savedTemplateDocument[0]!._id.toString();
      assert.isOk(templateId)
    });

    after(async () => {
      if (projectDocId) {
        await projectModel.findByIdAndDelete(projectDocId);
      }

      if (projectDocId2) {
        await projectModel.findByIdAndDelete(projectDocId2);
      }
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);
      const templateModel = mongoConnection.models.ProjectTemplateModel;
      await templateModel.findByIdAndDelete(templateId);

    });

    it('add a new project ', async () => {
      const projectInput = JSON.parse(JSON.stringify(mocks.MOCK_PROJECT));

      projectInput.workspace = workspaceDocument;
      projectInput.template = templateDocument;

      const projectDocument = await projectModel.createProject(projectInput);

      assert.isOk(projectDocument);
      assert.strictEqual(Object.keys(projectDocument)[1], Object.keys(projectInput)[1]);


      projectDocId = projectDocument._id!.toString();
    });

    it('retreive a project', async () => {
      assert.isOk(projectDocId);
      const project = await projectModel.getProjectById(projectDocId);

      assert.isOk(project);
      assert.strictEqual(project._id?.toString(), projectDocId.toString());
    });

    it('modify a project', async () => {
      assert.isOk(projectDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await projectModel.updateProjectById(
        projectDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple projects without a filter', async () => {
      assert.isOk(projectDocId);
      const projectInput = JSON.parse(JSON.stringify(mocks.MOCK_PROJECT));



      const projectDocument = await projectModel.createProject(projectInput);

      assert.isOk(projectDocument);

      projectDocId2 = projectDocument._id!.toString();

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
      assert.isOk(projectDocId2);
      const results = await projectModel.queryProjects({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(projectDocId2);
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
      assert.isOk(projectDocId);
      await projectModel.deleteProjectById(projectDocId.toString());
      let errored = false;
      try {
        await projectModel.getProjectById(projectDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      projectDocId = null as unknown as string;
    });
  });
});

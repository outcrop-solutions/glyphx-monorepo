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

describe('#ProjectTemplateModel', () => {
  context('test the crud functions of the projectTemplate model', () => {
    const mongoConnection = new MongoDbConnection();
    const projectTemplateModel = mongoConnection.models.ProjectTemplateModel;
    let projectTemplateId: ObjectId;
    let memberId: ObjectId;
    let projectTemplateId2: ObjectId;
    let workspaceId: ObjectId;
    let projectTemplateTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let projectTemplateTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const projectTemplateTemplateModel =
        mongoConnection.models.ProjectTemplateTemplateModel;

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

      await projectTemplateTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedProjectTemplateTemplateDocument =
        await projectTemplateTemplateModel
          .findOne({name: INPUT_PROJECT_TYPE.name})
          .lean();
      projectTemplateTemplateId =
        savedProjectTemplateTemplateDocument?._id as mongooseTypes.ObjectId;

      projectTemplateTemplateDocument = savedProjectTemplateTemplateDocument;

      assert.isOk(projectTemplateTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const projectTemplateTemplateModel =
        mongoConnection.models.ProjectTemplateTemplateModel;
      await projectTemplateTemplateModel.findByIdAndDelete(
        projectTemplateTemplateId
      );

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (projectTemplateId) {
        await projectTemplateModel.findByIdAndDelete(projectTemplateId);
      }

      if (projectTemplateId2) {
        await projectTemplateModel.findByIdAndDelete(projectTemplateId2);
      }
    });

    it('add a new projectTemplate ', async () => {
      const projectTemplateInput = JSON.parse(JSON.stringify(INPUT_DATA));
      projectTemplateInput.workspace = workspaceDocument;
      projectTemplateInput.template = projectTemplateTemplateDocument;

      const projectTemplateDocument =
        await projectTemplateModel.createProjectTemplate(projectTemplateInput);

      assert.isOk(projectTemplateDocument);
      assert.strictEqual(
        projectTemplateDocument.name,
        projectTemplateInput.name
      );
      assert.strictEqual(
        projectTemplateDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      projectTemplateId = projectTemplateDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a projectTemplate', async () => {
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

    it('modify a projectTemplate', async () => {
      assert.isOk(projectTemplateId);
      const input = {description: 'a modified description'};
      const updatedDocument =
        await projectTemplateModel.updateProjectTemplateById(
          projectTemplateId,
          input
        );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple projectTemplates without a filter', async () => {
      assert.isOk(projectTemplateId);
      const projectTemplateInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      projectTemplateInput.workspace = workspaceDocument;
      projectTemplateInput.type = projectTemplateTemplateDocument;

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

    it('page accounts', async () => {
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

    it('remove a projectTemplate', async () => {
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

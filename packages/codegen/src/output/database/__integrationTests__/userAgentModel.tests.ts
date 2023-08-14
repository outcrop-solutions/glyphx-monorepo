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

describe('#UserAgentModel', () => {
  context('test the crud functions of the userAgent model', () => {
    const mongoConnection = new MongoDbConnection();
    const userAgentModel = mongoConnection.models.UserAgentModel;
    let userAgentId: ObjectId;
    let memberId: ObjectId;
    let userAgentId2: ObjectId;
    let workspaceId: ObjectId;
    let userAgentTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let userAgentTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const userAgentTemplateModel =
        mongoConnection.models.UserAgentTemplateModel;

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

      await userAgentTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedUserAgentTemplateDocument = await userAgentTemplateModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      userAgentTemplateId =
        savedUserAgentTemplateDocument?._id as mongooseTypes.ObjectId;

      userAgentTemplateDocument = savedUserAgentTemplateDocument;

      assert.isOk(userAgentTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const userAgentTemplateModel =
        mongoConnection.models.UserAgentTemplateModel;
      await userAgentTemplateModel.findByIdAndDelete(userAgentTemplateId);

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (userAgentId) {
        await userAgentModel.findByIdAndDelete(userAgentId);
      }

      if (userAgentId2) {
        await userAgentModel.findByIdAndDelete(userAgentId2);
      }
    });

    it('add a new userAgent ', async () => {
      const userAgentInput = JSON.parse(JSON.stringify(INPUT_DATA));
      userAgentInput.workspace = workspaceDocument;
      userAgentInput.template = userAgentTemplateDocument;

      const userAgentDocument = await userAgentModel.createUserAgent(
        userAgentInput
      );

      assert.isOk(userAgentDocument);
      assert.strictEqual(userAgentDocument.name, userAgentInput.name);
      assert.strictEqual(
        userAgentDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      userAgentId = userAgentDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a userAgent', async () => {
      assert.isOk(userAgentId);
      const userAgent = await userAgentModel.getUserAgentById(userAgentId);

      assert.isOk(userAgent);
      assert.strictEqual(userAgent._id?.toString(), userAgentId.toString());
    });

    it('modify a userAgent', async () => {
      assert.isOk(userAgentId);
      const input = {description: 'a modified description'};
      const updatedDocument = await userAgentModel.updateUserAgentById(
        userAgentId,
        input
      );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple userAgents without a filter', async () => {
      assert.isOk(userAgentId);
      const userAgentInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      userAgentInput.workspace = workspaceDocument;
      userAgentInput.type = userAgentTemplateDocument;

      const userAgentDocument = await userAgentModel.createUserAgent(
        userAgentInput
      );

      assert.isOk(userAgentDocument);

      userAgentId2 = userAgentDocument._id as mongooseTypes.ObjectId;

      const userAgents = await userAgentModel.queryUserAgents();
      assert.isArray(userAgents.results);
      assert.isAtLeast(userAgents.numberOfItems, 2);
      const expectedDocumentCount =
        userAgents.numberOfItems <= userAgents.itemsPerPage
          ? userAgents.numberOfItems
          : userAgents.itemsPerPage;
      assert.strictEqual(userAgents.results.length, expectedDocumentCount);
    });

    it('Get multiple userAgents with a filter', async () => {
      assert.isOk(userAgentId2);
      const results = await userAgentModel.queryUserAgents({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
      assert.isOk(userAgentId2);
      const results = await userAgentModel.queryUserAgents({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await userAgentModel.queryUserAgents({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a userAgent', async () => {
      assert.isOk(userAgentId);
      await userAgentModel.deleteUserAgentById(userAgentId);
      let errored = false;
      try {
        await userAgentModel.getUserAgentById(userAgentId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      userAgentId = null as unknown as ObjectId;
    });
  });
});

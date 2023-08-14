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

describe('#UserModel', () => {
  context('test the crud functions of the user model', () => {
    const mongoConnection = new MongoDbConnection();
    const userModel = mongoConnection.models.UserModel;
    let userId: ObjectId;
    let memberId: ObjectId;
    let userId2: ObjectId;
    let workspaceId: ObjectId;
    let userTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let userTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const userTemplateModel = mongoConnection.models.UserTemplateModel;

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

      await userTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedUserTemplateDocument = await userTemplateModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      userTemplateId = savedUserTemplateDocument?._id as mongooseTypes.ObjectId;

      userTemplateDocument = savedUserTemplateDocument;

      assert.isOk(userTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const userTemplateModel = mongoConnection.models.UserTemplateModel;
      await userTemplateModel.findByIdAndDelete(userTemplateId);

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (userId) {
        await userModel.findByIdAndDelete(userId);
      }

      if (userId2) {
        await userModel.findByIdAndDelete(userId2);
      }
    });

    it('add a new user ', async () => {
      const userInput = JSON.parse(JSON.stringify(INPUT_DATA));
      userInput.workspace = workspaceDocument;
      userInput.template = userTemplateDocument;

      const userDocument = await userModel.createUser(userInput);

      assert.isOk(userDocument);
      assert.strictEqual(userDocument.name, userInput.name);
      assert.strictEqual(
        userDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      userId = userDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a user', async () => {
      assert.isOk(userId);
      const user = await userModel.getUserById(userId);

      assert.isOk(user);
      assert.strictEqual(user._id?.toString(), userId.toString());
    });

    it('modify a user', async () => {
      assert.isOk(userId);
      const input = {description: 'a modified description'};
      const updatedDocument = await userModel.updateUserById(userId, input);
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple users without a filter', async () => {
      assert.isOk(userId);
      const userInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      userInput.workspace = workspaceDocument;
      userInput.type = userTemplateDocument;

      const userDocument = await userModel.createUser(userInput);

      assert.isOk(userDocument);

      userId2 = userDocument._id as mongooseTypes.ObjectId;

      const users = await userModel.queryUsers();
      assert.isArray(users.results);
      assert.isAtLeast(users.numberOfItems, 2);
      const expectedDocumentCount =
        users.numberOfItems <= users.itemsPerPage
          ? users.numberOfItems
          : users.itemsPerPage;
      assert.strictEqual(users.results.length, expectedDocumentCount);
    });

    it('Get multiple users with a filter', async () => {
      assert.isOk(userId2);
      const results = await userModel.queryUsers({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
      assert.isOk(userId2);
      const results = await userModel.queryUsers({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await userModel.queryUsers({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a user', async () => {
      assert.isOk(userId);
      await userModel.deleteUserById(userId);
      let errored = false;
      try {
        await userModel.getUserById(userId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      userId = null as unknown as ObjectId;
    });
  });
});

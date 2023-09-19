// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks'
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#MemberModel', () => {
  context('test the crud functions of the member model', () => {
    const mongoConnection = new MongoDbConnection();
    const memberModel = mongoConnection.models.MemberModel;
    let memberDocId: ObjectId;
    let memberDocId2: ObjectId;
    let memberId: ObjectId;
    let memberDocument: any;
    let invitedById: ObjectId;
    let invitedByDocument: any;
    let workspaceId: ObjectId;
    let workspaceDocument: any;
    let projectId: ObjectId;
    let projectDocument: any;

    before(async () => {
      await mongoConnection.init();
      const memberModel = mongoConnection.models.UserModel;
      const savedMemberDocument = await memberModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      memberId =  savedMemberDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(memberId)
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const savedWorkspaceDocument = await workspaceModel.create([mocks.MOCK_WORKSPACE], {
        validateBeforeSave: false,
      });
      workspaceId =  savedWorkspaceDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(workspaceId)
      const projectModel = mongoConnection.models.ProjectModel;
      const savedProjectDocument = await projectModel.create([mocks.MOCK_PROJECT], {
        validateBeforeSave: false,
      });
      projectId =  savedProjectDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(projectId)
    });

    after(async () => {
      if (memberDocId) {
        await memberModel.findByIdAndDelete(memberDocId);
      }

      if (memberDocId2) {
        await memberModel.findByIdAndDelete(memberDocId2);
      }
      const memberModel = mongoConnection.models.UserModel;
      await memberModel.findByIdAndDelete(memberId);
      const invitedByModel = mongoConnection.models.UserModel;
      await invitedByModel.findByIdAndDelete(invitedById);
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);
      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);

    });

    it('add a new member ', async () => {
      const memberInput = JSON.parse(JSON.stringify(mocks.MOCK_MEMBER));

      memberInput.member = memberDocument;
      memberInput.invitedBy = invitedByDocument;
      memberInput.workspace = workspaceDocument;
      memberInput.project = projectDocument;

      const memberDocument = await memberModel.createMember(memberInput);

      assert.isOk(memberDocument);
      assert.strictEqual(Object.keys(memberDocument)[1], Object.keys(memberInput)[1]);


      memberDocId = memberDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a member', async () => {
      assert.isOk(memberDocId);
      const member = await memberModel.getMemberById(memberDocId);

      assert.isOk(member);
      assert.strictEqual(member._id?.toString(), memberDocId.toString());
    });

    it('modify a member', async () => {
      assert.isOk(memberDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await memberModel.updateMemberById(
        memberDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple members without a filter', async () => {
      assert.isOk(memberDocId);
      const memberInput = JSON.parse(JSON.stringify(mocks.MOCK_MEMBER));



      const memberDocument = await memberModel.createMember(memberInput);

      assert.isOk(memberDocument);

      memberDocId2 = memberDocument._id as mongooseTypes.ObjectId;

      const members = await memberModel.queryMembers();
      assert.isArray(members.results);
      assert.isAtLeast(members.numberOfItems, 2);
      const expectedDocumentCount =
        members.numberOfItems <= members.itemsPerPage
          ? members.numberOfItems
          : members.itemsPerPage;
      assert.strictEqual(members.results.length, expectedDocumentCount);
    });

    it('Get multiple members with a filter', async () => {
      assert.isOk(memberDocId2);
      const results = await memberModel.queryMembers({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(memberDocId2);
      const results = await memberModel.queryMembers({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await memberModel.queryMembers({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a member', async () => {
      assert.isOk(memberDocId);
      await memberModel.deleteMemberById(memberDocId);
      let errored = false;
      try {
        await memberModel.getMemberById(memberDocId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      memberDocId = null as unknown as ObjectId;
    });
  });
});

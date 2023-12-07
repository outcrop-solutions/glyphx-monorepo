// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from 'core';

describe('#MemberModel', () => {
  context('test the crud functions of the member model', () => {
    const mongoConnection = new MongoDbConnection();
    const memberModel = mongoConnection.models.MemberModel;
    let memberDocId: string;
    let memberDocId2: string;
    let memberId: string;
    let userDocument: any;
    let invitedById: string;
    let invitedByDocument: any;
    let workspaceId: string;
    let workspaceDocument: any;
    let projectId: string;
    let projectDocument: any;

    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const savedMemberDocument = await userModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      memberId = savedMemberDocument[0]!._id.toString();
      assert.isOk(memberId);
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const savedWorkspaceDocument = await workspaceModel.create([mocks.MOCK_WORKSPACE], {
        validateBeforeSave: false,
      });
      workspaceId = savedWorkspaceDocument[0]!._id.toString();
      assert.isOk(workspaceId);
      const projectModel = mongoConnection.models.ProjectModel;
      const savedProjectDocument = await projectModel.create([mocks.MOCK_PROJECT], {
        validateBeforeSave: false,
      });
      projectId = savedProjectDocument[0]!._id.toString();
      assert.isOk(projectId);
    });

    after(async () => {
      if (memberDocId) {
        await memberModel.findByIdAndDelete(memberDocId);
      }

      if (memberDocId2) {
        await memberModel.findByIdAndDelete(memberDocId2);
      }
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(memberId);
      const invitedByModel = mongoConnection.models.UserModel;
      await invitedByModel.findByIdAndDelete(invitedById);
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);
      const projectModel = mongoConnection.models.ProjectModel;
      await projectModel.findByIdAndDelete(projectId);
    });

    it('add a new member ', async () => {
      const memberInput = JSON.parse(JSON.stringify(mocks.MOCK_MEMBER));

      memberInput.member = userDocument;
      memberInput.invitedBy = invitedByDocument;
      memberInput.workspace = workspaceDocument;
      memberInput.project = projectDocument;

      const memberDocument = await memberModel.createMember(memberInput);

      assert.isOk(memberDocument);
      assert.strictEqual(Object.keys(memberDocument)[1], Object.keys(memberInput)[1]);

      memberDocId = memberDocument._id!.toString();
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
      const updatedDocument = await memberModel.updateMemberById(memberDocId, input);
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple members without a filter', async () => {
      assert.isOk(memberDocId);
      const memberInput = JSON.parse(JSON.stringify(mocks.MOCK_MEMBER));

      const memberDocument = await memberModel.createMember(memberInput);

      assert.isOk(memberDocument);

      memberDocId2 = memberDocument._id!.toString();

      const members = await memberModel.queryMembers();
      assert.isArray(members.results);
      assert.isAtLeast(members.numberOfItems, 2);
      const expectedDocumentCount =
        members.numberOfItems <= members.itemsPerPage ? members.numberOfItems : members.itemsPerPage;
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

      assert.notStrictEqual(results2.results[0]?._id?.toString(), lastId?.toString());
    });

    it('remove a member', async () => {
      assert.isOk(memberDocId);
      await memberModel.deleteMemberById(memberDocId.toString());
      let errored = false;
      try {
        await memberModel.getMemberById(memberDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      memberDocId = null as unknown as string;
    });
  });
});

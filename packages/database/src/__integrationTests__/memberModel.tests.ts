import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

const INPUT_USER = {
  userCode: 'testUserCode' + UNIQUE_KEY,
  name: 'testUser' + UNIQUE_KEY,
  username: 'testUserName' + UNIQUE_KEY,
  email: 'testEmail' + UNIQUE_KEY + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: [],
  sessions: [],
  membership: [],
  invitedMembers: [],
  createdWorkspaces: [],
  projects: [],
  webhooks: [],
};

const INPUT_WORKSPACE = {
  workspaceCode: 'testWorkspace' + UNIQUE_KEY,
  inviteCode: 'testWorkspace' + UNIQUE_KEY,
  name: 'testName' + UNIQUE_KEY,
  slug: 'testSlug' + UNIQUE_KEY,
  createdAt: new Date(),
  updatedAt: new Date(),
  description: 'testDescription',
  creator: {},
  members: [] as unknown as mongooseTypes.ObjectId[],
  projects: [] as unknown as mongooseTypes.ObjectId[],
};

const INPUT_DATA = {
  email: 'james@glyphx.co' + UNIQUE_KEY,
  inviter: 'jp@glyphx.co',
  invitedAt: new Date(),
  joinedAt: new Date(),
  updatedAt: new Date(),
  createdAt: new Date(),
  status: databaseTypes.constants.INVITATION_STATUS.PENDING,
  teamRole: databaseTypes.constants.ROLE.MEMBER,
  member: {},
  invitedBy: {},
  workspace: {},
};

describe('#memberModel', () => {
  context('test the crud functions of the member model', () => {
    const mongoConnection = new MongoDbConnection();
    const memberModel = mongoConnection.models.MemberModel;
    let memberId: ObjectId;
    let userId: ObjectId;
    let workspaceId: ObjectId;
    let userDocument: any;
    let workspaceDocument: any;
    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await userModel.createUser(INPUT_USER as databaseTypes.IUser);
      await workspaceModel.createWorkspace(
        INPUT_WORKSPACE as databaseTypes.IWorkspace
      );

      const savedUserDocument = await userModel
        .findOne({email: INPUT_USER.email})
        .lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;
      assert.isOk(userId);

      const savedWorkspaceDocument = await workspaceModel
        .findOne({slug: INPUT_WORKSPACE.slug})
        .lean();
      workspaceId = savedWorkspaceDocument?._id as mongooseTypes.ObjectId;

      workspaceDocument = savedWorkspaceDocument;
      assert.isOk(workspaceId);
    });

    after(async () => {
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);

      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      if (memberId) {
        await memberModel.findByIdAndDelete(memberId);
      }
    });

    it('add a new member', async () => {
      const memberInput = JSON.parse(JSON.stringify(INPUT_DATA));
      memberInput.member = userDocument;
      memberInput.invitedBy = userDocument;
      memberInput.workspace = workspaceDocument;
      const memberDocument = await memberModel.createMember(memberInput);

      assert.isOk(memberDocument);
      assert.strictEqual(memberDocument.email, memberInput.email);
      assert.strictEqual(
        memberDocument.member._id?.toString(),
        userId.toString()
      );
      assert.strictEqual(
        memberDocument.invitedBy._id?.toString(),
        userId.toString()
      );
      assert.strictEqual(
        memberDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      memberId = memberDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a member', async () => {
      assert.isOk(memberId);
      const member = await memberModel.getMemberById(memberId);

      assert.isOk(member);
      assert.strictEqual(member._id?.toString(), memberId.toString());
    });

    it('modify a Member', async () => {
      assert.isOk(memberId);
      const input = {email: 'example@gmail.com'};
      const updatedDocument = await memberModel.updateMemberById(
        memberId,
        input
      );
      assert.strictEqual(updatedDocument.email, input.email);
    });

    it('remove a member', async () => {
      assert.isOk(memberId);
      await memberModel.deleteMemberById(memberId);
      let errored = false;
      try {
        await memberModel.getMemberById(memberId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      memberId = null as unknown as ObjectId;
    });
  });
});

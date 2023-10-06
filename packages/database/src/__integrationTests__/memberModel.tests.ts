import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {error} from 'core';
import {DBFormatter} from '../lib/format';

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

const INPUT_DATA2 = {
  email: 'james2@glyphx.co' + UNIQUE_KEY,
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
    const format = new DBFormatter();
    const memberModel = mongoConnection.models.MemberModel;
    let memberId: string;
    let memberId2: string;
    let userId: ObjectId;
    let workspaceId: ObjectId;
    let userDocument: any;
    let workspaceDocument: any;
    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const workspaceModel = mongoConnection.models.WorkspaceModel;

      await userModel.createUser(INPUT_USER as databaseTypes.IUser);

      const savedUserDocument = await userModel.findOne({email: INPUT_USER.email}).lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;
      assert.isOk(userId);

      const inputWorkspace = JSON.parse(JSON.stringify(INPUT_WORKSPACE));
      inputWorkspace.creator = userDocument;

      await workspaceModel.createWorkspace(format.toJS(inputWorkspace as unknown as databaseTypes.IWorkspace));

      const savedWorkspaceDocument = await workspaceModel.findOne({slug: INPUT_WORKSPACE.slug}).lean();
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
      if (memberId2) {
        await memberModel.findByIdAndDelete(memberId2);
      }
    });

    it('add a new member', async () => {
      const memberInput = JSON.parse(JSON.stringify(INPUT_DATA));
      memberInput.member = userDocument;
      memberInput.invitedBy = userDocument;
      memberInput.workspace = workspaceDocument;
      const memberDocument = await memberModel.createWorkspaceMember(format.toJS(memberInput));

      assert.isOk(memberDocument);
      assert.strictEqual(memberDocument.email, memberInput.email);
      assert.strictEqual(memberDocument.member.id, userId.toString());
      assert.strictEqual(memberDocument.invitedBy.id, userId.toString());
      assert.strictEqual(memberDocument.workspace.id, workspaceId.toString());

      memberId = memberDocument.id!;
    });

    it('retreive a member', async () => {
      assert.isOk(memberId);
      const member = await memberModel.getMemberById(memberId);

      assert.isOk(member);
      assert.strictEqual(member.id, memberId.toString());
    });

    it('Get multiple members without a filter', async () => {
      assert.isOk(memberId);
      const memberInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      memberInput.member = userDocument;
      memberInput.invitedBy = userDocument;
      memberInput.workspace = workspaceDocument;
      const memberDocument = await memberModel.createWorkspaceMember(format.toJS(memberInput));

      assert.isOk(memberDocument);
      memberId2 = memberDocument.id!;

      const members = await memberModel.queryMembers();
      assert.isArray(members.results);
      assert.isAtLeast(members.numberOfItems, 2);
      const expectedDocumentCount =
        members.numberOfItems <= members.itemsPerPage ? members.numberOfItems : members.itemsPerPage;
      assert.strictEqual(members.results.length, expectedDocumentCount);
    });

    it('Get multiple members with a filter', async () => {
      assert.isOk(memberId2);
      const results = await memberModel.queryMembers({
        email: INPUT_DATA.email,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.email, INPUT_DATA.email);
    });

    it('page members', async () => {
      assert.isOk(memberId2);
      const results = await memberModel.queryMembers({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?.id;

      const results2 = await memberModel.queryMembers({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(results2.results[0]?.id, lastId?.toString());
    });

    it('modify a Member', async () => {
      assert.isOk(memberId);
      const input = {email: 'example@gmail.com'};
      const updatedDocument = await memberModel.updateMemberById(memberId.toString(), input);
      assert.strictEqual(updatedDocument.email, input.email);
    });

    it('remove a member', async () => {
      assert.isOk(memberId);
      await memberModel.deleteMemberById(memberId.toString());
      let errored = false;
      try {
        await memberModel.getMemberById(memberId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      memberId = null as unknown as string;
    });
  });
});

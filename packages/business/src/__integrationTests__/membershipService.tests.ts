import 'mocha';
import {assert} from 'chai';
import {v4} from 'uuid';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {membershipService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');
const MOCK_PAYLOAD_HASH = '2d6518de3ae5b3dc477e44759a64a22c';
const MOCK_FILESYSTEM_HASH = 'cde4d74582624873915e646f34ec588c';

const MOCK_USER: databaseTypes.IUser = {
  userCode: 'dfkadfkljafdkalsjskldf',
  name: 'testUser',
  username: 'test@user.com',
  email: 'test@user.com',
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

const INPUT_MEMBER: Partial<databaseTypes.IMember> = {
  email: 'testemail@gmail.com',
  inviter: 'testEmail' + UNIQUE_KEY + '@email.com',
  type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
  invitedAt: new Date(),
  joinedAt: new Date(),
  updatedAt: new Date(),
  createdAt: new Date(),
  status: databaseTypes.constants.INVITATION_STATUS.PENDING,
  teamRole: databaseTypes.constants.ROLE.MEMBER,
};

describe('#MembershipService', () => {
  const mongoConnection = new MongoDbConnection();

  context('test the functions of the membership service', () => {
    let memberId: ObjectId;
    // let memberDocument;

    before(async () => {
      await mongoConnection.init();
      const memberModel = mongoConnection.models.MemberModel;

      await memberModel.createMember(INPUT_MEMBER as databaseTypes.IMember);

      const savedMemberDocument = await memberModel
        .findOne({name: INPUT_MEMBER.name})
        .lean();
      memberId = savedMemberDocument?._id as mongooseTypes.ObjectId;

      //   memberDocument = savedMemberDocument;

      assert.isOk(memberId);
    });

    after(async () => {
      const memberModel = mongoConnection.models.MemberModel;
      await memberModel.findByIdAndDelete(memberId);

      if (memberId) {
        await memberModel.findByIdAndDelete(memberId);
      }
    });

    it('will retreive our member from the database', async () => {
      const member = await membershipService.getMember(memberId);
      assert.isOk(member);

      assert.strictEqual(member?.name, INPUT_MEMBER.name);
    });
    it('will retreive members from the database', async () => {
      const member = await membershipService.getMembers(memberId);
      assert.isOk(member);

      assert.strictEqual(member?.name, INPUT_MEMBER.name);
    });
    it('will retreive pending invitations from the database', async () => {
      const member = await membershipService.getPendingInvitations(memberId);
      assert.isOk(member);

      assert.strictEqual(member?.name, INPUT_MEMBER.name);
    });
    it('will remove the member from the database', async () => {
      const member = await membershipService.remove(memberId);
      assert.isOk(member);

      assert.strictEqual(member?.name, INPUT_MEMBER.name);
    });
    it('will update the member role', async () => {
      const member = await membershipService.updateRole(memberId);
      assert.isOk(member);

      assert.strictEqual(member?.name, INPUT_MEMBER.name);
    });
    it('will update our member invitation status', async () => {
      const member = await membershipService.updateStatus(memberId);
      assert.isOk(member);

      assert.strictEqual(member?.name, INPUT_MEMBER.name);
    });
  });
});

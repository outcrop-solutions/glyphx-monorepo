import 'mocha';
import {assert} from 'chai';
import {v4} from 'uuid';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {databaseTypes} from 'types';
import {membershipService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

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

      await memberModel.create(INPUT_MEMBER as databaseTypes.IMember);

      const savedMemberDocument = await memberModel.findOne({email: INPUT_MEMBER.email}).lean();
      memberId = savedMemberDocument?._id as mongooseTypes.ObjectId;

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
      const member = await membershipService.getMember(memberId.toString());
      assert.isOk(member);
      assert.strictEqual(member?.email, INPUT_MEMBER.email);
    });
    it('will retreive pending invitations from the database', async () => {
      const members = await membershipService.getPendingInvitations(memberId.toString());
      assert.isOk(members);
    });
    it('will update the member role', async () => {
      const member = await membershipService.updateRole(memberId.toString(), databaseTypes.constants.ROLE.OWNER);
      assert.isOk(member);
      assert.strictEqual(member?.projectRole!, databaseTypes.constants.PROJECT_ROLE.OWNER);
    });
    it('will update our member invitation status', async () => {
      const member = await membershipService.updateStatus(
        memberId.toString(),
        databaseTypes.constants.INVITATION_STATUS.ACCEPTED
      );
      assert.isOk(member);

      assert.strictEqual(member?.email, INPUT_MEMBER.email);
    });
    it('will remove the member from the database', async () => {
      const member = await membershipService.remove(memberId.toString());
      assert.isOk(member);

      assert.strictEqual(member?.email, INPUT_MEMBER.email);
    });
  });
});

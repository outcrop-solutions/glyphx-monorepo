import 'mocha';
import {assert} from 'chai';
import {v4} from 'uuid';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {databaseTypes} from 'types';
import {workspaceService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

const USER_EMAIL = 'testEmail' + UNIQUE_KEY + '@email.com';
const INPUT_USER: Partial<databaseTypes.IUser> = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  _id:
    // @ts-ignore
    new mongooseTypes.ObjectId(),
  name: 'testUser' + UNIQUE_KEY,
  userCode: 'testUserCode' + UNIQUE_KEY,
  username: 'testUserName' + UNIQUE_KEY,
  email: USER_EMAIL,
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

const INPUT_WORKSPACE: Partial<databaseTypes.IWorkspace> = {
  workspaceCode: 'testWorkspace' + UNIQUE_KEY,
  inviteCode: 'testWorkspace' + UNIQUE_KEY,
  name: 'testName' + UNIQUE_KEY,
  slug: 'testSlug' + UNIQUE_KEY,
  updatedAt: new Date(),
  createdAt: new Date(),
  description: 'testDescription',
  tags: [],
  members: [],
  states: [],
  projects: [],
};

const INPUT_MEMBER_1: Partial<databaseTypes.IMember> = {
  email: USER_EMAIL,
  inviter: 'testEmail' + UNIQUE_KEY + '@email.com',
  type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
  invitedAt: new Date(),
  joinedAt: new Date(),
  updatedAt: new Date(),
  createdAt: new Date(),
  status: databaseTypes.constants.INVITATION_STATUS.PENDING,
  teamRole: databaseTypes.constants.ROLE.MEMBER,
};

const INPUT_MEMBER_2: Partial<databaseTypes.IMember> = {
  email: 'testEmail' + UNIQUE_KEY + '@email.com',
  inviter: USER_EMAIL,
  type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
  invitedAt: new Date(),
  joinedAt: new Date(),
  updatedAt: new Date(),
  createdAt: new Date(),
  status: databaseTypes.constants.INVITATION_STATUS.PENDING,
  teamRole: databaseTypes.constants.ROLE.MEMBER,
};

const INPUT_CUSTOMER_PAYMENT: Partial<databaseTypes.ICustomerPayment> = {
  paymentId: 'testPaymentId' + UNIQUE_KEY,
  email: 'testuniqueemail@gmail.com',
  subscriptionType: databaseTypes.constants.SUBSCRIPTION_TYPE.FREE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('#WorkspaceService', () => {
  const mongoConnection = new MongoDbConnection();

  context('test the functions of the workspace service', () => {
    let userId: ObjectId;
    let memberId: ObjectId;
    let member2Id: ObjectId;
    let workspaceId: ObjectId;
    let customerPaymentId: ObjectId;

    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const memberModel = mongoConnection.models.MemberModel;
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const customerPaymentModel = mongoConnection.models.CustomerPaymentModel;

      // create user
      await userModel.create(INPUT_USER as databaseTypes.IUser);

      const savedUserDocument = await userModel
        .findOne({username: INPUT_USER.username})
        .lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;
      assert.isOk(userId);

      // create members
      await memberModel.create([
        INPUT_MEMBER_1,
        INPUT_MEMBER_2,
      ] as databaseTypes.IMember[]);

      const savedMemberDocument1 = await memberModel
        .findOne({inviter: INPUT_MEMBER_1.inviter})
        .lean();

      memberId = savedMemberDocument1?._id as mongooseTypes.ObjectId;
      assert.isOk(memberId);

      const savedMemberDocument2 = await memberModel
        .findOne({inviter: INPUT_MEMBER_1.inviter})
        .lean();

      memberId = savedMemberDocument2?._id as mongooseTypes.ObjectId;
      assert.isOk(member2Id);

      // create workspace
      await workspaceModel.create(INPUT_WORKSPACE);

      const savedWorkspaceDocument = await workspaceModel
        .findOne({workspaceCode: INPUT_WORKSPACE.workspaceCode})
        .lean();
      workspaceId = savedWorkspaceDocument?._id as mongooseTypes.ObjectId;
      assert.isOk(workspaceId);

      // create customerPayment
      await customerPaymentModel.create(
        INPUT_CUSTOMER_PAYMENT as databaseTypes.ICustomerPayment
      );

      const savedCustomerPaymentDocument = await customerPaymentModel
        .findOne({paymentId: INPUT_CUSTOMER_PAYMENT.paymentId})
        .lean();
      customerPaymentId =
        savedCustomerPaymentDocument?._id as mongooseTypes.ObjectId;
      assert.isOk(customerPaymentId);
    });

    after(async () => {
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);

      if (userId) {
        await userModel.findByIdAndDelete(userId);
      }

      //  delete member1
      const memberModel = mongoConnection.models.MemberModel;
      await memberModel.findByIdAndDelete(memberId);

      if (memberId) {
        await memberModel.findByIdAndDelete(memberId);
      }

      //  delete member2
      await memberModel.findByIdAndDelete(member2Id);

      if (member2Id) {
        await memberModel.findByIdAndDelete(member2Id);
      }

      //  delete workspace
      const workspaceModel = mongoConnection.models.MemberModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      if (workspaceId) {
        await workspaceModel.findByIdAndDelete(workspaceId);
      }

      //  delete customer payment
      const customerPaymentModel = mongoConnection.models.MemberModel;
      await customerPaymentModel.findByIdAndDelete(customerPaymentId);

      if (customerPaymentId) {
        await customerPaymentModel.findByIdAndDelete(customerPaymentId);
      }
    });

    it('will count the workspaces in the database', async () => {
      const count = await workspaceService.countWorkspaces(
        INPUT_WORKSPACE.slug!
      );
      assert.isOk(count);
      assert.strictEqual(count, 0);
    });
    it('will create a workspaces', async () => {
      const workspace = await workspaceService.createWorkspace(
        userId,
        INPUT_USER.email!,
        INPUT_USER.name!,
        INPUT_WORKSPACE.slug!
      );
      assert.isOk(workspace);
      workspaceId = workspace._id;
    });
    it('will delete a workspace', async () => {
      const workspace = await workspaceService.deleteWorkspace(
        userId,
        INPUT_USER.email!,
        INPUT_WORKSPACE.slug!
      );
      assert.isOk(workspace);
      assert.isOk(workspace.deletedAt);
    });
    it('will retreive a workspace via getOwnWorkspace', async () => {
      const workspace = await workspaceService.getOwnWorkspace(
        userId,
        INPUT_USER.email!,
        INPUT_WORKSPACE.slug!
      );
      assert.isOk(workspace);
    });
    it('will retreive workspace invitations', async () => {
      const workspace = await workspaceService.getInvitation(
        INPUT_WORKSPACE.inviteCode!
      );
      assert.isOk(workspace);
    });
    it('will retreive a workspace via getSiteWorkspace', async () => {
      const workspace = await workspaceService.getSiteWorkspace(
        INPUT_WORKSPACE.slug!
      );
      assert.isOk(workspace);
    });
    it('will retreive workspaces', async () => {
      const workspace = await workspaceService.getWorkspace(
        userId,
        INPUT_USER.email!,
        INPUT_WORKSPACE.slug!
      );
      assert.isOk(workspace);
    });
    it('will get workspace paths', async () => {
      const workspaces = await workspaceService.getWorkspacePaths();
      assert.isOk(workspaces);
    });
    it('will invite users to a workspace', async () => {
      const result = await workspaceService.inviteUsers(
        userId,
        INPUT_USER.email!,
        [INPUT_MEMBER_1, INPUT_MEMBER_2],
        INPUT_WORKSPACE.slug!
      );
      assert.isOk(result);
    });
    it('will join a user to a workspace', async () => {
      const user = await workspaceService.joinWorkspace(
        INPUT_WORKSPACE.workspaceCode!,
        INPUT_USER.email!
      );
      assert.isOk(user);
    });
    it('will update a workspace name', async () => {
      const user = await workspaceService.updateWorkspaceName(
        userId,
        INPUT_USER.email!,
        'NEW WORKSPACE NAME',
        INPUT_WORKSPACE.slug!
      );
      assert.isOk(user);
    });
    it('will update a workspace slug', async () => {
      const workspaceSlug = await workspaceService.updateWorkspaceSlug(
        userId,
        INPUT_USER.email!,
        'NEW SLUG',
        INPUT_WORKSPACE.slug!
      );
      assert.isOk(workspaceSlug);
    });
    it('will add a tag to a workspace', async () => {
      const workspace = await workspaceService.addTags(workspaceId, ['tag1']);
      assert.isOk(workspace);
    });
  });
});

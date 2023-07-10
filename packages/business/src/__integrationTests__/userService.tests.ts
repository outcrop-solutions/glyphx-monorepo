import 'mocha';
import {assert} from 'chai';
import {v4} from 'uuid';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {userService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

const USER_EMAIL = 'testEmail' + UNIQUE_KEY + '@email.com';
const INPUT_USER: Partial<databaseTypes.IUser> = {
  _id: new mongooseTypes.ObjectId(),
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

describe('#UserService', () => {
  const mongoConnection = new MongoDbConnection();

  context('test the functions of the user service', () => {
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

    it('will retreive our user from the database', async () => {
      const user = await userService.getUser(userId);
      assert.isOk(user);
      assert.strictEqual(user?.username, INPUT_USER.username);
    });
    it('will deactivate a user', async () => {
      const user = await userService.deactivate(userId);
      assert.isOk(user);
      assert.isOk(user.deletedAt);
      assert.strictEqual(user?.username, INPUT_USER.username);
    });
    it('will update a user email', async () => {
      const user = await userService.updateEmail(
        userId,
        'changedemail@gmail.com',
        'previousemail@gmail.com'
      );
      assert.isOk(user);
      assert.strictEqual(user?.username, INPUT_USER.username);
    });
    it('will update a user name', async () => {
      const user = await userService.updateName(userId, 'changedName');
      assert.isOk(user);
      assert.strictEqual(user?.username, INPUT_USER.username);
    });
    it('will update a user code', async () => {
      const user = await userService.updateUserCode(userId);
      assert.isOk(user);
      assert.strictEqual(user?.username, INPUT_USER.username);
    });
  });
});

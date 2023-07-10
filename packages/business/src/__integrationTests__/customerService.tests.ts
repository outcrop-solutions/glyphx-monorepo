import 'mocha';
import {assert} from 'chai';
import {v4} from 'uuid';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {membershipService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

const INPUT_USER: databaseTypes.IUser = {
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
  createdWorkspaces: [],
  invitedMembers: [],
  projects: [],
  webhooks: [],
};

const INPUT_CUSTOMER_PAYMENT: Partial<databaseTypes.ICustomerPayment> = {
  paymentId: 'testPaymentId' + UNIQUE_KEY,
  email: 'testemail@gmail.com',
  subscriptionType: databaseTypes.constants.SUBSCRIPTION_TYPE.FREE,
  createdAt: new Date(),
  updatedAt: new Date(),
  customer: INPUT_USER,
};

describe('#CustomerPaymentService', () => {
  const mongoConnection = new MongoDbConnection();

  context('test the functions of the membership service', () => {
    let memberId: ObjectId;
    // let memberDocument;

    before(async () => {
      await mongoConnection.init();
      const memberModel = mongoConnection.models.CustomerPaymentModel;

      await memberModel.createCustomerPayment(
        INPUT_CUSTOMER_PAYMENT as databaseTypes.ICustomerPayment
      );

      const savedCustomerPaymentDocument = await memberModel
        .findOne({name: INPUT_CUSTOMER_PAYMENT.name})
        .lean();
      memberId = savedCustomerPaymentDocument?._id as mongooseTypes.ObjectId;

      //   memberDocument = savedCustomerPaymentDocument;

      assert.isOk(memberId);
    });

    after(async () => {
      const memberModel = mongoConnection.models.CustomerPaymentModel;
      await memberModel.findByIdAndDelete(memberId);

      if (memberId) {
        await memberModel.findByIdAndDelete(memberId);
      }
    });

    it('will retreive our member from the database', async () => {
      const member = await membershipService.getPayment(memberId);
      assert.isOk(member);

      assert.strictEqual(member?.name, INPUT_CUSTOMER_PAYMENT.name);
    });
    it('will retreive our member from the database', async () => {
      const member = await membershipService.createPaymentAccount(memberId);
      assert.isOk(member);

      assert.strictEqual(member?.name, INPUT_CUSTOMER_PAYMENT.name);
    });
    it('will retreive our member from the database', async () => {
      const member = await membershipService.updateSubscription(memberId);
      assert.isOk(member);

      assert.strictEqual(member?.name, INPUT_CUSTOMER_PAYMENT.name);
    });
  });
});

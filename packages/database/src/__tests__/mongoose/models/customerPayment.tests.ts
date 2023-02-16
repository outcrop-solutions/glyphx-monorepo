import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../../../mongoose/mongooseConnection';
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

const INPUT_DATA = {
  paymentId: 'testPaymentId' + UNIQUE_KEY,
  customerId: 'testCustomerId' + UNIQUE_KEY,
  email: 'testemail@gmail.com',
  subscriptionType: databaseTypes.constants.SUBSCRIPTION_TYPE.FREE,
  createdAt: new Date(),
  updatedAt: new Date(),
  customer: {},
};

describe('#customerPaymentModel', () => {
  context('test the crud functions of the customerPayment model', () => {
    const mongoConnection = new MongoDbConnection();
    const customerPaymentModel = mongoConnection.models.CustomerPaymentModel;
    let customerPaymentId: ObjectId;
    let userId: ObjectId;
    let userDocument: any;
    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      await userModel.createUser(INPUT_USER as databaseTypes.IUser);

      const savedUserDocument = await userModel
        .findOne({name: INPUT_USER.name})
        .lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;

      assert.isOk(userId);
    });

    after(async () => {
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);

      if (customerPaymentId) {
        await customerPaymentModel.findByIdAndDelete(customerPaymentId);
      }
    });

    it('add a new customerPayment', async () => {
      const customerPaymentInput = JSON.parse(JSON.stringify(INPUT_DATA));
      customerPaymentInput.user = userDocument;
      const customerPaymentDocument =
        await customerPaymentModel.createCustomerPayment(customerPaymentInput);

      assert.isOk(customerPaymentDocument);
      assert.strictEqual(
        customerPaymentDocument.paymentId,
        customerPaymentInput.paymentId
      );
      assert.strictEqual(
        customerPaymentDocument.customer._id?.toString(),
        userId.toString()
      );

      customerPaymentId = customerPaymentDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a customerPayment', async () => {
      assert.isOk(customerPaymentId);
      const customerPayment = await customerPaymentModel.getCustomerPaymentById(
        customerPaymentId
      );

      assert.isOk(customerPayment);
      assert.strictEqual(
        customerPayment._id?.toString(),
        customerPaymentId.toString()
      );
    });

    it('modify a CustomerPayment', async () => {
      assert.isOk(customerPaymentId);
      const input = {email: 'a modified CustomerPayment email'};
      const updatedDocument =
        await customerPaymentModel.updateCustomerPaymentById(
          customerPaymentId,
          input
        );
      assert.strictEqual(updatedDocument.email, input.email);
    });

    it('remove a customerPayment', async () => {
      assert.isOk(customerPaymentId);
      await customerPaymentModel.deleteCustomerPaymentById(customerPaymentId);
      let errored = false;
      try {
        await customerPaymentModel.getCustomerPaymentById(customerPaymentId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      customerPaymentId = null as unknown as ObjectId;
    });
  });
});

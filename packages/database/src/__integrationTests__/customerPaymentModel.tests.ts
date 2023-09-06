import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {error} from 'core';

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
  customerPayments: [],
  membership: [],
  sessions: [],
  invitedMembers: [],
  createdWorkspaces: [],
  projects: [],
  webhooks: [],
};

const INPUT_DATA = {
  paymentId: 'testPaymentId' + UNIQUE_KEY,
  email: 'testemail@gmail.com',
  subscriptionType: databaseTypes.constants.SUBSCRIPTION_TYPE.FREE,
  createdAt: new Date(),
  updatedAt: new Date(),
  customer: {},
};

const INPUT_DATA2 = {
  paymentId: 'testPaymentId2' + UNIQUE_KEY,
  email: 'testemail2@gmail.com',
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
    let customerPaymentId2: ObjectId;
    let userId: ObjectId;
    let userDocument: any;
    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      await userModel.createUser(INPUT_USER as databaseTypes.IUser);

      const savedUserDocument = await userModel.findOne({name: INPUT_USER.name}).lean();
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

      if (customerPaymentId2) {
        await customerPaymentModel.findByIdAndDelete(customerPaymentId2);
      }
    });

    it('add a new customerPayment', async () => {
      const customerPaymentInput = JSON.parse(JSON.stringify(INPUT_DATA));
      customerPaymentInput.customer = userDocument;
      const customerPaymentDocument = await customerPaymentModel.createCustomerPayment(customerPaymentInput);

      assert.isOk(customerPaymentDocument);
      assert.strictEqual(customerPaymentDocument.paymentId, customerPaymentInput.paymentId);
      assert.strictEqual(customerPaymentDocument.customer._id?.toString(), userId.toString());

      customerPaymentId = customerPaymentDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a customerPayment', async () => {
      assert.isOk(customerPaymentId);
      const customerPayment = await customerPaymentModel.getCustomerPaymentById(customerPaymentId);

      assert.isOk(customerPayment);
      assert.strictEqual(customerPayment._id?.toString(), customerPaymentId.toString());
    });

    it('retreive a customerPayment by email', async () => {
      assert.isOk(customerPaymentId);
      const customerPayment = await customerPaymentModel.getCustomerPaymentByEmail(INPUT_DATA.email);

      assert.isOk(customerPayment);
      assert.strictEqual(customerPayment._id?.toString(), customerPaymentId.toString());
      assert.strictEqual(customerPayment.email, INPUT_DATA.email);
    });

    it('modify a CustomerPayment', async () => {
      assert.isOk(customerPaymentId);
      const input = {paymentId: 'a modified CustomerPayment Token'};
      const updatedDocument = await customerPaymentModel.updateCustomerPaymentById(customerPaymentId, input);
      assert.strictEqual(updatedDocument.paymentId, input.paymentId);
    });

    it('Get multiple customerPayments without a filter', async () => {
      assert.isOk(customerPaymentId);
      const paymentInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      paymentInput.customer = userDocument;
      const paymentDocument = await customerPaymentModel.createCustomerPayment(paymentInput);

      assert.isOk(paymentDocument);
      customerPaymentId2 = paymentDocument._id as mongooseTypes.ObjectId;

      const payments = await customerPaymentModel.queryCustomerPayments();
      assert.isArray(payments.results);
      assert.isAtLeast(payments.numberOfItems, 2);
      const expectedDocumentCount =
        payments.numberOfItems <= payments.itemsPerPage ? payments.numberOfItems : payments.itemsPerPage;
      assert.strictEqual(payments.results.length, expectedDocumentCount);
    });

    it('Get multiple customerPayments with a filter', async () => {
      assert.isOk(customerPaymentId2);
      const results = await customerPaymentModel.queryCustomerPayments({
        customer: userId,
      });
      assert.strictEqual(results.results.length, 2);
      assert.strictEqual(results.results[0]?.customer?._id?.toString(), userId.toString());
    });

    it('page customerPayments', async () => {
      assert.isOk(customerPaymentId2);
      const results = await customerPaymentModel.queryCustomerPayments({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await customerPaymentModel.queryCustomerPayments({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(results2.results[0]?._id?.toString(), lastId?.toString());
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

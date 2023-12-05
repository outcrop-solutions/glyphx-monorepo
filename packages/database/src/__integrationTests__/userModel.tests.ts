// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#UserModel', () => {
  context('test the crud functions of the user model', () => {
    const mongoConnection = new MongoDbConnection();
    const userModel = mongoConnection.models.UserModel;
    let userDocId: ObjectId;
    let userDocId2: ObjectId;
    let customerPaymentId: ObjectId;
    let customerPaymentDocument: any;

    before(async () => {
      await mongoConnection.init();
      const customerPaymentModel = mongoConnection.models.CustomerPaymentModel;
      const savedCustomerPaymentDocument = await customerPaymentModel.create([mocks.MOCK_CUSTOMERPAYMENT], {
        validateBeforeSave: false,
      });
      customerPaymentId = savedCustomerPaymentDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(customerPaymentId);
    });

    after(async () => {
      if (userDocId) {
        await userModel.findByIdAndDelete(userDocId);
      }

      if (userDocId2) {
        await userModel.findByIdAndDelete(userDocId2);
      }
      const customerPaymentModel = mongoConnection.models.CustomerPaymentModel;
      await customerPaymentModel.findByIdAndDelete(customerPaymentId);
    });

    it('add a new user ', async () => {
      const userInput = JSON.parse(JSON.stringify(mocks.MOCK_USER));

      userInput.customerPayment = customerPaymentDocument;

      const userDocument = await userModel.createUser(userInput);

      assert.isOk(userDocument);
      assert.strictEqual(Object.keys(userDocument)[1], Object.keys(userInput)[1]);

      userDocId = userDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a user', async () => {
      assert.isOk(userDocId);
      const user = await userModel.getUserById(userDocId);

      assert.isOk(user);
      assert.strictEqual(user._id?.toString(), userDocId.toString());
    });

    it('modify a user', async () => {
      assert.isOk(userDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await userModel.updateUserById(userDocId, input);
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple users without a filter', async () => {
      assert.isOk(userDocId);
      const userInput = JSON.parse(JSON.stringify(mocks.MOCK_USER));

      const userDocument = await userModel.createUser(userInput);

      assert.isOk(userDocument);

      userDocId2 = userDocument._id as mongooseTypes.ObjectId;

      const users = await userModel.queryUsers();
      assert.isArray(users.results);
      assert.isAtLeast(users.numberOfItems, 2);
      const expectedDocumentCount =
        users.numberOfItems <= users.itemsPerPage ? users.numberOfItems : users.itemsPerPage;
      assert.strictEqual(users.results.length, expectedDocumentCount);
    });

    it('Get multiple users with a filter', async () => {
      assert.isOk(userDocId2);
      const results = await userModel.queryUsers({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(userDocId2);
      const results = await userModel.queryUsers({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await userModel.queryUsers({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(results2.results[0]?._id?.toString(), lastId?.toString());
    });

    it('remove a user', async () => {
      assert.isOk(userDocId);
      await userModel.deleteUserById(userDocId.toString());
      let errored = false;
      try {
        await userModel.getUserById(userDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      userDocId = null as unknown as ObjectId;
    });
  });
});

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

describe('#AccountModel', () => {
  context('test the crud functions of the account model', () => {
    const mongoConnection = new MongoDbConnection();
    const accountModel = mongoConnection.models.AccountModel;
    let accountDocId: ObjectId;
    let accountDocId2: ObjectId;
    let userId: ObjectId;
    let userDocument: any;

    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const savedUserDocument = await userModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      userId = savedUserDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(userId);
    });

    after(async () => {
      if (accountDocId) {
        await accountModel.findByIdAndDelete(accountDocId);
      }

      if (accountDocId2) {
        await accountModel.findByIdAndDelete(accountDocId2);
      }
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);
    });

    it('add a new account ', async () => {
      const accountInput = JSON.parse(JSON.stringify(mocks.MOCK_ACCOUNT));

      accountInput.user = userDocument;

      const accountDocument = await accountModel.createAccount(accountInput);

      assert.isOk(accountDocument);
      assert.strictEqual(Object.keys(accountDocument)[1], Object.keys(accountInput)[1]);

      accountDocId = accountDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a account', async () => {
      assert.isOk(accountDocId);
      const account = await accountModel.getAccountById(accountDocId);

      assert.isOk(account);
      assert.strictEqual(account._id?.toString(), accountDocId.toString());
    });

    it('modify a account', async () => {
      assert.isOk(accountDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await accountModel.updateAccountById(accountDocId, input);
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple accounts without a filter', async () => {
      assert.isOk(accountDocId);
      const accountInput = JSON.parse(JSON.stringify(mocks.MOCK_ACCOUNT));

      const accountDocument = await accountModel.createAccount(accountInput);

      assert.isOk(accountDocument);

      accountDocId2 = accountDocument._id as mongooseTypes.ObjectId;

      const accounts = await accountModel.queryAccounts();
      assert.isArray(accounts.results);
      assert.isAtLeast(accounts.numberOfItems, 2);
      const expectedDocumentCount =
        accounts.numberOfItems <= accounts.itemsPerPage ? accounts.numberOfItems : accounts.itemsPerPage;
      assert.strictEqual(accounts.results.length, expectedDocumentCount);
    });

    it('Get multiple accounts with a filter', async () => {
      assert.isOk(accountDocId2);
      const results = await accountModel.queryAccounts({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(accountDocId2);
      const results = await accountModel.queryAccounts({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await accountModel.queryAccounts({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(results2.results[0]?._id?.toString(), lastId?.toString());
    });

    it('remove a account', async () => {
      assert.isOk(accountDocId);
      await accountModel.deleteAccountById(accountDocId.toString());
      let errored = false;
      try {
        await accountModel.getAccountById(accountDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      accountDocId = null as unknown as ObjectId;
    });
  });
});

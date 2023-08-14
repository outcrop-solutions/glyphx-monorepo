// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_ACCOUNT} from '../mocks';
import {accountService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_ACCOUNT);

describe('#AccountService', () => {
  context('test the functions of the account service', () => {
    const mongoConnection = new MongoDbConnection();
    const accountModel = mongoConnection.models.AccountModel;
    let accountId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const accountDocument = await accountModel.createAccount(
        MOCK_ACCOUNT as unknown as databaseTypes.IAccount
      );

      accountId = accountDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (accountId) {
        await accountModel.findByIdAndDelete(accountId);
      }
    });

    it('will retreive our account from the database', async () => {
      const account = await accountService.getAccount(accountId);
      assert.isOk(account);

      assert.strictEqual(account?.name, MOCK_ACCOUNT.name);
    });

    it('will update our account', async () => {
      assert.isOk(accountId);
      const updatedAccount = await accountService.updateAccount(accountId, {
        [propKeys]: generateDataFromType(MOCK),
      });
      assert.strictEqual(updatedAccount.name, INPUT_PROJECT_NAME);

      const savedAccount = await accountService.getAccount(accountId);

      assert.strictEqual(savedAccount?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our account', async () => {
      assert.isOk(accountId);
      const updatedAccount = await accountService.deleteAccount(accountId);
      assert.strictEqual(updatedAccount[propKeys[0]], propKeys[0]);

      const savedAccount = await accountService.getAccount(accountId);

      assert.isOk(savedAccount?.deletedAt);
    });
  });
});

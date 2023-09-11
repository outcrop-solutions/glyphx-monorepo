// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks';
import {accountService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_ACCOUNT);

describe('#AccountService', () => {
  context('test the functions of the account service', () => {
    const mongoConnection = new MongoDbConnection();
    const accountModel = mongoConnection.models.AccountModel;
    let accountId: ObjectId;

    const userModel = mongoConnection.models.UserModel;
    let userId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const accountDocument = await accountModel.createAccount(
        // @ts-ignore
        mocks.MOCK_ACCOUNT as unknown as databaseTypes.IAccount
      );
      accountId = accountDocument._id as unknown as mongooseTypes.ObjectId;

      const savedUserDocument = await userModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      userId = savedUserDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(userId);
    });

    after(async () => {
      if (accountId) {
        await accountModel.findByIdAndDelete(accountId);
      }
      if (userId) {
        await userModel.findByIdAndDelete(userId);
      }
    });

    it('will retreive our account from the database', async () => {
      const account = await accountService.getAccount(accountId);
      assert.isOk(account);
    });

    // updates and deletes
    it('will update our account', async () => {
      assert.isOk(accountId);
      const updatedAccount = await accountService.updateAccount(accountId, {
        deletedAt: new Date(),
      });
      assert.isOk(updatedAccount.deletedAt);

      const savedAccount = await accountService.getAccount(accountId);

      assert.isOk(savedAccount!.deletedAt);
    });
  });
});

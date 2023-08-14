// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#AccountModel', () => {
  context('test the crud functions of the account model', () => {
    const mongoConnection = new MongoDbConnection();
    const accountModel = mongoConnection.models.AccountModel;
    let accountId: ObjectId;
    let memberId: ObjectId;
    let accountId2: ObjectId;
    let workspaceId: ObjectId;
    let accountTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let accountTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const accountTemplateModel = mongoConnection.models.AccountTemplateModel;

      await workspaceModel.create([INPUT_WORKSPACE], {
        validateBeforeSave: false,
      });
      const savedWorkspaceDocument = await workspaceModel
        .findOne({name: INPUT_WORKSPACE.name})
        .lean();
      workspaceId = savedWorkspaceDocument?._id as mongooseTypes.ObjectId;
      workspaceDocument = savedWorkspaceDocument;
      assert.isOk(workspaceId);

      await memberModel.create([INPUT_MEMBER], {
        validateBeforeSave: false,
      });
      const savedMemberDocument = await memberModel
        .findOne({email: INPUT_MEMBER.email})
        .lean();
      memberId = savedMemberDocument?._id as mongooseTypes.ObjectId;
      memberDocument = savedMemberDocument;
      assert.isOk(memberId);

      await accountTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedAccountTemplateDocument = await accountTemplateModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      accountTemplateId =
        savedAccountTemplateDocument?._id as mongooseTypes.ObjectId;

      accountTemplateDocument = savedAccountTemplateDocument;

      assert.isOk(accountTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const accountTemplateModel = mongoConnection.models.AccountTemplateModel;
      await accountTemplateModel.findByIdAndDelete(accountTemplateId);

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (accountId) {
        await accountModel.findByIdAndDelete(accountId);
      }

      if (accountId2) {
        await accountModel.findByIdAndDelete(accountId2);
      }
    });

    it('add a new account ', async () => {
      const accountInput = JSON.parse(JSON.stringify(INPUT_DATA));
      accountInput.workspace = workspaceDocument;
      accountInput.template = accountTemplateDocument;

      const accountDocument = await accountModel.createAccount(accountInput);

      assert.isOk(accountDocument);
      assert.strictEqual(accountDocument.name, accountInput.name);
      assert.strictEqual(
        accountDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      accountId = accountDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a account', async () => {
      assert.isOk(accountId);
      const account = await accountModel.getAccountById(accountId);

      assert.isOk(account);
      assert.strictEqual(account._id?.toString(), accountId.toString());
    });

    it('modify a account', async () => {
      assert.isOk(accountId);
      const input = {description: 'a modified description'};
      const updatedDocument = await accountModel.updateAccountById(
        accountId,
        input
      );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple accounts without a filter', async () => {
      assert.isOk(accountId);
      const accountInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      accountInput.workspace = workspaceDocument;
      accountInput.type = accountTemplateDocument;

      const accountDocument = await accountModel.createAccount(accountInput);

      assert.isOk(accountDocument);

      accountId2 = accountDocument._id as mongooseTypes.ObjectId;

      const accounts = await accountModel.queryAccounts();
      assert.isArray(accounts.results);
      assert.isAtLeast(accounts.numberOfItems, 2);
      const expectedDocumentCount =
        accounts.numberOfItems <= accounts.itemsPerPage
          ? accounts.numberOfItems
          : accounts.itemsPerPage;
      assert.strictEqual(accounts.results.length, expectedDocumentCount);
    });

    it('Get multiple accounts with a filter', async () => {
      assert.isOk(accountId2);
      const results = await accountModel.queryAccounts({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
      assert.isOk(accountId2);
      const results = await accountModel.queryAccounts({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await accountModel.queryAccounts({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a account', async () => {
      assert.isOk(accountId);
      await accountModel.deleteAccountById(accountId);
      let errored = false;
      try {
        await accountModel.getAccountById(accountId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      accountId = null as unknown as ObjectId;
    });
  });
});

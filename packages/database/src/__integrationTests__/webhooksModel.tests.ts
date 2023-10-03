import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {error} from 'core';
import {DBFormatter} from '../lib/format';

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
  name: 'testWebhook' + UNIQUE_KEY,
  url: 'testurl' + UNIQUE_KEY,
  user: {},
};

const INPUT_DATA2 = {
  name: 'testWebhook2' + UNIQUE_KEY,
  url: 'testurl2' + UNIQUE_KEY,
  user: {},
};

describe('#webhooksModel', () => {
  context('test the crud functions of the webhooks model', () => {
    const mongoConnection = new MongoDbConnection();
    const format = new DBFormatter();
    const webhookModel = mongoConnection.models.WebhookModel;
    let webhookId: string;
    let webhookId2: string;
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

      if (webhookId) {
        await webhookModel.findByIdAndDelete(webhookId);
      }
      if (webhookId2) {
        await webhookModel.findByIdAndDelete(webhookId2);
      }
    });

    it('add a new webhook', async () => {
      const webhookInput = JSON.parse(JSON.stringify(INPUT_DATA));
      webhookInput.user = userDocument;
      const webhookDocument = await webhookModel.createWebhook(format.toJS(webhookInput));

      assert.isOk(webhookDocument);
      assert.strictEqual(webhookDocument.name, webhookInput.name);
      assert.strictEqual(webhookDocument.user.id, userId.toString());

      webhookId = webhookDocument.id!;
    });

    it('retreive a webhook', async () => {
      assert.isOk(webhookId);
      const webhook = await webhookModel.getWebhookById(webhookId.toString());

      assert.isOk(webhook);
      assert.strictEqual(webhook.id, webhookId.toString());
    });

    it('Get multiple webhooks without a filter', async () => {
      assert.isOk(webhookId);
      const webhookInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      webhookInput.user = userDocument;
      const webhookDocument = await webhookModel.createWebhook(format.toJS(webhookInput));

      assert.isOk(webhookDocument);
      webhookId2 = webhookDocument.id!;

      const webhooks = await webhookModel.queryWebhooks();
      assert.isArray(webhooks.results);
      assert.isAtLeast(webhooks.numberOfItems, 2);
      const expectedDocumentCount =
        webhooks.numberOfItems <= webhooks.itemsPerPage ? webhooks.numberOfItems : webhooks.itemsPerPage;
      assert.strictEqual(webhooks.results.length, expectedDocumentCount);
    });

    it('Get multiple webhooks with a filter', async () => {
      assert.isOk(webhookId2);
      const results = await webhookModel.queryWebhooks({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page webhooks', async () => {
      assert.isOk(webhookId2);
      const results = await webhookModel.queryWebhooks({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?.id;

      const results2 = await webhookModel.queryWebhooks({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(results2.results[0]?.id, lastId?.toString());
    });

    it('modify a webhook', async () => {
      assert.isOk(webhookId);
      const input = {url: 'a modified url'};
      const updatedDocument = await webhookModel.updateWebhookById(webhookId.toString(), input);
      assert.strictEqual(updatedDocument.url, input.url);
    });

    it('remove a webhook', async () => {
      assert.isOk(webhookId);
      await webhookModel.deleteWebhookById(webhookId.toString());
      let errored = false;
      try {
        await webhookModel.getWebhookById(webhookId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      webhookId = null as unknown as string;
    });
  });
});

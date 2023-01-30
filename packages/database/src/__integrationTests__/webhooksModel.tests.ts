import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

const INPUT_USER = {
  name: 'testUser' + UNIQUE_KEY,
  username: 'testUserName' + UNIQUE_KEY,
  gh_username: 'testGhUserName' + UNIQUE_KEY,
  email: 'testEmail' + UNIQUE_KEY + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  apiKey: 'testApiKey' + UNIQUE_KEY,
  role: databaseTypes.constants.ROLE.USER,
};

const INPUT_DATA = {
  name: 'testWebhook' + UNIQUE_KEY,
  url: 'testurl' + UNIQUE_KEY,
  user: {},
};

describe('#webhooksModel', () => {
  context('test the crud functions of the webhooks model', () => {
    const mongoConnection = new MongoDbConnection();
    const webhookModel = mongoConnection.models.WebhookModel;
    let webhookId: ObjectId;
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

      if (webhookId) {
        await webhookModel.findByIdAndDelete(webhookId);
      }
    });

    it('add a new webhook', async () => {
      const webhookInput = JSON.parse(JSON.stringify(INPUT_DATA));
      webhookInput.user = userDocument;
      const webhookDocument = await webhookModel.createWebhook(webhookInput);

      assert.isOk(webhookDocument);
      assert.strictEqual(webhookDocument.name, webhookInput.name);
      assert.strictEqual(
        webhookDocument.user._id?.toString(),
        userId.toString()
      );

      webhookId = webhookDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a webhook', async () => {
      assert.isOk(webhookId);
      const webhook = await webhookModel.getWebhookById(webhookId);

      assert.isOk(webhook);
      assert.strictEqual(webhook._id?.toString(), webhookId.toString());
    });

    it('modify a webhook', async () => {
      assert.isOk(webhookId);
      const input = {url: 'a modified url'};
      const updatedDocument = await webhookModel.updateWebhookById(
        webhookId,
        input
      );
      assert.strictEqual(updatedDocument.url, input.url);
    });

    it('remove a webhook', async () => {
      assert.isOk(webhookId);
      await webhookModel.deleteWebhookById(webhookId);
      let errored = false;
      try {
        await webhookModel.getWebhookById(webhookId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      webhookId = null as unknown as ObjectId;
    });
  });
});

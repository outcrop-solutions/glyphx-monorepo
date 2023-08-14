// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_WEBHOOK} from '../mocks';
import {webhookService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_WEBHOOK);

describe('#WebhookService', () => {
  context('test the functions of the webhook service', () => {
    const mongoConnection = new MongoDbConnection();
    const webhookModel = mongoConnection.models.WebhookModel;
    let webhookId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const webhookDocument = await webhookModel.createWebhook(
        MOCK_WEBHOOK as unknown as databaseTypes.IWebhook
      );

      webhookId = webhookDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (webhookId) {
        await webhookModel.findByIdAndDelete(webhookId);
      }
    });

    it('will retreive our webhook from the database', async () => {
      const webhook = await webhookService.getWebhook(webhookId);
      assert.isOk(webhook);

      assert.strictEqual(webhook?.name, MOCK_WEBHOOK.name);
    });

    it('will update our webhook', async () => {
      assert.isOk(webhookId);
      const updatedWebhook = await webhookService.updateWebhook(webhookId, {
        [propKeys]: generateDataFromType(MOCK),
      });
      assert.strictEqual(updatedWebhook.name, INPUT_PROJECT_NAME);

      const savedWebhook = await webhookService.getWebhook(webhookId);

      assert.strictEqual(savedWebhook?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our webhook', async () => {
      assert.isOk(webhookId);
      const updatedWebhook = await webhookService.deleteWebhook(webhookId);
      assert.strictEqual(updatedWebhook[propKeys[0]], propKeys[0]);

      const savedWebhook = await webhookService.getWebhook(webhookId);

      assert.isOk(savedWebhook?.deletedAt);
    });
  });
});

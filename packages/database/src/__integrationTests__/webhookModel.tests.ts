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

describe.only('#WebhookModel', () => {
  context('test the crud functions of the webhook model', () => {
    const mongoConnection = new MongoDbConnection();
    const webhookModel = mongoConnection.models.WebhookModel;
    let webhookDocId: string;
    let webhookDocId2: string;
    let userId: string;
    let userDocument: any;

    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const savedUserDocument = await userModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      userId = savedUserDocument[0]!._id.toString();
      assert.isOk(userId);
    });

    after(async () => {
      if (webhookDocId) {
        await webhookModel.findByIdAndDelete(webhookDocId);
      }

      if (webhookDocId2) {
        await webhookModel.findByIdAndDelete(webhookDocId2);
      }
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);
    });

    it('add a new webhook ', async () => {
      const webhookInput = JSON.parse(JSON.stringify(mocks.MOCK_WEBHOOK));

      webhookInput.user = userDocument;

      const webhookDocument = await webhookModel.createWebhook(webhookInput);

      assert.isOk(webhookDocument);
      assert.strictEqual(Object.keys(webhookDocument)[1], Object.keys(webhookInput)[1]);

      webhookDocId = webhookDocument._id!.toString();
    });

    it('retreive a webhook', async () => {
      assert.isOk(webhookDocId);
      const webhook = await webhookModel.getWebhookById(webhookDocId);

      assert.isOk(webhook);
      assert.strictEqual(webhook._id?.toString(), webhookDocId.toString());
    });

    it('modify a webhook', async () => {
      assert.isOk(webhookDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await webhookModel.updateWebhookById(webhookDocId, input);
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple webhooks without a filter', async () => {
      assert.isOk(webhookDocId);
      const webhookInput = JSON.parse(JSON.stringify(mocks.MOCK_WEBHOOK));

      const webhookDocument = await webhookModel.createWebhook(webhookInput);

      assert.isOk(webhookDocument);

      webhookDocId2 = webhookDocument._id!.toString();

      const webhooks = await webhookModel.queryWebhooks();
      assert.isArray(webhooks.results);
      assert.isAtLeast(webhooks.numberOfItems, 2);
      const expectedDocumentCount =
        webhooks.numberOfItems <= webhooks.itemsPerPage ? webhooks.numberOfItems : webhooks.itemsPerPage;
      assert.strictEqual(webhooks.results.length, expectedDocumentCount);
    });

    it('Get multiple webhooks with a filter', async () => {
      assert.isOk(webhookDocId2);
      const results = await webhookModel.queryWebhooks({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(webhookDocId2);
      const results = await webhookModel.queryWebhooks({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await webhookModel.queryWebhooks({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(results2.results[0]?._id?.toString(), lastId?.toString());
    });

    it('remove a webhook', async () => {
      assert.isOk(webhookDocId);
      await webhookModel.deleteWebhookById(webhookDocId.toString());
      let errored = false;
      try {
        await webhookModel.getWebhookById(webhookDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      webhookDocId = null as unknown as string;
    });
  });
});

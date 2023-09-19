// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks'
import { webhookService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_WEBHOOK)

describe('#WebhookService', () => {
  context('test the functions of the webhook service', () => {
    const mongoConnection = new MongoDbConnection();
    const webhookModel = mongoConnection.models.WebhookModel;
    let webhookId: ObjectId;

    const userModel = mongoConnection.models.UserModel;
    let userId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const webhookDocument = await webhookModel.createWebhook(
        // @ts-ignore
        mocks.MOCK_WEBHOOK as unknown as databaseTypes.IWebhook
      );
      webhookId = webhookDocument._id as unknown as mongooseTypes.ObjectId;



      const savedUserDocument = await userModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      userId =  savedUserDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(userId)

    });

    after(async () => {
      if (webhookId) {
        await webhookModel.findByIdAndDelete(webhookId);
      }
       if (userId) {
        await userModel.findByIdAndDelete(userId);
      }
    });

    it('will retreive our webhook from the database', async () => {
      const webhook = await webhookService.getWebhook(webhookId);
      assert.isOk(webhook);
    });

    // updates and deletes
    it('will update our webhook', async () => {
      assert.isOk(webhookId);
      const updatedWebhook = await webhookService.updateWebhook(webhookId, {
        deletedAt: new Date()
      });
      assert.isOk(updatedWebhook.deletedAt);

      const savedWebhook = await webhookService.getWebhook(webhookId);

      assert.isOk(savedWebhook!.deletedAt);
    });
  });
});

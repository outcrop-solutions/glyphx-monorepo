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

describe('#WebhookModel', () => {
  context('test the crud functions of the webhook model', () => {
    const mongoConnection = new MongoDbConnection();
    const webhookModel = mongoConnection.models.WebhookModel;
    let webhookId: ObjectId;
    let memberId: ObjectId;
    let webhookId2: ObjectId;
    let workspaceId: ObjectId;
    let webhookTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let webhookTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const webhookTemplateModel = mongoConnection.models.WebhookTemplateModel;

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

      await webhookTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedWebhookTemplateDocument = await webhookTemplateModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      webhookTemplateId =
        savedWebhookTemplateDocument?._id as mongooseTypes.ObjectId;

      webhookTemplateDocument = savedWebhookTemplateDocument;

      assert.isOk(webhookTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const webhookTemplateModel = mongoConnection.models.WebhookTemplateModel;
      await webhookTemplateModel.findByIdAndDelete(webhookTemplateId);

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (webhookId) {
        await webhookModel.findByIdAndDelete(webhookId);
      }

      if (webhookId2) {
        await webhookModel.findByIdAndDelete(webhookId2);
      }
    });

    it('add a new webhook ', async () => {
      const webhookInput = JSON.parse(JSON.stringify(INPUT_DATA));
      webhookInput.workspace = workspaceDocument;
      webhookInput.template = webhookTemplateDocument;

      const webhookDocument = await webhookModel.createWebhook(webhookInput);

      assert.isOk(webhookDocument);
      assert.strictEqual(webhookDocument.name, webhookInput.name);
      assert.strictEqual(
        webhookDocument.workspace._id?.toString(),
        workspaceId.toString()
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
      const input = {description: 'a modified description'};
      const updatedDocument = await webhookModel.updateWebhookById(
        webhookId,
        input
      );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple webhooks without a filter', async () => {
      assert.isOk(webhookId);
      const webhookInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      webhookInput.workspace = workspaceDocument;
      webhookInput.type = webhookTemplateDocument;

      const webhookDocument = await webhookModel.createWebhook(webhookInput);

      assert.isOk(webhookDocument);

      webhookId2 = webhookDocument._id as mongooseTypes.ObjectId;

      const webhooks = await webhookModel.queryWebhooks();
      assert.isArray(webhooks.results);
      assert.isAtLeast(webhooks.numberOfItems, 2);
      const expectedDocumentCount =
        webhooks.numberOfItems <= webhooks.itemsPerPage
          ? webhooks.numberOfItems
          : webhooks.itemsPerPage;
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

    it('page accounts', async () => {
      assert.isOk(webhookId2);
      const results = await webhookModel.queryWebhooks({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await webhookModel.queryWebhooks({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
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

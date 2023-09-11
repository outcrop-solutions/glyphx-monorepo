// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import {webhookService} from '../services';
import * as mocks from 'database/src/mongoose/mocks';

describe('#services/webhook', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createWebhook', () => {
    it('will create a Webhook', async () => {
      const webhookId = new mongooseTypes.ObjectId();
      const createdAtId = new mongooseTypes.ObjectId();
      const userId = new mongooseTypes.ObjectId();

      // createWebhook
      const createWebhookFromModelStub = sandbox.stub();
      createWebhookFromModelStub.resolves({
        ...mocks.MOCK_WEBHOOK,
        _id: new mongooseTypes.ObjectId(),
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWebhook);

      sandbox.replace(
        dbConnection.models.WebhookModel,
        'createWebhook',
        createWebhookFromModelStub
      );

      const doc = await webhookService.createWebhook({
        ...mocks.MOCK_WEBHOOK,
        _id: new mongooseTypes.ObjectId(),
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWebhook);

      assert.isTrue(createWebhookFromModelStub.calledOnce);
    });
    // webhook model fails
    it('will publish and rethrow an InvalidArgumentError when webhook model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createWebhook
      const createWebhookFromModelStub = sandbox.stub();
      createWebhookFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WebhookModel,
        'createWebhook',
        createWebhookFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await webhookService.createWebhook({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createWebhookFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when webhook model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createWebhook
      const createWebhookFromModelStub = sandbox.stub();
      createWebhookFromModelStub.rejects(err);

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await webhookService.createWebhook({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createWebhookFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when webhook model throws it', async () => {
      const createWebhookFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createWebhookFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WebhookModel,
        'createWebhook',
        createWebhookFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataValidationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await webhookService.createWebhook({});
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createWebhookFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when webhook model throws a DataOperationError', async () => {
      const createWebhookFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createWebhookFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WebhookModel,
        'createWebhook',
        createWebhookFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await webhookService.createWebhook({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createWebhookFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when webhook model throws a UnexpectedError', async () => {
      const createWebhookFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(errMessage, 'mongodDb');

      createWebhookFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WebhookModel,
        'createWebhook',
        createWebhookFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.UnexpectedError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await webhookService.createWebhook({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createWebhookFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getWebhook', () => {
    it('should get a webhook by id', async () => {
      const webhookId = new mongooseTypes.ObjectId();

      const getWebhookFromModelStub = sandbox.stub();
      getWebhookFromModelStub.resolves({
        _id: webhookId,
      } as unknown as databaseTypes.IWebhook);
      sandbox.replace(
        dbConnection.models.WebhookModel,
        'getWebhookById',
        getWebhookFromModelStub
      );

      const webhook = await webhookService.getWebhook(webhookId);
      assert.isOk(webhook);
      assert.strictEqual(webhook?._id?.toString(), webhookId.toString());

      assert.isTrue(getWebhookFromModelStub.calledOnce);
    });
    it('should get a webhook by id when id is a string', async () => {
      const webhookId = new mongooseTypes.ObjectId();

      const getWebhookFromModelStub = sandbox.stub();
      getWebhookFromModelStub.resolves({
        _id: webhookId,
      } as unknown as databaseTypes.IWebhook);
      sandbox.replace(
        dbConnection.models.WebhookModel,
        'getWebhookById',
        getWebhookFromModelStub
      );

      const webhook = await webhookService.getWebhook(webhookId.toString());
      assert.isOk(webhook);
      assert.strictEqual(webhook?._id?.toString(), webhookId.toString());

      assert.isTrue(getWebhookFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the webhook cannot be found', async () => {
      const webhookId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'webhookId',
        webhookId
      );
      const getWebhookFromModelStub = sandbox.stub();
      getWebhookFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WebhookModel,
        'getWebhookById',
        getWebhookFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const webhook = await webhookService.getWebhook(webhookId);
      assert.notOk(webhook);

      assert.isTrue(getWebhookFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const webhookId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getWebhookById'
      );
      const getWebhookFromModelStub = sandbox.stub();
      getWebhookFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WebhookModel,
        'getWebhookById',
        getWebhookFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await webhookService.getWebhook(webhookId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWebhookFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getWebhooks', () => {
    it('should get webhooks by filter', async () => {
      const webhookId = new mongooseTypes.ObjectId();
      const webhookId2 = new mongooseTypes.ObjectId();
      const webhookFilter = {_id: webhookId};

      const queryWebhooksFromModelStub = sandbox.stub();
      queryWebhooksFromModelStub.resolves({
        results: [
          {
            ...mocks.MOCK_WEBHOOK,
            _id: webhookId,
            user: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
          } as unknown as databaseTypes.IWebhook,
          {
            ...mocks.MOCK_WEBHOOK,
            _id: webhookId2,
            user: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
          } as unknown as databaseTypes.IWebhook,
        ],
      } as unknown as databaseTypes.IWebhook[]);

      sandbox.replace(
        dbConnection.models.WebhookModel,
        'queryWebhooks',
        queryWebhooksFromModelStub
      );

      const webhooks = await webhookService.getWebhooks(webhookFilter);
      assert.isOk(webhooks![0]);
      assert.strictEqual(webhooks![0]._id?.toString(), webhookId.toString());
      assert.isTrue(queryWebhooksFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the webhooks cannot be found', async () => {
      const webhookName = 'webhookName1';
      const webhookFilter = {name: webhookName};
      const errMessage = 'Cannot find the webhook';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        webhookFilter
      );
      const getWebhookFromModelStub = sandbox.stub();
      getWebhookFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WebhookModel,
        'queryWebhooks',
        getWebhookFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const webhook = await webhookService.getWebhooks(webhookFilter);
      assert.notOk(webhook);

      assert.isTrue(getWebhookFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const webhookName = 'webhookName1';
      const webhookFilter = {name: webhookName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getWebhookByEmail'
      );
      const getWebhookFromModelStub = sandbox.stub();
      getWebhookFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WebhookModel,
        'queryWebhooks',
        getWebhookFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await webhookService.getWebhooks(webhookFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWebhookFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateWebhook', () => {
    it('will update a webhook', async () => {
      const webhookId = new mongooseTypes.ObjectId();
      const updateWebhookFromModelStub = sandbox.stub();
      updateWebhookFromModelStub.resolves({
        ...mocks.MOCK_WEBHOOK,
        _id: new mongooseTypes.ObjectId(),
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWebhook);
      sandbox.replace(
        dbConnection.models.WebhookModel,
        'updateWebhookById',
        updateWebhookFromModelStub
      );

      const webhook = await webhookService.updateWebhook(webhookId, {
        deletedAt: new Date(),
      });
      assert.isOk(webhook);
      assert.strictEqual(webhook._id, webhookId);
      assert.isOk(webhook.deletedAt);
      assert.isTrue(updateWebhookFromModelStub.calledOnce);
    });
    it('will update a webhook when the id is a string', async () => {
      const webhookId = new mongooseTypes.ObjectId();
      const updateWebhookFromModelStub = sandbox.stub();
      updateWebhookFromModelStub.resolves({
        ...mocks.MOCK_WEBHOOK,
        _id: new mongooseTypes.ObjectId(),
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWebhook);
      sandbox.replace(
        dbConnection.models.WebhookModel,
        'updateWebhookById',
        updateWebhookFromModelStub
      );

      const webhook = await webhookService.updateWebhook(webhookId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(webhook);
      assert.strictEqual(webhook._id, webhookId);
      assert.isOk(webhook.deletedAt);
      assert.isTrue(updateWebhookFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when webhook model throws it ', async () => {
      const webhookId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateWebhookFromModelStub = sandbox.stub();
      updateWebhookFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WebhookModel,
        'updateWebhookById',
        updateWebhookFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await webhookService.updateWebhook(webhookId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateWebhookFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when webhook model throws it ', async () => {
      const webhookId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateWebhookFromModelStub = sandbox.stub();
      updateWebhookFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WebhookModel,
        'updateWebhookById',
        updateWebhookFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await webhookService.updateWebhook(webhookId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateWebhookFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when webhook model throws a DataOperationError ', async () => {
      const webhookId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateWebhookById'
      );
      const updateWebhookFromModelStub = sandbox.stub();
      updateWebhookFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WebhookModel,
        'updateWebhookById',
        updateWebhookFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await webhookService.updateWebhook(webhookId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateWebhookFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});

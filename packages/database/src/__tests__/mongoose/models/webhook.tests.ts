import {assert} from 'chai';
import {WebhookModel} from '../../..//mongoose/models/webhook';
import {UserModel} from '../../..//mongoose/models/user';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const mockWebhook: databaseTypes.IWebhook = {
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'test webhook',
  url: 'https://web.hook',
  user: {_id: new mongoose.Types.ObjectId()} as databaseTypes.IUser,
};

describe('#mongoose/models/webhook', () => {
  context('webhookIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the webhookId exists', async () => {
      const webhookId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: webhookId});
      sandbox.replace(WebhookModel, 'findById', findByIdStub);

      const result = await WebhookModel.webhookIdExists(webhookId);

      assert.isTrue(result);
    });

    it('should return false if the webhookId does not exist', async () => {
      const webhookId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(WebhookModel, 'findById', findByIdStub);

      const result = await WebhookModel.webhookIdExists(webhookId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const webhookId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(WebhookModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await WebhookModel.webhookIdExists(webhookId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context.only('createWebhook', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create an webhook document', async () => {
      const webhookId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(WebhookModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        WebhookModel,
        'create',
        sandbox.stub().resolves([{_id: webhookId}])
      );

      const getWebhookByIdStub = sandbox.stub();
      getWebhookByIdStub.resolves({_id: webhookId});

      sandbox.replace(WebhookModel, 'getWebhookById', getWebhookByIdStub);

      const result = await WebhookModel.createWebhook(mockWebhook);
      assert.strictEqual(result._id, webhookId);
      assert.isTrue(getWebhookByIdStub.calledOnce);
    });

    it('will throw an InvalidArgumentError if the user attached to the webhook does not exist.', async () => {
      const sessionId = new mongoose.Types.ObjectId();
      sandbox.replace(
        UserModel,
        'userIdExists',
        sandbox.stub().resolves(false)
      );
      sandbox.replace(WebhookModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        WebhookModel,
        'create',
        sandbox.stub().resolves([{_id: sessionId}])
      );

      const getWebhookByIdStub = sandbox.stub();
      getWebhookByIdStub.resolves({_id: sessionId});

      sandbox.replace(WebhookModel, 'getWebhookById', getWebhookByIdStub);
      let errorred = false;

      try {
        await WebhookModel.createWebhook(mockWebhook);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DataValidationError if the webhook cannot be validated.', async () => {
      const webhookId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(
        WebhookModel,
        'validate',
        sandbox.stub().rejects('Invalid')
      );
      sandbox.replace(
        WebhookModel,
        'create',
        sandbox.stub().resolves([{_id: webhookId}])
      );

      const getWebhookByIdStub = sandbox.stub();
      getWebhookByIdStub.resolves({_id: webhookId});

      sandbox.replace(WebhookModel, 'getWebhookById', getWebhookByIdStub);
      let errorred = false;

      try {
        await WebhookModel.createWebhook(mockWebhook);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DatabaseOperationError if the underlying database connection throws an error.', async () => {
      const webhookId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(WebhookModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(WebhookModel, 'create', sandbox.stub().rejects('oops'));

      const getWebhookByIdStub = sandbox.stub();
      getWebhookByIdStub.resolves({_id: webhookId});

      sandbox.replace(WebhookModel, 'getWebhookById', getWebhookByIdStub);
      let errorred = false;

      try {
        await WebhookModel.createWebhook(mockWebhook);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });
});

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

  context('createWebhook', () => {
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

  context('updateWebhookById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should update an existing webhook', async () => {
      const updateWebhook = {
        name: 'test webhook',
      };

      const webhookId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(WebhookModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      const getWebhookStub = sandbox.stub();
      getWebhookStub.resolves({_id: webhookId});
      sandbox.replace(WebhookModel, 'getWebhookById', getWebhookStub);

      const result = await WebhookModel.updateWebhookById(
        webhookId,
        updateWebhook
      );

      assert.strictEqual(result._id, webhookId);
      assert.isTrue(updateStub.calledOnce);
      assert.isFalse(getUserStub.called);
      assert.isTrue(getWebhookStub.calledOnce);
    });

    it('should update an existing webhook changing the user', async () => {
      const updateWebhook = {
        name: 'test webhook',
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };

      const webhookId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(WebhookModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      const getWebhookStub = sandbox.stub();
      getWebhookStub.resolves({_id: webhookId});
      sandbox.replace(WebhookModel, 'getWebhookById', getWebhookStub);

      const result = await WebhookModel.updateWebhookById(
        webhookId,
        updateWebhook
      );

      assert.strictEqual(result._id, webhookId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.calledOnce);
      assert.isTrue(getWebhookStub.calledOnce);
    });

    it('will fail when the webhook does not exist', async () => {
      const updateWebhook = {
        name: 'test webhook',
      };

      const webhookId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(WebhookModel, 'updateOne', updateStub);

      const getWebhookStub = sandbox.stub();
      getWebhookStub.resolves({_id: webhookId});
      sandbox.replace(WebhookModel, 'getWebhookById', getWebhookStub);
      let errorred = false;
      try {
        await WebhookModel.updateWebhookById(webhookId, updateWebhook);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will fail with an InvalidOperationError when the validateUpdateObject method fails', async () => {
      const updateWebhook = {
        name: 'test webhook',
      };

      const wehookId = new mongoose.Types.ObjectId();

      sandbox.replace(
        WebhookModel,
        'validateUpdateObject',
        sandbox
          .stub()
          .rejects(new error.InvalidOperationError('you cant do that', {}))
      );

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(WebhookModel, 'updateOne', updateStub);

      const getWebhookStub = sandbox.stub();
      getWebhookStub.resolves({_id: wehookId});
      sandbox.replace(WebhookModel, 'getWebhookById', getWebhookStub);
      let errorred = false;
      try {
        await WebhookModel.updateWebhookById(wehookId, updateWebhook);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will fail with a DatabaseOperationError when the underlying database connection errors', async () => {
      const updateWebhook = {
        name: 'test webhook',
      };

      const webhookId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something really bad has happened');
      sandbox.replace(WebhookModel, 'updateOne', updateStub);

      const getWebhookStub = sandbox.stub();
      getWebhookStub.resolves({_id: webhookId});
      sandbox.replace(WebhookModel, 'getWebhookById', getWebhookStub);
      let errorred = false;
      try {
        await WebhookModel.updateWebhookById(webhookId, updateWebhook);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return true when the object is valid', async () => {
      const inputWebhook = {
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };

      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);

      await WebhookModel.validateUpdateObject(inputWebhook);
      assert.isTrue(userExistsStub.calledOnce);
    });

    it('will throw an InvalidOperationError when the user does not exist', async () => {
      const inputWebhook = {
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);
      let errorred = false;
      try {
        await WebhookModel.validateUpdateObject(inputWebhook);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(userExistsStub.calledOnce);
    });

    it('will throw an InvalidOperationError when we attempt to supply an _id', async () => {
      const inputWebook = {
        _id: new mongoose.Types.ObjectId(),
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IAccount;
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);
      let errorred = false;
      try {
        await WebhookModel.validateUpdateObject(inputWebook);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(userExistsStub.calledOnce);
    });

    it('will throw an InvalidOperationError when we attempt to supply a createdAt date', async () => {
      const inputWebook = {
        createdAt: new Date(),
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IAccount;
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);
      let errorred = false;
      try {
        await WebhookModel.validateUpdateObject(inputWebook);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(userExistsStub.calledOnce);
    });

    it('will throw an InvalidOperationError when we attempt to supply a updatedAt date', async () => {
      const inputWebook = {
        updatedAt: new Date(),
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IAccount;
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);
      let errorred = false;
      try {
        await WebhookModel.validateUpdateObject(inputWebook);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(userExistsStub.calledOnce);
    });
  });

  context('delete a webhook document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a webhook', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(WebhookModel, 'deleteOne', deleteStub);

      const webhookId = new mongoose.Types.ObjectId();

      await WebhookModel.deleteWebhookById(webhookId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the webhook does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(WebhookModel, 'deleteOne', deleteStub);

      const webhookId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await WebhookModel.deleteWebhookById(webhookId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(WebhookModel, 'deleteOne', deleteStub);

      const webhookId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await WebhookModel.deleteWebhookById(webhookId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });

  context('allWebhookIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the webhook ids exist', async () => {
      const webhookIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedWebhookIds = webhookIds.map(projectId => {
        return {
          _id: projectId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedWebhookIds);
      sandbox.replace(WebhookModel, 'find', findStub);

      assert.isTrue(await WebhookModel.allWebhookIdsExist(webhookIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const webhookIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedWebhookIds = [
        {
          _id: webhookIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedWebhookIds);
      sandbox.replace(WebhookModel, 'find', findStub);
      let errored = false;
      try {
        await WebhookModel.allWebhookIdsExist(webhookIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          webhookIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const webhookIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(WebhookModel, 'find', findStub);
      let errored = false;
      try {
        await WebhookModel.allWebhookIdsExist(webhookIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('getWebhookById', () => {
    class mockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError: boolean = false) {
        this.mockData = input;
        this.throwError = throwError;
      }
      populate(input: string) {
        return this;
      }

      async lean(): Promise<any> {
        if (this.throwError) throw this.mockData;

        return this.mockData;
      }
    }

    const mockWebHook: databaseTypes.IWebhook = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'testWebHook',
      url: 'http://test.web.hook',
      __v: 1,
      user: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test user',
        __v: 1,
      } as unknown as databaseTypes.IUser,
    } as databaseTypes.IWebhook;
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a webook document with the user populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new mockMongooseQuery(mockWebHook));
      sandbox.replace(WebhookModel, 'findById', findByIdStub);

      const doc = await WebhookModel.getWebhookById(
        mockWebHook._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.user as any).__v);

      assert.strictEqual(doc._id, mockWebHook._id);
    });

    it('will throw a DataNotFoundError when the webhook does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new mockMongooseQuery(null));
      sandbox.replace(WebhookModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await WebhookModel.getWebhookById(
          mockWebHook._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(
        new mockMongooseQuery('something bad happened', true)
      );
      sandbox.replace(WebhookModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await WebhookModel.getWebhookById(
          mockWebHook._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});

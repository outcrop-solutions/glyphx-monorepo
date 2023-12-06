// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import { WebhookModel} from '../../../mongoose/models/webhook'
import * as mocks from '../../../mongoose/mocks';
import { UserModel} from '../../../mongoose/models/user'
import {IQueryResult, databaseTypes} from 'types'
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/webhook', () => {
  context('webhookIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the webhookId exists', async () => {
      const webhookId = mocks.MOCK_WEBHOOK._id;
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: webhookId});
      sandbox.replace(WebhookModel, 'findById', findByIdStub);

      const result = await WebhookModel.webhookIdExists(webhookId);

      assert.isTrue(result);
    });

    it('should return false if the webhookId does not exist', async () => {
      const webhookId = mocks.MOCK_WEBHOOK._id;
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(WebhookModel, 'findById', findByIdStub);

      const result = await WebhookModel.webhookIdExists(webhookId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const webhookId = mocks.MOCK_WEBHOOK._id;
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

      const returnedWebhookIds = webhookIds.map(webhookId => {
        return {
          _id: webhookId,
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

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will not throw an error when no unsafe fields are present', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        userStub
      );

      let errored = false;

      try {
        await WebhookModel.validateUpdateObject(mocks.MOCK_WEBHOOK as unknown as Omit<Partial<databaseTypes.IWebhook>, '_id'>);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        userStub
      );

      let errored = false;

      try {
        await WebhookModel.validateUpdateObject(mocks.MOCK_WEBHOOK as unknown as Omit<Partial<databaseTypes.IWebhook>, '_id'>);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(userStub.calledOnce);
    });

    it('will fail when the user does not exist.', async () => {
      
      const userStub = sandbox.stub();
      userStub.resolves(false);
      sandbox.replace(
        UserModel,
        'userIdExists',
        userStub
      );

      let errored = false;

      try {
        await WebhookModel.validateUpdateObject(mocks.MOCK_WEBHOOK as unknown as Omit<Partial<databaseTypes.IWebhook>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });


    it('will fail when trying to update the _id', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        userStub
      );

      let errored = false;

      try {
        await WebhookModel.validateUpdateObject({...mocks.MOCK_WEBHOOK, _id: new mongoose.Types.ObjectId() } as unknown as Omit<Partial<databaseTypes.IWebhook>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        userStub
      );

      let errored = false;

      try {
        await WebhookModel.validateUpdateObject({...mocks.MOCK_WEBHOOK, createdAt: new Date() } as unknown as Omit<Partial<databaseTypes.IWebhook>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        userStub
      );

      let errored = false;

      try {
        await WebhookModel.validateUpdateObject({...mocks.MOCK_WEBHOOK, updatedAt: new Date() }  as unknown as Omit<Partial<databaseTypes.IWebhook>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createWebhook', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a webhook document', async () => {
      sandbox.replace(
        WebhookModel,
        'validateUser',
        sandbox.stub().resolves(mocks.MOCK_WEBHOOK.user)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        WebhookModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(WebhookModel, 'validate', sandbox.stub().resolves(true));
      
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(WebhookModel, 'getWebhookById', stub);

      const webhookDocument = await WebhookModel.createWebhook(mocks.MOCK_WEBHOOK);

      assert.strictEqual(webhookDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });



    it('will rethrow a DataValidationError when the user validator throws one', async () => {
       sandbox.replace(
        WebhookModel,
        'validateUser',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The user does not exist',
              'user ',
              {}
            )
          )
      );
      
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        WebhookModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(WebhookModel, 'validate', sandbox.stub().resolves(true));
      
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(WebhookModel, 'getWebhookById', stub);

      let errored = false;

      try {
        await WebhookModel.createWebhook(mocks.MOCK_WEBHOOK);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });


    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        WebhookModel,
        'validateUser',
        sandbox.stub().resolves(mocks.MOCK_WEBHOOK.user)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(WebhookModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        WebhookModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(WebhookModel, 'getWebhookById', stub);
      let hasError = false;
      try {
        await WebhookModel.createWebhook(mocks.MOCK_WEBHOOK);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        WebhookModel,
        'validateUser',
        sandbox.stub().resolves(mocks.MOCK_WEBHOOK.user)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(WebhookModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(WebhookModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(WebhookModel, 'getWebhookById', stub);

      let hasError = false;
      try {
        await WebhookModel.createWebhook(mocks.MOCK_WEBHOOK);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        WebhookModel,
        'validateUser',
        sandbox.stub().resolves(mocks.MOCK_WEBHOOK.user)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        WebhookModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        WebhookModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(WebhookModel, 'getWebhookById', stub);
      let hasError = false;
      try {
        await WebhookModel.createWebhook(mocks.MOCK_WEBHOOK);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getWebhookById', () => {
    class MockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError = false) {
        this.mockData = input;
        this.throwError = throwError;
      }
      populate() {
        return this;
      }

      async lean(): Promise<any> {
        if (this.throwError) throw this.mockData;

        return this.mockData;
      }
    }

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a webhook document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_WEBHOOK));
      sandbox.replace(WebhookModel, 'findById', findByIdStub);

      const doc = await WebhookModel.getWebhookById(
        mocks.MOCK_WEBHOOK._id
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.user as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_WEBHOOK._id);
    });

    it('will throw a DataNotFoundError when the webhook does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(WebhookModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await WebhookModel.getWebhookById(
          mocks.MOCK_WEBHOOK._id
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
        new MockMongooseQuery('something bad happened', true)
      );
      sandbox.replace(WebhookModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await WebhookModel.getWebhookById(
          mocks.MOCK_WEBHOOK.id
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryWebhooks', () => {
    class MockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError = false) {
        this.mockData = input;
        this.throwError = throwError;
      }

      populate() {
        return this;
      }

      async lean(): Promise<any> {
        if (this.throwError) throw this.mockData;

        return this.mockData;
      }
    }

    const mockWebhooks = [
      {
       ...mocks.MOCK_WEBHOOK,
        _id: new mongoose.Types.ObjectId(),
        user: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as databaseTypes.IWebhook,
      {
        ...mocks.MOCK_WEBHOOK,
        _id: new mongoose.Types.ObjectId(),
        user: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as databaseTypes.IWebhook,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered webhooks', async () => {
      sandbox.replace(
        WebhookModel,
        'count',
        sandbox.stub().resolves(mockWebhooks.length)
      );

      sandbox.replace(
        WebhookModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockWebhooks))
      );

      const results = await WebhookModel.queryWebhooks({});

      assert.strictEqual(results.numberOfItems, mockWebhooks.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockWebhooks.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.user as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(WebhookModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        WebhookModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockWebhooks))
      );

      let errored = false;
      try {
        await WebhookModel.queryWebhooks();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        WebhookModel,
        'count',
        sandbox.stub().resolves(mockWebhooks.length)
      );

      sandbox.replace(
        WebhookModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockWebhooks))
      );

      let errored = false;
      try {
        await WebhookModel.queryWebhooks({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        WebhookModel,
        'count',
        sandbox.stub().resolves(mockWebhooks.length)
      );

      sandbox.replace(
        WebhookModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await WebhookModel.queryWebhooks({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateWebhookById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a webhook', async () => {
      const updateWebhook = {
        ...mocks.MOCK_WEBHOOK,
        deletedAt: new Date(),
        user: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWebhook;

      const webhookId = mocks.MOCK_WEBHOOK._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(WebhookModel, 'updateOne', updateStub);

      const getWebhookStub = sandbox.stub();
      getWebhookStub.resolves({_id: webhookId});
      sandbox.replace(WebhookModel, 'getWebhookById', getWebhookStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(WebhookModel, 'validateUpdateObject', validateStub);

      const result = await WebhookModel.updateWebhookById(
        webhookId,
        updateWebhook
      );

      assert.strictEqual(result._id, mocks.MOCK_WEBHOOK._id);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getWebhookStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a webhook with references as ObjectIds', async () => {
      const updateWebhook = {
        ...mocks.MOCK_WEBHOOK,
        deletedAt: new Date()
      } as unknown as databaseTypes.IWebhook;

      const webhookId = mocks.MOCK_WEBHOOK._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(WebhookModel, 'updateOne', updateStub);

      const getWebhookStub = sandbox.stub();
      getWebhookStub.resolves({_id: webhookId});
      sandbox.replace(WebhookModel, 'getWebhookById', getWebhookStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(WebhookModel, 'validateUpdateObject', validateStub);

      const result = await WebhookModel.updateWebhookById(
        webhookId,
        updateWebhook
      );

      assert.strictEqual(result._id, webhookId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getWebhookStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the webhook does not exist', async () => {
      const updateWebhook = {
        ...mocks.MOCK_WEBHOOK,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IWebhook;

      const webhookId = mocks.MOCK_WEBHOOK._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(WebhookModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(WebhookModel, 'validateUpdateObject', validateStub);

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

    it('Will fail when validateUpdateObject fails', async () => {
      const updateWebhook = {
       ...mocks.MOCK_WEBHOOK,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IWebhook;

      const webhookId = mocks.MOCK_WEBHOOK._id;

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(WebhookModel, 'updateOne', updateStub);

      const getWebhookStub = sandbox.stub();
      getWebhookStub.resolves({_id: webhookId});
      sandbox.replace(WebhookModel, 'getWebhookById', getWebhookStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(WebhookModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await WebhookModel.updateWebhookById(webhookId, updateWebhook);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateWebhook = {
       ...mocks.MOCK_WEBHOOK,
        deletedAt: new Date()
      } as unknown as databaseTypes.IWebhook;

      const webhookId = mocks.MOCK_WEBHOOK._id;

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(WebhookModel, 'updateOne', updateStub);

      const getWebhookStub = sandbox.stub();
      getWebhookStub.resolves({_id: webhookId});
      sandbox.replace(WebhookModel, 'getWebhookById', getWebhookStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(WebhookModel, 'validateUpdateObject', validateStub);

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

  context('Delete a webhook document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a webhook', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(WebhookModel, 'deleteOne', deleteStub);

      const webhookId = mocks.MOCK_WEBHOOK._id;

      await WebhookModel.deleteWebhookById(webhookId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the webhook does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(WebhookModel, 'deleteOne', deleteStub);

      const webhookId = mocks.MOCK_WEBHOOK._id;

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

      const webhookId = mocks.MOCK_WEBHOOK._id;

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

});

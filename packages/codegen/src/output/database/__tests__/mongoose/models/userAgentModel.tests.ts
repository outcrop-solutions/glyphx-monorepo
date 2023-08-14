// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {UserAgentModel} from '../../../mongoose/models/userAgent';
import * as mocks from '../../../mongoose/mocks';
import {IQueryResult} from '@glyphx/types';
import {databaseTypes} from '../../../../../../database';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/userAgent', () => {
  context('userAgentIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the userAgentId exists', async () => {
      const userAgentId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: userAgentId});
      sandbox.replace(UserAgentModel, 'findById', findByIdStub);

      const result = await UserAgentModel.userAgentIdExists(userAgentId);

      assert.isTrue(result);
    });

    it('should return false if the userAgentId does not exist', async () => {
      const userAgentId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(UserAgentModel, 'findById', findByIdStub);

      const result = await UserAgentModel.userAgentIdExists(userAgentId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const userAgentId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(UserAgentModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await UserAgentModel.userAgentIdExists(userAgentId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allUserAgentIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the userAgent ids exist', async () => {
      const userAgentIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedUserAgentIds = userAgentIds.map(userAgentId => {
        return {
          _id: userAgentId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedUserAgentIds);
      sandbox.replace(UserAgentModel, 'find', findStub);

      assert.isTrue(await UserAgentModel.allUserAgentIdsExist(userAgentIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const userAgentIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedUserAgentIds = [
        {
          _id: userAgentIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedUserAgentIds);
      sandbox.replace(UserAgentModel, 'find', findStub);
      let errored = false;
      try {
        await UserAgentModel.allUserAgentIdsExist(userAgentIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          userAgentIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const userAgentIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(UserAgentModel, 'find', findStub);
      let errored = false;
      try {
        await UserAgentModel.allUserAgentIdsExist(userAgentIds);
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
      let errored = false;

      try {
        await UserAgentModel.validateUpdateObject(
          mocks.MOCK_USERAGENT as unknown as Omit<
            Partial<databaseTypes.IUserAgent>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      let errored = false;

      try {
        await UserAgentModel.validateUpdateObject(
          mocks.MOCK_USERAGENT as unknown as Omit<
            Partial<databaseTypes.IUserAgent>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will fail when trying to update the _id', async () => {
      let errored = false;

      try {
        await UserAgentModel.validateUpdateObject({
          ...mocks.MOCK_USERAGENT,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IUserAgent>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      let errored = false;

      try {
        await UserAgentModel.validateUpdateObject({
          ...mocks.MOCK_USERAGENT,
          createdAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IUserAgent>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      let errored = false;

      try {
        await UserAgentModel.validateUpdateObject({
          ...mocks.MOCK_USERAGENT,
          updatedAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IUserAgent>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createUserAgent', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a userAgent document', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        UserAgentModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(
        UserAgentModel,
        'validate',
        sandbox.stub().resolves(true)
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(UserAgentModel, 'getUserAgentById', stub);

      const userAgentDocument = await UserAgentModel.createUserAgent(
        mocks.MOCK_USERAGENT
      );

      assert.strictEqual(userAgentDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        UserAgentModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        UserAgentModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(UserAgentModel, 'getUserAgentById', stub);
      let hasError = false;
      try {
        await UserAgentModel.createUserAgent(mocks.MOCK_USERAGENT);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        UserAgentModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(UserAgentModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(UserAgentModel, 'getUserAgentById', stub);

      let hasError = false;
      try {
        await UserAgentModel.createUserAgent(mocks.MOCK_USERAGENT);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        UserAgentModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        UserAgentModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(UserAgentModel, 'getUserAgentById', stub);
      let hasError = false;
      try {
        await UserAgentModel.createUserAgent(mocks.MOCK_USERAGENT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getUserAgentById', () => {
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

    it('will retreive a userAgent document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_USERAGENT));
      sandbox.replace(UserAgentModel, 'findById', findByIdStub);

      const doc = await UserAgentModel.getUserAgentById(
        mocks.MOCK_USERAGENT._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);

      assert.strictEqual(doc._id, mocks.MOCK_USERAGENT._id);
    });

    it('will throw a DataNotFoundError when the userAgent does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(UserAgentModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await UserAgentModel.getUserAgentById(
          mocks.MOCK_USERAGENT._id as mongoose.Types.ObjectId
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
      sandbox.replace(UserAgentModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await UserAgentModel.getUserAgentById(
          mocks.MOCK_USERAGENT._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryUserAgents', () => {
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

    const mockUserAgents = [
      {
        ...mocks.MOCK_USERAGENT,
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IUserAgent,
      {
        ...mocks.MOCK_USERAGENT,
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IUserAgent,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered userAgents', async () => {
      sandbox.replace(
        UserAgentModel,
        'count',
        sandbox.stub().resolves(mockUserAgents.length)
      );

      sandbox.replace(
        UserAgentModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockUserAgents))
      );

      const results = await UserAgentModel.queryUserAgents({});

      assert.strictEqual(results.numberOfItems, mockUserAgents.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockUserAgents.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any).__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(UserAgentModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        UserAgentModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockUserAgents))
      );

      let errored = false;
      try {
        await UserAgentModel.queryUserAgents();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        UserAgentModel,
        'count',
        sandbox.stub().resolves(mockUserAgents.length)
      );

      sandbox.replace(
        UserAgentModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockUserAgents))
      );

      let errored = false;
      try {
        await UserAgentModel.queryUserAgents({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        UserAgentModel,
        'count',
        sandbox.stub().resolves(mockUserAgents.length)
      );

      sandbox.replace(
        UserAgentModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await UserAgentModel.queryUserAgents({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateUserAgentById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a userAgent', async () => {
      const updateUserAgent = {
        ...mocks.MOCK_USERAGENT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IUserAgent;

      const userAgentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(UserAgentModel, 'updateOne', updateStub);

      const getUserAgentStub = sandbox.stub();
      getUserAgentStub.resolves({_id: userAgentId});
      sandbox.replace(UserAgentModel, 'getUserAgentById', getUserAgentStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(UserAgentModel, 'validateUpdateObject', validateStub);

      const result = await UserAgentModel.updateUserAgentById(
        userAgentId,
        updateUserAgent
      );

      assert.strictEqual(result._id, userAgentId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserAgentStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a userAgent with refrences as ObjectIds', async () => {
      const updateUserAgent = {
        ...mocks.MOCK_USERAGENT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IUserAgent;

      const userAgentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(UserAgentModel, 'updateOne', updateStub);

      const getUserAgentStub = sandbox.stub();
      getUserAgentStub.resolves({_id: userAgentId});
      sandbox.replace(UserAgentModel, 'getUserAgentById', getUserAgentStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(UserAgentModel, 'validateUpdateObject', validateStub);

      const result = await UserAgentModel.updateUserAgentById(
        userAgentId,
        updateUserAgent
      );

      assert.strictEqual(result._id, userAgentId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserAgentStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the userAgent does not exist', async () => {
      const updateUserAgent = {
        ...mocks.MOCK_USERAGENT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IUserAgent;

      const userAgentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(UserAgentModel, 'updateOne', updateStub);

      const getUserAgentStub = sandbox.stub();
      getUserAgentStub.resolves({_id: userAgentId});
      sandbox.replace(UserAgentModel, 'getUserAgentById', getUserAgentStub);

      let errorred = false;
      try {
        await UserAgentModel.updateUserAgentById(userAgentId, updateUserAgent);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateUserAgent = {
        ...mocks.MOCK_USERAGENT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IUserAgent;

      const userAgentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(UserAgentModel, 'updateOne', updateStub);

      const getUserAgentStub = sandbox.stub();
      getUserAgentStub.resolves({_id: userAgentId});
      sandbox.replace(UserAgentModel, 'getUserAgentById', getUserAgentStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(UserAgentModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await UserAgentModel.updateUserAgentById(userAgentId, updateUserAgent);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateUserAgent = {
        ...mocks.MOCK_USERAGENT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IUserAgent;

      const userAgentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(UserAgentModel, 'updateOne', updateStub);

      const getUserAgentStub = sandbox.stub();
      getUserAgentStub.resolves({_id: userAgentId});
      sandbox.replace(UserAgentModel, 'getUserAgentById', getUserAgentStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(UserAgentModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await UserAgentModel.updateUserAgentById(userAgentId, updateUserAgent);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a userAgent document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a userAgent', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(UserAgentModel, 'deleteOne', deleteStub);

      const userAgentId = new mongoose.Types.ObjectId();

      await UserAgentModel.deleteUserAgentById(userAgentId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the userAgent does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(UserAgentModel, 'deleteOne', deleteStub);

      const userAgentId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await UserAgentModel.deleteUserAgentById(userAgentId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(UserAgentModel, 'deleteOne', deleteStub);

      const userAgentId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await UserAgentModel.deleteUserAgentById(userAgentId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});

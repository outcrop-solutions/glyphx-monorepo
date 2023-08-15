// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {VerificationTokenModel} from '../../../mongoose/models/verificationToken';
import * as mocks from '../../../mongoose/mocks';
import {IQueryResult} from '@glyphx/types';
import {databaseTypes} from '../../../../../../database';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/verificationToken', () => {
  context('verificationTokenIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the verificationTokenId exists', async () => {
      const verificationTokenId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: verificationTokenId});
      sandbox.replace(VerificationTokenModel, 'findById', findByIdStub);

      const result = await VerificationTokenModel.verificationTokenIdExists(
        verificationTokenId
      );

      assert.isTrue(result);
    });

    it('should return false if the verificationTokenId does not exist', async () => {
      const verificationTokenId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(VerificationTokenModel, 'findById', findByIdStub);

      const result = await VerificationTokenModel.verificationTokenIdExists(
        verificationTokenId
      );

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const verificationTokenId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(VerificationTokenModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await VerificationTokenModel.verificationTokenIdExists(
          verificationTokenId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allVerificationTokenIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the verificationToken ids exist', async () => {
      const verificationTokenIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedVerificationTokenIds = verificationTokenIds.map(
        verificationTokenId => {
          return {
            _id: verificationTokenId,
          };
        }
      );

      const findStub = sandbox.stub();
      findStub.resolves(returnedVerificationTokenIds);
      sandbox.replace(VerificationTokenModel, 'find', findStub);

      assert.isTrue(
        await VerificationTokenModel.allVerificationTokenIdsExist(
          verificationTokenIds
        )
      );
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const verificationTokenIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedVerificationTokenIds = [
        {
          _id: verificationTokenIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedVerificationTokenIds);
      sandbox.replace(VerificationTokenModel, 'find', findStub);
      let errored = false;
      try {
        await VerificationTokenModel.allVerificationTokenIdsExist(
          verificationTokenIds
        );
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          verificationTokenIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const verificationTokenIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(VerificationTokenModel, 'find', findStub);
      let errored = false;
      try {
        await VerificationTokenModel.allVerificationTokenIdsExist(
          verificationTokenIds
        );
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
        await VerificationTokenModel.validateUpdateObject(
          mocks.MOCK_VERIFICATIONTOKEN as unknown as Omit<
            Partial<databaseTypes.IVerificationToken>,
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
        await VerificationTokenModel.validateUpdateObject(
          mocks.MOCK_VERIFICATIONTOKEN as unknown as Omit<
            Partial<databaseTypes.IVerificationToken>,
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
        await VerificationTokenModel.validateUpdateObject({
          ...mocks.MOCK_VERIFICATIONTOKEN,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IVerificationToken>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      let errored = false;

      try {
        await VerificationTokenModel.validateUpdateObject({
          ...mocks.MOCK_VERIFICATIONTOKEN,
          createdAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IVerificationToken>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      let errored = false;

      try {
        await VerificationTokenModel.validateUpdateObject({
          ...mocks.MOCK_VERIFICATIONTOKEN,
          updatedAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IVerificationToken>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createVerificationToken', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a verificationToken document', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        VerificationTokenModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(
        VerificationTokenModel,
        'validate',
        sandbox.stub().resolves(true)
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(VerificationTokenModel, 'getVerificationTokenById', stub);

      const verificationTokenDocument =
        await VerificationTokenModel.createVerificationToken(
          mocks.MOCK_VERIFICATIONTOKEN
        );

      assert.strictEqual(verificationTokenDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        VerificationTokenModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        VerificationTokenModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(VerificationTokenModel, 'getVerificationTokenById', stub);
      let hasError = false;
      try {
        await VerificationTokenModel.createVerificationToken(
          mocks.MOCK_VERIFICATIONTOKEN
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        VerificationTokenModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        VerificationTokenModel,
        'create',
        sandbox.stub().resolves([{}])
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(VerificationTokenModel, 'getVerificationTokenById', stub);

      let hasError = false;
      try {
        await VerificationTokenModel.createVerificationToken(
          mocks.MOCK_VERIFICATIONTOKEN
        );
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        VerificationTokenModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        VerificationTokenModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(VerificationTokenModel, 'getVerificationTokenById', stub);
      let hasError = false;
      try {
        await VerificationTokenModel.createVerificationToken(
          mocks.MOCK_VERIFICATIONTOKEN
        );
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getVerificationTokenById', () => {
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

    it('will retreive a verificationToken document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_VERIFICATIONTOKEN));
      sandbox.replace(VerificationTokenModel, 'findById', findByIdStub);

      const doc = await VerificationTokenModel.getVerificationTokenById(
        mocks.MOCK_VERIFICATIONTOKEN._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_VERIFICATIONTOKEN._id);
    });

    it('will throw a DataNotFoundError when the verificationToken does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(VerificationTokenModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await VerificationTokenModel.getVerificationTokenById(
          mocks.MOCK_VERIFICATIONTOKEN._id as mongoose.Types.ObjectId
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
      sandbox.replace(VerificationTokenModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await VerificationTokenModel.getVerificationTokenById(
          mocks.MOCK_VERIFICATIONTOKEN._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryVerificationTokens', () => {
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

    const mockVerificationTokens = [
      {
        ...mocks.MOCK_VERIFICATIONTOKEN,
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IVerificationToken,
      {
        ...mocks.MOCK_VERIFICATIONTOKEN,
        _id: new mongoose.Types.ObjectId(),
      } as databaseTypes.IVerificationToken,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered verificationTokens', async () => {
      sandbox.replace(
        VerificationTokenModel,
        'count',
        sandbox.stub().resolves(mockVerificationTokens.length)
      );

      sandbox.replace(
        VerificationTokenModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockVerificationTokens))
      );

      const results = await VerificationTokenModel.queryVerificationTokens({});

      assert.strictEqual(results.numberOfItems, mockVerificationTokens.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockVerificationTokens.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(
        VerificationTokenModel,
        'count',
        sandbox.stub().resolves(0)
      );

      sandbox.replace(
        VerificationTokenModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockVerificationTokens))
      );

      let errored = false;
      try {
        await VerificationTokenModel.queryVerificationTokens();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        VerificationTokenModel,
        'count',
        sandbox.stub().resolves(mockVerificationTokens.length)
      );

      sandbox.replace(
        VerificationTokenModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockVerificationTokens))
      );

      let errored = false;
      try {
        await VerificationTokenModel.queryVerificationTokens({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        VerificationTokenModel,
        'count',
        sandbox.stub().resolves(mockVerificationTokens.length)
      );

      sandbox.replace(
        VerificationTokenModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await VerificationTokenModel.queryVerificationTokens({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateVerificationTokenById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a verificationToken', async () => {
      const updateVerificationToken = {
        ...mocks.MOCK_VERIFICATIONTOKEN,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IVerificationToken;

      const verificationTokenId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(VerificationTokenModel, 'updateOne', updateStub);

      const getVerificationTokenStub = sandbox.stub();
      getVerificationTokenStub.resolves({_id: verificationTokenId});
      sandbox.replace(
        VerificationTokenModel,
        'getVerificationTokenById',
        getVerificationTokenStub
      );

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(
        VerificationTokenModel,
        'validateUpdateObject',
        validateStub
      );

      const result = await VerificationTokenModel.updateVerificationTokenById(
        verificationTokenId,
        updateVerificationToken
      );

      assert.strictEqual(result._id, verificationTokenId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getVerificationTokenStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a verificationToken with references as ObjectIds', async () => {
      const updateVerificationToken = {
        ...mocks.MOCK_VERIFICATIONTOKEN,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IVerificationToken;

      const verificationTokenId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(VerificationTokenModel, 'updateOne', updateStub);

      const getVerificationTokenStub = sandbox.stub();
      getVerificationTokenStub.resolves({_id: verificationTokenId});
      sandbox.replace(
        VerificationTokenModel,
        'getVerificationTokenById',
        getVerificationTokenStub
      );

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(
        VerificationTokenModel,
        'validateUpdateObject',
        validateStub
      );

      const result = await VerificationTokenModel.updateVerificationTokenById(
        verificationTokenId,
        updateVerificationToken
      );

      assert.strictEqual(result._id, verificationTokenId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getVerificationTokenStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the verificationToken does not exist', async () => {
      const updateVerificationToken = {
        ...mocks.MOCK_VERIFICATIONTOKEN,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IVerificationToken;

      const verificationTokenId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(VerificationTokenModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(
        VerificationTokenModel,
        'validateUpdateObject',
        validateStub
      );

      const getVerificationTokenStub = sandbox.stub();
      getVerificationTokenStub.resolves({_id: verificationTokenId});
      sandbox.replace(
        VerificationTokenModel,
        'getVerificationTokenById',
        getVerificationTokenStub
      );

      let errorred = false;
      try {
        await VerificationTokenModel.updateVerificationTokenById(
          verificationTokenId,
          updateVerificationToken
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateVerificationToken = {
        ...mocks.MOCK_VERIFICATIONTOKEN,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IVerificationToken;

      const verificationTokenId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(VerificationTokenModel, 'updateOne', updateStub);

      const getVerificationTokenStub = sandbox.stub();
      getVerificationTokenStub.resolves({_id: verificationTokenId});
      sandbox.replace(
        VerificationTokenModel,
        'getVerificationTokenById',
        getVerificationTokenStub
      );

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(
        VerificationTokenModel,
        'validateUpdateObject',
        validateStub
      );
      let errorred = false;
      try {
        await VerificationTokenModel.updateVerificationTokenById(
          verificationTokenId,
          updateVerificationToken
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateVerificationToken = {
        ...mocks.MOCK_VERIFICATIONTOKEN,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IVerificationToken;

      const verificationTokenId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(VerificationTokenModel, 'updateOne', updateStub);

      const getVerificationTokenStub = sandbox.stub();
      getVerificationTokenStub.resolves({_id: verificationTokenId});
      sandbox.replace(
        VerificationTokenModel,
        'getVerificationTokenById',
        getVerificationTokenStub
      );

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(
        VerificationTokenModel,
        'validateUpdateObject',
        validateStub
      );

      let errorred = false;
      try {
        await VerificationTokenModel.updateVerificationTokenById(
          verificationTokenId,
          updateVerificationToken
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a verificationToken document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a verificationToken', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(VerificationTokenModel, 'deleteOne', deleteStub);

      const verificationTokenId = new mongoose.Types.ObjectId();

      await VerificationTokenModel.deleteVerificationTokenById(
        verificationTokenId
      );

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the verificationToken does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(VerificationTokenModel, 'deleteOne', deleteStub);

      const verificationTokenId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await VerificationTokenModel.deleteVerificationTokenById(
          verificationTokenId
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(VerificationTokenModel, 'deleteOne', deleteStub);

      const verificationTokenId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await VerificationTokenModel.deleteVerificationTokenById(
          verificationTokenId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});

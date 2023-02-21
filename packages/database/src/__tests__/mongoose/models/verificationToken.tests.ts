import {assert} from 'chai';
import {VerificationTokenModel} from '../../../mongoose/models/verificationToken';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const MOCK_VERIFICATION_TOKEN: databaseTypes.IVerificationToken = {
  identifier: 'verificationToken identifier',
  token: 'verificationToken token',
  expires: new Date(),
};

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

  context('createVerificationToken', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create an verificationToken document', async () => {
      const verificationTokenId = new mongoose.Types.ObjectId();
      sandbox.replace(
        VerificationTokenModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        VerificationTokenModel,
        'create',
        sandbox.stub().resolves([{_id: verificationTokenId}])
      );

      const getVerificationTokenByIdStub = sandbox.stub();
      getVerificationTokenByIdStub.resolves({_id: verificationTokenId});

      sandbox.replace(
        VerificationTokenModel,
        'getVerificationTokenById',
        getVerificationTokenByIdStub
      );

      const result = await VerificationTokenModel.createVerificationToken(
        MOCK_VERIFICATION_TOKEN
      );
      assert.strictEqual(result._id, verificationTokenId);
      assert.isTrue(getVerificationTokenByIdStub.calledOnce);
    });

    it('will throw an DataValidationError if the verificationToken cannot be validated.', async () => {
      const verificationTokenId = new mongoose.Types.ObjectId();
      sandbox.replace(
        VerificationTokenModel,
        'validate',
        sandbox.stub().rejects('Invalid')
      );
      sandbox.replace(
        VerificationTokenModel,
        'create',
        sandbox.stub().resolves([{_id: verificationTokenId}])
      );

      const getVerificationTokenByIdStub = sandbox.stub();
      getVerificationTokenByIdStub.resolves({_id: verificationTokenId});

      sandbox.replace(
        VerificationTokenModel,
        'getVerificationTokenById',
        getVerificationTokenByIdStub
      );
      let errorred = false;

      try {
        await VerificationTokenModel.createVerificationToken(
          MOCK_VERIFICATION_TOKEN
        );
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DatabaseOperationError if the underlying database connection throws an error.', async () => {
      const verificationTokenId = new mongoose.Types.ObjectId();
      sandbox.replace(
        VerificationTokenModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        VerificationTokenModel,
        'create',
        sandbox.stub().rejects('oops')
      );

      const getVerificationTokenByIdStub = sandbox.stub();
      getVerificationTokenByIdStub.resolves({_id: verificationTokenId});

      sandbox.replace(
        VerificationTokenModel,
        'getVerificationTokenById',
        getVerificationTokenByIdStub
      );
      let errorred = false;

      try {
        await VerificationTokenModel.createVerificationToken(
          MOCK_VERIFICATION_TOKEN
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('updateVerificationTokenById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should update an existing verificationToken', async () => {
      const updateVerificationToken = {
        identifier: 'identifier',
      };

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

      const result = await VerificationTokenModel.updateVerificationTokenById(
        verificationTokenId,
        updateVerificationToken
      );

      assert.strictEqual(result._id, verificationTokenId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getVerificationTokenStub.calledOnce);
    });

    it('will fail when the verificationToken does not exist', async () => {
      const updateVerificationToken = {
        identifier: 'identifier updated',
      };

      const verificationTokenId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(VerificationTokenModel, 'updateOne', updateStub);

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

    it('will fail with an InvalidOperationError when the validateUpdateObject method fails', async () => {
      const updateVerificationToken = {
        identifier: 'identifier',
      };

      const verificationTokenId = new mongoose.Types.ObjectId();

      sandbox.replace(
        VerificationTokenModel,
        'validateUpdateObject',
        sandbox
          .stub()
          .rejects(new error.InvalidOperationError('you cant do that', {}))
      );

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

    it('will fail with a DatabaseOperationError when the underlying database connection errors', async () => {
      const updateVerificationToken = {
        identifier: 'indentifier',
      };

      const verificationTokenId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something really bad has happened');
      sandbox.replace(VerificationTokenModel, 'updateOne', updateStub);

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

    it('will throw an InvalidOperationError when we attempt to supply an _id', async () => {
      const inputVerificationToken = {
        _id: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.IVerificationToken;

      let errorred = false;
      try {
        await VerificationTokenModel.validateUpdateObject(
          inputVerificationToken
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('delete a verificationToken document', () => {
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

    const mockVerificationToken: databaseTypes.IVerificationToken = {
      _id: new mongoose.Types.ObjectId(),
      identifier: 'test verificationToken token',
      token: 'tokenunique',
      expires: new Date(),
      __v: 1,
    } as databaseTypes.IVerificationToken;
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a verificationToken document', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockVerificationToken));
      sandbox.replace(VerificationTokenModel, 'findById', findByIdStub);

      const doc = await VerificationTokenModel.getVerificationTokenById(
        mockVerificationToken._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);

      assert.strictEqual(doc._id, mockVerificationToken._id);
    });

    it('will throw a DataNotFoundError when the verificationToken does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(VerificationTokenModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await VerificationTokenModel.getVerificationTokenById(
          mockVerificationToken._id as mongoose.Types.ObjectId
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
          mockVerificationToken._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});

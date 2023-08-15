// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {SessionModel} from '../../../mongoose/models/session';
import * as mocks from '../../../mongoose/mocks';
import {UserModel} from '../../../mongoose/models/user';
import {IQueryResult} from '@glyphx/types';
import {databaseTypes} from '../../../../../../database';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/session', () => {
  context('sessionIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the sessionId exists', async () => {
      const sessionId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: sessionId});
      sandbox.replace(SessionModel, 'findById', findByIdStub);

      const result = await SessionModel.sessionIdExists(sessionId);

      assert.isTrue(result);
    });

    it('should return false if the sessionId does not exist', async () => {
      const sessionId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(SessionModel, 'findById', findByIdStub);

      const result = await SessionModel.sessionIdExists(sessionId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const sessionId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(SessionModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await SessionModel.sessionIdExists(sessionId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allSessionIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the session ids exist', async () => {
      const sessionIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedSessionIds = sessionIds.map(sessionId => {
        return {
          _id: sessionId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedSessionIds);
      sandbox.replace(SessionModel, 'find', findStub);

      assert.isTrue(await SessionModel.allSessionIdsExist(sessionIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const sessionIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedSessionIds = [
        {
          _id: sessionIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedSessionIds);
      sandbox.replace(SessionModel, 'find', findStub);
      let errored = false;
      try {
        await SessionModel.allSessionIdsExist(sessionIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          sessionIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const sessionIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(SessionModel, 'find', findStub);
      let errored = false;
      try {
        await SessionModel.allSessionIdsExist(sessionIds);
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
      sandbox.replace(UserModel, 'userIdExists', userStub);

      let errored = false;

      try {
        await SessionModel.validateUpdateObject(
          mocks.MOCK_SESSION as unknown as Omit<
            Partial<databaseTypes.ISession>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userStub);

      let errored = false;

      try {
        await SessionModel.validateUpdateObject(
          mocks.MOCK_SESSION as unknown as Omit<
            Partial<databaseTypes.ISession>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(userStub.calledOnce);
    });

    it('will fail when the user does not exist.', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userStub);

      let errored = false;

      try {
        await SessionModel.validateUpdateObject(
          mocks.MOCK_SESSION as unknown as Omit<
            Partial<databaseTypes.ISession>,
            '_id'
          >
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the _id', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userStub);

      let errored = false;

      try {
        await SessionModel.validateUpdateObject({
          ...mocks.MOCK_SESSION,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.ISession>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userStub);

      let errored = false;

      try {
        await SessionModel.validateUpdateObject({
          ...mocks.MOCK_SESSION,
          createdAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.ISession>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const userStub = sandbox.stub();
      userStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userStub);

      let errored = false;

      try {
        await SessionModel.validateUpdateObject({
          ...mocks.MOCK_SESSION,
          updatedAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.ISession>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createSession', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a session document', async () => {
      sandbox.replace(
        SessionModel,
        'validateUser',
        sandbox.stub().resolves(mocks.MOCK_SESSION.user)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        SessionModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(SessionModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(SessionModel, 'getSessionById', stub);

      const sessionDocument = await SessionModel.createSession(
        mocks.MOCK_SESSION
      );

      assert.strictEqual(sessionDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when the user validator throws one', async () => {
      sandbox.replace(
        SessionModel,
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
        SessionModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(SessionModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(SessionModel, 'getSessionById', stub);

      let errored = false;

      try {
        await SessionModel.createSession(mocks.MOCK_SESSION);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        SessionModel,
        'validateUser',
        sandbox.stub().resolves(mocks.MOCK_SESSION.user)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(SessionModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        SessionModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(SessionModel, 'getSessionById', stub);
      let hasError = false;
      try {
        await SessionModel.createSession(mocks.MOCK_SESSION);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        SessionModel,
        'validateUser',
        sandbox.stub().resolves(mocks.MOCK_SESSION.user)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(SessionModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(SessionModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(SessionModel, 'getSessionById', stub);

      let hasError = false;
      try {
        await SessionModel.createSession(mocks.MOCK_SESSION);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        SessionModel,
        'validateUser',
        sandbox.stub().resolves(mocks.MOCK_SESSION.user)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        SessionModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        SessionModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(SessionModel, 'getSessionById', stub);
      let hasError = false;
      try {
        await SessionModel.createSession(mocks.MOCK_SESSION);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getSessionById', () => {
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

    it('will retreive a session document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_SESSION));
      sandbox.replace(SessionModel, 'findById', findByIdStub);

      const doc = await SessionModel.getSessionById(
        mocks.MOCK_SESSION._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.user as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_SESSION._id);
    });

    it('will throw a DataNotFoundError when the session does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(SessionModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await SessionModel.getSessionById(
          mocks.MOCK_SESSION._id as mongoose.Types.ObjectId
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
      sandbox.replace(SessionModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await SessionModel.getSessionById(
          mocks.MOCK_SESSION._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('querySessions', () => {
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

    const mockSessions = [
      {
        ...mocks.MOCK_SESSION,
        _id: new mongoose.Types.ObjectId(),
        user: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as databaseTypes.ISession,
      {
        ...mocks.MOCK_SESSION,
        _id: new mongoose.Types.ObjectId(),
        user: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as databaseTypes.ISession,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered sessions', async () => {
      sandbox.replace(
        SessionModel,
        'count',
        sandbox.stub().resolves(mockSessions.length)
      );

      sandbox.replace(
        SessionModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockSessions))
      );

      const results = await SessionModel.querySessions({});

      assert.strictEqual(results.numberOfItems, mockSessions.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockSessions.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.user as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(SessionModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        SessionModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockSessions))
      );

      let errored = false;
      try {
        await SessionModel.querySessions();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        SessionModel,
        'count',
        sandbox.stub().resolves(mockSessions.length)
      );

      sandbox.replace(
        SessionModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockSessions))
      );

      let errored = false;
      try {
        await SessionModel.querySessions({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        SessionModel,
        'count',
        sandbox.stub().resolves(mockSessions.length)
      );

      sandbox.replace(
        SessionModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await SessionModel.querySessions({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateSessionById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a session', async () => {
      const updateSession = {
        ...mocks.MOCK_SESSION,
        deletedAt: new Date(),
        user: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ISession;

      const sessionId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(SessionModel, 'updateOne', updateStub);

      const getSessionStub = sandbox.stub();
      getSessionStub.resolves({_id: sessionId});
      sandbox.replace(SessionModel, 'getSessionById', getSessionStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(SessionModel, 'validateUpdateObject', validateStub);

      const result = await SessionModel.updateSessionById(
        sessionId,
        updateSession
      );

      assert.strictEqual(result._id, sessionId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getSessionStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a session with references as ObjectIds', async () => {
      const updateSession = {
        ...mocks.MOCK_SESSION,
        deletedAt: new Date(),
      } as unknown as databaseTypes.ISession;

      const sessionId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(SessionModel, 'updateOne', updateStub);

      const getSessionStub = sandbox.stub();
      getSessionStub.resolves({_id: sessionId});
      sandbox.replace(SessionModel, 'getSessionById', getSessionStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(SessionModel, 'validateUpdateObject', validateStub);

      const result = await SessionModel.updateSessionById(
        sessionId,
        updateSession
      );

      assert.strictEqual(result._id, sessionId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getSessionStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the session does not exist', async () => {
      const updateSession = {
        ...mocks.MOCK_SESSION,
        deletedAt: new Date(),
      } as unknown as databaseTypes.ISession;

      const sessionId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(SessionModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(SessionModel, 'validateUpdateObject', validateStub);

      const getSessionStub = sandbox.stub();
      getSessionStub.resolves({_id: sessionId});
      sandbox.replace(SessionModel, 'getSessionById', getSessionStub);

      let errorred = false;
      try {
        await SessionModel.updateSessionById(sessionId, updateSession);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateSession = {
        ...mocks.MOCK_SESSION,
        deletedAt: new Date(),
      } as unknown as databaseTypes.ISession;

      const sessionId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(SessionModel, 'updateOne', updateStub);

      const getSessionStub = sandbox.stub();
      getSessionStub.resolves({_id: sessionId});
      sandbox.replace(SessionModel, 'getSessionById', getSessionStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(SessionModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await SessionModel.updateSessionById(sessionId, updateSession);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateSession = {
        ...mocks.MOCK_SESSION,
        deletedAt: new Date(),
      } as unknown as databaseTypes.ISession;

      const sessionId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(SessionModel, 'updateOne', updateStub);

      const getSessionStub = sandbox.stub();
      getSessionStub.resolves({_id: sessionId});
      sandbox.replace(SessionModel, 'getSessionById', getSessionStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(SessionModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await SessionModel.updateSessionById(sessionId, updateSession);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a session document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a session', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(SessionModel, 'deleteOne', deleteStub);

      const sessionId = new mongoose.Types.ObjectId();

      await SessionModel.deleteSessionById(sessionId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the session does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(SessionModel, 'deleteOne', deleteStub);

      const sessionId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await SessionModel.deleteSessionById(sessionId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(SessionModel, 'deleteOne', deleteStub);

      const sessionId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await SessionModel.deleteSessionById(sessionId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});

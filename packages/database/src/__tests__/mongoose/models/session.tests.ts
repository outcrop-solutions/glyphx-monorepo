import {assert} from 'chai';
import {SessionModel} from '../../..//mongoose/models/session';
import {UserModel} from '../../..//mongoose/models/user';
import {databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const MOCK_SESSION: databaseTypes.ISession = {
  sessionToken: 'session token',
  expires: new Date(),
  user: {_id: new mongoose.Types.ObjectId()} as databaseTypes.IUser,
};

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

  context('createSession', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create an session document', async () => {
      const sessionId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(SessionModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(SessionModel, 'create', sandbox.stub().resolves([{_id: sessionId}]));

      const getSessionByIdStub = sandbox.stub();
      getSessionByIdStub.resolves({_id: sessionId});

      sandbox.replace(SessionModel, 'getSessionById', getSessionByIdStub);

      const result = await SessionModel.createSession(MOCK_SESSION);
      assert.strictEqual(result._id, sessionId);
      assert.isTrue(getSessionByIdStub.calledOnce);
    });

    it('will throw an InvalidArgumentError if the user attached to the session does not exist.', async () => {
      const sessionId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(false));
      sandbox.replace(SessionModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(SessionModel, 'create', sandbox.stub().resolves([{_id: sessionId}]));

      const getSessionByIdStub = sandbox.stub();
      getSessionByIdStub.resolves({_id: sessionId});

      sandbox.replace(SessionModel, 'getSessionById', getSessionByIdStub);
      let errorred = false;

      try {
        await SessionModel.createSession(MOCK_SESSION);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DataValidationError if the session cannot be validated.', async () => {
      const sessionId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(SessionModel, 'validate', sandbox.stub().rejects('Invalid'));
      sandbox.replace(SessionModel, 'create', sandbox.stub().resolves([{_id: sessionId}]));

      const getSessionByIdStub = sandbox.stub();
      getSessionByIdStub.resolves({_id: sessionId});

      sandbox.replace(SessionModel, 'getSessionById', getSessionByIdStub);
      let errorred = false;

      try {
        await SessionModel.createSession(MOCK_SESSION);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DatabaseOperationError if the underlying database connection throws an error.', async () => {
      const sessionId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(SessionModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(SessionModel, 'create', sandbox.stub().rejects('oops'));

      const getSessionByIdStub = sandbox.stub();
      getSessionByIdStub.resolves({_id: sessionId});

      sandbox.replace(SessionModel, 'getSessionById', getSessionByIdStub);
      let errorred = false;

      try {
        await SessionModel.createSession(MOCK_SESSION);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('updateSessionById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should update an existing session', async () => {
      const updateSession = {
        sessionToken: 'sessionToken',
      };

      const sessionId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(SessionModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      const getSessionStub = sandbox.stub();
      getSessionStub.resolves({_id: sessionId});
      sandbox.replace(SessionModel, 'getSessionById', getSessionStub);

      const result = await SessionModel.updateSessionById(sessionId.toString(), updateSession);

      assert.strictEqual(result._id, sessionId);
      assert.isTrue(updateStub.calledOnce);
      assert.isFalse(getUserStub.called);
      assert.isTrue(getSessionStub.calledOnce);
    });

    it('should update an existing session changing the user', async () => {
      const updateSession = {
        sessionToken: 'sessionToken',
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };

      const sessionId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(SessionModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      const getSessionStub = sandbox.stub();
      getSessionStub.resolves({_id: sessionId});
      sandbox.replace(SessionModel, 'getSessionById', getSessionStub);

      const result = await SessionModel.updateSessionById(sessionId.toString(), updateSession);

      assert.strictEqual(result._id, sessionId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.calledOnce);
      assert.isTrue(getSessionStub.calledOnce);
    });

    it('will fail when the session does not exist', async () => {
      const updateSession = {
        sessionToken: 'sessionToken',
      };

      const sessionId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(SessionModel, 'updateOne', updateStub);

      const getSessionStub = sandbox.stub();
      getSessionStub.resolves({_id: sessionId});
      sandbox.replace(SessionModel, 'getSessionById', getSessionStub);
      let errorred = false;
      try {
        await SessionModel.updateSessionById(sessionId.toString(), updateSession);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will fail with an InvalidOperationError when the validateUpdateObject method fails', async () => {
      const updateSession = {
        sessionToken: 'sessionToken',
      };

      const sessionId = new mongoose.Types.ObjectId();

      sandbox.replace(
        SessionModel,
        'validateUpdateObject',
        sandbox.stub().rejects(new error.InvalidOperationError('you cant do that', {}))
      );

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(SessionModel, 'updateOne', updateStub);

      const getSessionStub = sandbox.stub();
      getSessionStub.resolves({_id: sessionId});
      sandbox.replace(SessionModel, 'getSessionById', getSessionStub);
      let errorred = false;
      try {
        await SessionModel.updateSessionById(sessionId.toString(), updateSession);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will fail with a DatabaseOperationError when the underlying database connection errors', async () => {
      const updateSession = {
        sessionToken: 'sessionToken',
      };

      const sessionId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something really bad has happened');
      sandbox.replace(SessionModel, 'updateOne', updateStub);

      const getSessionStub = sandbox.stub();
      getSessionStub.resolves({_id: sessionId});
      sandbox.replace(SessionModel, 'getSessionById', getSessionStub);
      let errorred = false;
      try {
        await SessionModel.updateSessionById(sessionId.toString(), updateSession);
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
      const inputSession = {
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);

      await SessionModel.validateUpdateObject(inputSession);
      assert.isTrue(userExistsStub.calledOnce);
    });

    it('will throw an InvalidOperationError when the user does not exist', async () => {
      const inputSession = {
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);
      let errorred = false;
      try {
        await SessionModel.validateUpdateObject(inputSession);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(userExistsStub.calledOnce);
    });

    it('will throw an InvalidOperationError when we attempt to supply an _id', async () => {
      const inputSession = {
        _id: new mongoose.Types.ObjectId(),
        user: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ISession;
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);
      let errorred = false;
      try {
        await SessionModel.validateUpdateObject(inputSession);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(userExistsStub.calledOnce);
    });
  });

  context('delete a session document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a session', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(SessionModel, 'deleteOne', deleteStub);

      const sessionId = new mongoose.Types.ObjectId();

      await SessionModel.deleteSessionById(sessionId.toString());

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the session does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(SessionModel, 'deleteOne', deleteStub);

      const sessionId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await SessionModel.deleteSessionById(sessionId.toString());
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
        await SessionModel.deleteSessionById(sessionId.toString());
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
      const sessionIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedSessionIds = sessionIds.map((sessionId) => {
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
      const sessionIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

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
        assert.strictEqual((err as any).data.value[0].toString(), sessionIds[1].toString());
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const sessionIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

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

    const mockSession: databaseTypes.ISession = {
      _id: new mongoose.Types.ObjectId(),
      sessionToken: 'test session token',
      expires: new Date(),
      __v: 1,
      user: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test user',
        __v: 1,
      } as unknown as databaseTypes.IUser,
    } as databaseTypes.ISession;
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a session document with the user populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockSession));
      sandbox.replace(SessionModel, 'findById', findByIdStub);

      const doc = await SessionModel.getSessionById(mockSession._id!.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.user as any).__v);

      assert.strictEqual(doc.id, mockSession._id?.toString());
    });

    it('will throw a DataNotFoundError when the session does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(SessionModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await SessionModel.getSessionById(mockSession._id!.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(SessionModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await SessionModel.getSessionById(mockSession._id!.toString());
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
        _id: new mongoose.Types.ObjectId(),
        sessionToken: 'test session token',
        expires: new Date(),
        __v: 1,
        user: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test user',
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as databaseTypes.ISession,
      {
        _id: new mongoose.Types.ObjectId(),
        sessionToken: 'test session token2',
        expires: new Date(),
        __v: 1,
        user: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test user2',
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as databaseTypes.ISession,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered Sessions', async () => {
      sandbox.replace(SessionModel, 'count', sandbox.stub().resolves(mockSessions.length));

      sandbox.replace(SessionModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockSessions)));

      const results = await SessionModel.querySessions({});

      assert.strictEqual(results.numberOfItems, mockSessions.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockSessions.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any).__v);
        assert.isUndefined((doc.user as any).__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(SessionModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(SessionModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockSessions)));

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
      sandbox.replace(SessionModel, 'count', sandbox.stub().resolves(mockSessions.length));

      sandbox.replace(SessionModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockSessions)));

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
      sandbox.replace(SessionModel, 'count', sandbox.stub().resolves(mockSessions.length));

      sandbox.replace(
        SessionModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
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
});

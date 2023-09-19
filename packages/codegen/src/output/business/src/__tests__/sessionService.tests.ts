// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import { sessionService} from '../services';
import * as mocks from 'database/src/mongoose/mocks'

describe('#services/session', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createSession', () => {
    it('will create a Session', async () => {
      const sessionId = new mongooseTypes.ObjectId();
      const createdAtId = new mongooseTypes.ObjectId();
      const userId = new mongooseTypes.ObjectId();

      // createSession
      const createSessionFromModelStub = sandbox.stub();
      createSessionFromModelStub.resolves({
         ...mocks.MOCK_SESSION,
        _id: new mongooseTypes.ObjectId(),
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ISession);

      sandbox.replace(
        dbConnection.models.SessionModel,
        'createSession',
        createSessionFromModelStub
      );

      const doc = await sessionService.createSession(
       {
         ...mocks.MOCK_SESSION,
        _id: new mongooseTypes.ObjectId(),
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ISession
      );

      assert.isTrue(createSessionFromModelStub.calledOnce);
    });
    // session model fails
    it('will publish and rethrow an InvalidArgumentError when session model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createSession
      const createSessionFromModelStub = sandbox.stub();
      createSessionFromModelStub.rejects(err)

      sandbox.replace(
        dbConnection.models.SessionModel,
        'createSession',
        createSessionFromModelStub
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
        await sessionService.createSession(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createSessionFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when session model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createSession
      const createSessionFromModelStub = sandbox.stub();
      createSessionFromModelStub.rejects(err);

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
        await sessionService.createSession(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createSessionFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when session model throws it', async () => {
      const createSessionFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createSessionFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.SessionModel,
        'createSession',
        createSessionFromModelStub
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
        await sessionService.createSession(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createSessionFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when session model throws a DataOperationError', async () => {
      const createSessionFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createSessionFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.SessionModel,
        'createSession',
        createSessionFromModelStub
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
        await sessionService.createSession(
         {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createSessionFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when session model throws a UnexpectedError', async () => {
      const createSessionFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(
        errMessage,
        'mongodDb',
      );

      createSessionFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.SessionModel,
        'createSession',
        createSessionFromModelStub
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
        await sessionService.createSession(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createSessionFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getSession', () => {
    it('should get a session by id', async () => {
      const sessionId = new mongooseTypes.ObjectId();

      const getSessionFromModelStub = sandbox.stub();
      getSessionFromModelStub.resolves({
        _id: sessionId,
      } as unknown as databaseTypes.ISession);
      sandbox.replace(
        dbConnection.models.SessionModel,
        'getSessionById',
        getSessionFromModelStub
      );

      const session = await sessionService.getSession(sessionId);
      assert.isOk(session);
      assert.strictEqual(session?._id?.toString(), sessionId.toString());

      assert.isTrue(getSessionFromModelStub.calledOnce);
    });
    it('should get a session by id when id is a string', async () => {
      const sessionId = new mongooseTypes.ObjectId();

      const getSessionFromModelStub = sandbox.stub();
      getSessionFromModelStub.resolves({
        _id: sessionId,
      } as unknown as databaseTypes.ISession);
      sandbox.replace(
        dbConnection.models.SessionModel,
        'getSessionById',
        getSessionFromModelStub
      );

      const session = await sessionService.getSession(sessionId.toString());
      assert.isOk(session);
      assert.strictEqual(session?._id?.toString(), sessionId.toString());

      assert.isTrue(getSessionFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the session cannot be found', async () => {
      const sessionId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'sessionId',
        sessionId
      );
      const getSessionFromModelStub = sandbox.stub();
      getSessionFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.SessionModel,
        'getSessionById',
        getSessionFromModelStub
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

      const session = await sessionService.getSession(sessionId);
      assert.notOk(session);

      assert.isTrue(getSessionFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const sessionId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getSessionById'
      );
      const getSessionFromModelStub = sandbox.stub();
      getSessionFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.SessionModel,
        'getSessionById',
        getSessionFromModelStub
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
        await sessionService.getSession(sessionId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getSessionFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getSessions', () => {
    it('should get sessions by filter', async () => {
      const sessionId = new mongooseTypes.ObjectId();
      const sessionId2 = new mongooseTypes.ObjectId();
      const sessionFilter = {_id: sessionId};

      const querySessionsFromModelStub = sandbox.stub();
      querySessionsFromModelStub.resolves({
        results: [
          {
         ...mocks.MOCK_SESSION,
        _id: sessionId,
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        } as unknown as databaseTypes.ISession,
        {
         ...mocks.MOCK_SESSION,
        _id: sessionId2,
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        } as unknown as databaseTypes.ISession
        ],
      } as unknown as databaseTypes.ISession[]);

      sandbox.replace(
        dbConnection.models.SessionModel,
        'querySessions',
        querySessionsFromModelStub
      );

      const sessions = await sessionService.getSessions(sessionFilter);
      assert.isOk(sessions![0]);
      assert.strictEqual(sessions![0]._id?.toString(), sessionId.toString());
      assert.isTrue(querySessionsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the sessions cannot be found', async () => {
      const sessionName = 'sessionName1';
      const sessionFilter = {name: sessionName};
      const errMessage = 'Cannot find the session';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        sessionFilter
      );
      const getSessionFromModelStub = sandbox.stub();
      getSessionFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.SessionModel,
        'querySessions',
        getSessionFromModelStub
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

      const session = await sessionService.getSessions(sessionFilter);
      assert.notOk(session);

      assert.isTrue(getSessionFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const sessionName = 'sessionName1';
      const sessionFilter = {name: sessionName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getSessionByEmail'
      );
      const getSessionFromModelStub = sandbox.stub();
      getSessionFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.SessionModel,
        'querySessions',
        getSessionFromModelStub
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
        await sessionService.getSessions(sessionFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getSessionFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateSession', () => {
    it('will update a session', async () => {
      const sessionId = new mongooseTypes.ObjectId();
      const updateSessionFromModelStub = sandbox.stub();
      updateSessionFromModelStub.resolves({
         ...mocks.MOCK_SESSION,
        _id: new mongooseTypes.ObjectId(),
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ISession);
      sandbox.replace(
        dbConnection.models.SessionModel,
        'updateSessionById',
        updateSessionFromModelStub
      );

      const session = await sessionService.updateSession(sessionId, {
        deletedAt: new Date(),
      });
      assert.isOk(session);
      assert.strictEqual(session._id, sessionId);
      assert.isOk(session.deletedAt);
      assert.isTrue(updateSessionFromModelStub.calledOnce);
    });
    it('will update a session when the id is a string', async () => {
     const sessionId = new mongooseTypes.ObjectId();
      const updateSessionFromModelStub = sandbox.stub();
      updateSessionFromModelStub.resolves({
         ...mocks.MOCK_SESSION,
        _id: new mongooseTypes.ObjectId(),
        user: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ISession);
      sandbox.replace(
        dbConnection.models.SessionModel,
        'updateSessionById',
        updateSessionFromModelStub
      );

      const session = await sessionService.updateSession(sessionId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(session);
      assert.strictEqual(session._id, sessionId);
      assert.isOk(session.deletedAt);
      assert.isTrue(updateSessionFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when session model throws it ', async () => {
      const sessionId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateSessionFromModelStub = sandbox.stub();
      updateSessionFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.SessionModel,
        'updateSessionById',
        updateSessionFromModelStub
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
        await sessionService.updateSession(sessionId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateSessionFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when session model throws it ', async () => {
      const sessionId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateSessionFromModelStub = sandbox.stub();
      updateSessionFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.SessionModel,
        'updateSessionById',
        updateSessionFromModelStub
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
        await sessionService.updateSession(sessionId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateSessionFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when session model throws a DataOperationError ', async () => {
      const sessionId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateSessionById'
      );
      const updateSessionFromModelStub = sandbox.stub();
      updateSessionFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.SessionModel,
        'updateSessionById',
        updateSessionFromModelStub
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
        await sessionService.updateSession(sessionId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateSessionFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});

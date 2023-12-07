// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import { userAgentService} from '../../services';
import * as mocks from 'database/src/mongoose/mocks'

describe('#services/userAgent', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createUserAgent', () => {
    it('will create a UserAgent', async () => {
      const userAgentId = new mongooseTypes.ObjectId();
      const idId = new mongooseTypes.ObjectId();

      // createUserAgent
      const createUserAgentFromModelStub = sandbox.stub();
      createUserAgentFromModelStub.resolves({
         ...mocks.MOCK_USERAGENT,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IUserAgent);

      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'createUserAgent',
        createUserAgentFromModelStub
      );

      const doc = await userAgentService.createUserAgent(
       {
         ...mocks.MOCK_USERAGENT,
        _id: new mongooseTypes.ObjectId(),
      } as unknown as databaseTypes.IUserAgent
      );

      assert.isTrue(createUserAgentFromModelStub.calledOnce);
    });
    // userAgent model fails
    it('will publish and rethrow an InvalidArgumentError when userAgent model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createUserAgent
      const createUserAgentFromModelStub = sandbox.stub();
      createUserAgentFromModelStub.rejects(err)

      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'createUserAgent',
        createUserAgentFromModelStub
      );


      function fakePublish() {
        
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
        await userAgentService.createUserAgent(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createUserAgentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when userAgent model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createUserAgent
      const createUserAgentFromModelStub = sandbox.stub();
      createUserAgentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'createUserAgent',
        createUserAgentFromModelStub
      );
      
      function fakePublish() {
        
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
        await userAgentService.createUserAgent(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createUserAgentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when userAgent model throws it', async () => {
      const createUserAgentFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createUserAgentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'createUserAgent',
        createUserAgentFromModelStub
      );

      function fakePublish() {
        
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
        await userAgentService.createUserAgent(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createUserAgentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when userAgent model throws a DataOperationError', async () => {
      const createUserAgentFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createUserAgentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'createUserAgent',
        createUserAgentFromModelStub
      );

      function fakePublish() {
        
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
        await userAgentService.createUserAgent(
         {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createUserAgentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when userAgent model throws a UnexpectedError', async () => {
      const createUserAgentFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(
        errMessage,
        'mongodDb',
      );

      createUserAgentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'createUserAgent',
        createUserAgentFromModelStub
      );

      function fakePublish() {
        
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
        await userAgentService.createUserAgent(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createUserAgentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getUserAgent', () => {
    it('should get a userAgent by id', async () => {
      const userAgentId = new mongooseTypes.ObjectId().toString();

      const getUserAgentFromModelStub = sandbox.stub();
      getUserAgentFromModelStub.resolves({
        _id: userAgentId,
      } as unknown as databaseTypes.IUserAgent);
      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'getUserAgentById',
        getUserAgentFromModelStub
      );

      const userAgent = await userAgentService.getUserAgent(userAgentId);
      assert.isOk(userAgent);
      assert.strictEqual(userAgent?._id?.toString(), userAgentId.toString());

      assert.isTrue(getUserAgentFromModelStub.calledOnce);
    });
    it('should get a userAgent by id when id is a string', async () => {
      const userAgentId = new mongooseTypes.ObjectId();

      const getUserAgentFromModelStub = sandbox.stub();
      getUserAgentFromModelStub.resolves({
        _id: userAgentId,
      } as unknown as databaseTypes.IUserAgent);
      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'getUserAgentById',
        getUserAgentFromModelStub
      );

      const userAgent = await userAgentService.getUserAgent(userAgentId.toString());
      assert.isOk(userAgent);
      assert.strictEqual(userAgent?._id?.toString(), userAgentId.toString());

      assert.isTrue(getUserAgentFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the userAgent cannot be found', async () => {
      const userAgentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'userAgentId',
        userAgentId
      );
      const getUserAgentFromModelStub = sandbox.stub();
      getUserAgentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'getUserAgentById',
        getUserAgentFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const userAgent = await userAgentService.getUserAgent(userAgentId);
      assert.notOk(userAgent);

      assert.isTrue(getUserAgentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const userAgentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getUserAgentById'
      );
      const getUserAgentFromModelStub = sandbox.stub();
      getUserAgentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'getUserAgentById',
        getUserAgentFromModelStub
      );
      function fakePublish() {
        
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
        await userAgentService.getUserAgent(userAgentId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getUserAgentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getUserAgents', () => {
    it('should get userAgents by filter', async () => {
      const userAgentId = new mongooseTypes.ObjectId();
      const userAgentId2 = new mongooseTypes.ObjectId();
      const userAgentFilter = {_id: userAgentId};

      const queryUserAgentsFromModelStub = sandbox.stub();
      queryUserAgentsFromModelStub.resolves({
        results: [
          {
         ...mocks.MOCK_USERAGENT,
        _id: userAgentId,
        } as unknown as databaseTypes.IUserAgent,
        {
         ...mocks.MOCK_USERAGENT,
        _id: userAgentId2,
        } as unknown as databaseTypes.IUserAgent
        ],
      } as unknown as databaseTypes.IUserAgent[]);

      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'queryUserAgents',
        queryUserAgentsFromModelStub
      );

      const userAgents = await userAgentService.getUserAgents(userAgentFilter);
      assert.isOk(userAgents![0]);
      assert.strictEqual(userAgents![0]._id?.toString(), userAgentId.toString());
      assert.isTrue(queryUserAgentsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the userAgents cannot be found', async () => {
      const userAgentName = 'userAgentName1';
      const userAgentFilter = {name: userAgentName};
      const errMessage = 'Cannot find the userAgent';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        userAgentFilter
      );
      const getUserAgentFromModelStub = sandbox.stub();
      getUserAgentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'queryUserAgents',
        getUserAgentFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const userAgent = await userAgentService.getUserAgents(userAgentFilter);
      assert.notOk(userAgent);

      assert.isTrue(getUserAgentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const userAgentName = 'userAgentName1';
      const userAgentFilter = {name: userAgentName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getUserAgentByEmail'
      );
      const getUserAgentFromModelStub = sandbox.stub();
      getUserAgentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'queryUserAgents',
        getUserAgentFromModelStub
      );
      function fakePublish() {
        
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
        await userAgentService.getUserAgents(userAgentFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getUserAgentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateUserAgent', () => {
    it('will update a userAgent', async () => {
      const userAgentId = new mongooseTypes.ObjectId().toString();
      const updateUserAgentFromModelStub = sandbox.stub();
      updateUserAgentFromModelStub.resolves({
         ...mocks.MOCK_USERAGENT,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
      } as unknown as databaseTypes.IUserAgent);
      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'updateUserAgentById',
        updateUserAgentFromModelStub
      );

      const userAgent = await userAgentService.updateUserAgent(userAgentId, {
        deletedAt: new Date(),
      });
      assert.isOk(userAgent);
      assert.strictEqual(userAgent.id, 'id');
      assert.isOk(userAgent.deletedAt);
      assert.isTrue(updateUserAgentFromModelStub.calledOnce);
    });
    it('will update a userAgent when the id is a string', async () => {
     const userAgentId = new mongooseTypes.ObjectId();
      const updateUserAgentFromModelStub = sandbox.stub();
      updateUserAgentFromModelStub.resolves({
         ...mocks.MOCK_USERAGENT,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
      } as unknown as databaseTypes.IUserAgent);
      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'updateUserAgentById',
        updateUserAgentFromModelStub
      );

      const userAgent = await userAgentService.updateUserAgent(userAgentId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(userAgent);
      assert.strictEqual(userAgent.id, 'id');
      assert.isOk(userAgent.deletedAt);
      assert.isTrue(updateUserAgentFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when userAgent model throws it', async () => {
      const userAgentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateUserAgentFromModelStub = sandbox.stub();
      updateUserAgentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'updateUserAgentById',
        updateUserAgentFromModelStub
      );

      function fakePublish() {
        
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
        await userAgentService.updateUserAgent(userAgentId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateUserAgentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when userAgent model throws it ', async () => {
      const userAgentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateUserAgentFromModelStub = sandbox.stub();
      updateUserAgentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'updateUserAgentById',
        updateUserAgentFromModelStub
      );

      function fakePublish() {
        
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
        await userAgentService.updateUserAgent(userAgentId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateUserAgentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when userAgent model throws a DataOperationError ', async () => {
      const userAgentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateUserAgentById'
      );
      const updateUserAgentFromModelStub = sandbox.stub();
      updateUserAgentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.UserAgentModel,
        'updateUserAgentById',
        updateUserAgentFromModelStub
      );

      function fakePublish() {
        
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
        await userAgentService.updateUserAgent(userAgentId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateUserAgentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});

// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import { presenceService} from '../../services';
import * as mocks from 'database/src/mongoose/mocks'

describe('#services/presence', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createPresence', () => {
    it('will create a Presence', async () => {
      const presenceId = new mongooseTypes.ObjectId();
      const idId = new mongooseTypes.ObjectId();
      const cursorId = new mongooseTypes.ObjectId();
      const cameraId = new mongooseTypes.ObjectId();
      const configId = new mongooseTypes.ObjectId();

      // createPresence
      const createPresenceFromModelStub = sandbox.stub();
      createPresenceFromModelStub.resolves({
         ...mocks.MOCK_PRESENCE,
        _id: new mongooseTypes.ObjectId(),
        config: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IModelConfig,
      } as unknown as databaseTypes.IPresence);

      sandbox.replace(
        dbConnection.models.PresenceModel,
        'createPresence',
        createPresenceFromModelStub
      );

      const doc = await presenceService.createPresence(
       {
         ...mocks.MOCK_PRESENCE,
        _id: new mongooseTypes.ObjectId(),
        config: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IModelConfig,
      } as unknown as databaseTypes.IPresence
      );

      assert.isTrue(createPresenceFromModelStub.calledOnce);
    });
    // presence model fails
    it('will publish and rethrow an InvalidArgumentError when presence model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createPresence
      const createPresenceFromModelStub = sandbox.stub();
      createPresenceFromModelStub.rejects(err)

      sandbox.replace(
        dbConnection.models.PresenceModel,
        'createPresence',
        createPresenceFromModelStub
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
        await presenceService.createPresence(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createPresenceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when presence model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createPresence
      const createPresenceFromModelStub = sandbox.stub();
      createPresenceFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.PresenceModel,
        'createPresence',
        createPresenceFromModelStub
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
        await presenceService.createPresence(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createPresenceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when presence model throws it', async () => {
      const createPresenceFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createPresenceFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.PresenceModel,
        'createPresence',
        createPresenceFromModelStub
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
        await presenceService.createPresence(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createPresenceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when presence model throws a DataOperationError', async () => {
      const createPresenceFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createPresenceFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.PresenceModel,
        'createPresence',
        createPresenceFromModelStub
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
        await presenceService.createPresence(
         {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createPresenceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when presence model throws a UnexpectedError', async () => {
      const createPresenceFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(
        errMessage,
        'mongodDb',
      );

      createPresenceFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.PresenceModel,
        'createPresence',
        createPresenceFromModelStub
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
        await presenceService.createPresence(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createPresenceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getPresence', () => {
    it('should get a presence by id', async () => {
      const presenceId = new mongooseTypes.ObjectId().toString();

      const getPresenceFromModelStub = sandbox.stub();
      getPresenceFromModelStub.resolves({
        _id: presenceId,
      } as unknown as databaseTypes.IPresence);
      sandbox.replace(
        dbConnection.models.PresenceModel,
        'getPresenceById',
        getPresenceFromModelStub
      );

      const presence = await presenceService.getPresence(presenceId);
      assert.isOk(presence);
      assert.strictEqual(presence?._id?.toString(), presenceId.toString());

      assert.isTrue(getPresenceFromModelStub.calledOnce);
    });
    it('should get a presence by id when id is a string', async () => {
      const presenceId = new mongooseTypes.ObjectId();

      const getPresenceFromModelStub = sandbox.stub();
      getPresenceFromModelStub.resolves({
        _id: presenceId,
      } as unknown as databaseTypes.IPresence);
      sandbox.replace(
        dbConnection.models.PresenceModel,
        'getPresenceById',
        getPresenceFromModelStub
      );

      const presence = await presenceService.getPresence(presenceId.toString());
      assert.isOk(presence);
      assert.strictEqual(presence?._id?.toString(), presenceId.toString());

      assert.isTrue(getPresenceFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the presence cannot be found', async () => {
      const presenceId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'presenceId',
        presenceId
      );
      const getPresenceFromModelStub = sandbox.stub();
      getPresenceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.PresenceModel,
        'getPresenceById',
        getPresenceFromModelStub
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

      const presence = await presenceService.getPresence(presenceId);
      assert.notOk(presence);

      assert.isTrue(getPresenceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const presenceId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getPresenceById'
      );
      const getPresenceFromModelStub = sandbox.stub();
      getPresenceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.PresenceModel,
        'getPresenceById',
        getPresenceFromModelStub
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
        await presenceService.getPresence(presenceId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getPresenceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getPresences', () => {
    it('should get presences by filter', async () => {
      const presenceId = new mongooseTypes.ObjectId();
      const presenceId2 = new mongooseTypes.ObjectId();
      const presenceFilter = {_id: presenceId};

      const queryPresencesFromModelStub = sandbox.stub();
      queryPresencesFromModelStub.resolves({
        results: [
          {
         ...mocks.MOCK_PRESENCE,
        _id: presenceId,
        config: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IModelConfig,
        } as unknown as databaseTypes.IPresence,
        {
         ...mocks.MOCK_PRESENCE,
        _id: presenceId2,
        config: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IModelConfig,
        } as unknown as databaseTypes.IPresence
        ],
      } as unknown as databaseTypes.IPresence[]);

      sandbox.replace(
        dbConnection.models.PresenceModel,
        'queryPresences',
        queryPresencesFromModelStub
      );

      const presences = await presenceService.getPresences(presenceFilter);
      assert.isOk(presences![0]);
      assert.strictEqual(presences![0]._id?.toString(), presenceId.toString());
      assert.isTrue(queryPresencesFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the presences cannot be found', async () => {
      const presenceName = 'presenceName1';
      const presenceFilter = {name: presenceName};
      const errMessage = 'Cannot find the presence';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        presenceFilter
      );
      const getPresenceFromModelStub = sandbox.stub();
      getPresenceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.PresenceModel,
        'queryPresences',
        getPresenceFromModelStub
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

      const presence = await presenceService.getPresences(presenceFilter);
      assert.notOk(presence);

      assert.isTrue(getPresenceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const presenceName = 'presenceName1';
      const presenceFilter = {name: presenceName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getPresenceByEmail'
      );
      const getPresenceFromModelStub = sandbox.stub();
      getPresenceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.PresenceModel,
        'queryPresences',
        getPresenceFromModelStub
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
        await presenceService.getPresences(presenceFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getPresenceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updatePresence', () => {
    it('will update a presence', async () => {
      const presenceId = new mongooseTypes.ObjectId().toString();
      const updatePresenceFromModelStub = sandbox.stub();
      updatePresenceFromModelStub.resolves({
         ...mocks.MOCK_PRESENCE,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        config: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IModelConfig,
      } as unknown as databaseTypes.IPresence);
      sandbox.replace(
        dbConnection.models.PresenceModel,
        'updatePresenceById',
        updatePresenceFromModelStub
      );

      const presence = await presenceService.updatePresence(presenceId, {
        deletedAt: new Date(),
      });
      assert.isOk(presence);
      assert.strictEqual(presence.id, 'id');
      assert.isOk(presence.deletedAt);
      assert.isTrue(updatePresenceFromModelStub.calledOnce);
    });
    it('will update a presence when the id is a string', async () => {
     const presenceId = new mongooseTypes.ObjectId();
      const updatePresenceFromModelStub = sandbox.stub();
      updatePresenceFromModelStub.resolves({
         ...mocks.MOCK_PRESENCE,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        config: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IModelConfig,
      } as unknown as databaseTypes.IPresence);
      sandbox.replace(
        dbConnection.models.PresenceModel,
        'updatePresenceById',
        updatePresenceFromModelStub
      );

      const presence = await presenceService.updatePresence(presenceId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(presence);
      assert.strictEqual(presence.id, 'id');
      assert.isOk(presence.deletedAt);
      assert.isTrue(updatePresenceFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when presence model throws it', async () => {
      const presenceId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updatePresenceFromModelStub = sandbox.stub();
      updatePresenceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.PresenceModel,
        'updatePresenceById',
        updatePresenceFromModelStub
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
        await presenceService.updatePresence(presenceId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updatePresenceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when presence model throws it ', async () => {
      const presenceId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updatePresenceFromModelStub = sandbox.stub();
      updatePresenceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.PresenceModel,
        'updatePresenceById',
        updatePresenceFromModelStub
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
        await presenceService.updatePresence(presenceId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updatePresenceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when presence model throws a DataOperationError ', async () => {
      const presenceId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updatePresenceById'
      );
      const updatePresenceFromModelStub = sandbox.stub();
      updatePresenceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.PresenceModel,
        'updatePresenceById',
        updatePresenceFromModelStub
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
        await presenceService.updatePresence(presenceId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updatePresenceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});

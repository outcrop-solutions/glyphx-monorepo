// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import { stateService} from '../../services';
import * as mocks from 'database/src/mongoose/mocks'

describe('#services/state', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createState', () => {
    it('will create a State', async () => {
      const stateId = new mongooseTypes.ObjectId();
      const idId = new mongooseTypes.ObjectId();
      const createdById = new mongooseTypes.ObjectId();
      const cameraId = new mongooseTypes.ObjectId();
      const aspectRatioId = new mongooseTypes.ObjectId();
      const propertiesId = new mongooseTypes.ObjectId();
      const projectId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const fileSystemId = new mongooseTypes.ObjectId();
      const documentId = new mongooseTypes.ObjectId();

      // createState
      const createStateFromModelStub = sandbox.stub();
      createStateFromModelStub.resolves({
         ...mocks.MOCK_STATE,
        _id: new mongooseTypes.ObjectId(),
        createdBy: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        document: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IDocument,
      } as unknown as databaseTypes.IState);

      sandbox.replace(
        dbConnection.models.StateModel,
        'createState',
        createStateFromModelStub
      );

      const doc = await stateService.createState(
       {
         ...mocks.MOCK_STATE,
        _id: new mongooseTypes.ObjectId(),
        createdBy: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        document: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IDocument,
      } as unknown as databaseTypes.IState
      );

      assert.isTrue(createStateFromModelStub.calledOnce);
    });
    // state model fails
    it('will publish and rethrow an InvalidArgumentError when state model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createState
      const createStateFromModelStub = sandbox.stub();
      createStateFromModelStub.rejects(err)

      sandbox.replace(
        dbConnection.models.StateModel,
        'createState',
        createStateFromModelStub
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
        await stateService.createState(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createStateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when state model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createState
      const createStateFromModelStub = sandbox.stub();
      createStateFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.StateModel,
        'createState',
        createStateFromModelStub
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
        await stateService.createState(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createStateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when state model throws it', async () => {
      const createStateFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createStateFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.StateModel,
        'createState',
        createStateFromModelStub
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
        await stateService.createState(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createStateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when state model throws a DataOperationError', async () => {
      const createStateFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createStateFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.StateModel,
        'createState',
        createStateFromModelStub
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
        await stateService.createState(
         {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createStateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when state model throws a UnexpectedError', async () => {
      const createStateFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(
        errMessage,
        'mongodDb',
      );

      createStateFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.StateModel,
        'createState',
        createStateFromModelStub
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
        await stateService.createState(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createStateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getState', () => {
    it('should get a state by id', async () => {
      const stateId = new mongooseTypes.ObjectId().toString();

      const getStateFromModelStub = sandbox.stub();
      getStateFromModelStub.resolves({
        _id: stateId,
      } as unknown as databaseTypes.IState);
      sandbox.replace(
        dbConnection.models.StateModel,
        'getStateById',
        getStateFromModelStub
      );

      const state = await stateService.getState(stateId);
      assert.isOk(state);
      assert.strictEqual(state?._id?.toString(), stateId.toString());

      assert.isTrue(getStateFromModelStub.calledOnce);
    });
    it('should get a state by id when id is a string', async () => {
      const stateId = new mongooseTypes.ObjectId();

      const getStateFromModelStub = sandbox.stub();
      getStateFromModelStub.resolves({
        _id: stateId,
      } as unknown as databaseTypes.IState);
      sandbox.replace(
        dbConnection.models.StateModel,
        'getStateById',
        getStateFromModelStub
      );

      const state = await stateService.getState(stateId.toString());
      assert.isOk(state);
      assert.strictEqual(state?._id?.toString(), stateId.toString());

      assert.isTrue(getStateFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the state cannot be found', async () => {
      const stateId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'stateId',
        stateId
      );
      const getStateFromModelStub = sandbox.stub();
      getStateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.StateModel,
        'getStateById',
        getStateFromModelStub
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

      const state = await stateService.getState(stateId);
      assert.notOk(state);

      assert.isTrue(getStateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const stateId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getStateById'
      );
      const getStateFromModelStub = sandbox.stub();
      getStateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.StateModel,
        'getStateById',
        getStateFromModelStub
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
        await stateService.getState(stateId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getStateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getStates', () => {
    it('should get states by filter', async () => {
      const stateId = new mongooseTypes.ObjectId();
      const stateId2 = new mongooseTypes.ObjectId();
      const stateFilter = {_id: stateId};

      const queryStatesFromModelStub = sandbox.stub();
      queryStatesFromModelStub.resolves({
        results: [
          {
         ...mocks.MOCK_STATE,
        _id: stateId,
        createdBy: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        document: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IDocument,
        } as unknown as databaseTypes.IState,
        {
         ...mocks.MOCK_STATE,
        _id: stateId2,
        createdBy: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        document: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IDocument,
        } as unknown as databaseTypes.IState
        ],
      } as unknown as databaseTypes.IState[]);

      sandbox.replace(
        dbConnection.models.StateModel,
        'queryStates',
        queryStatesFromModelStub
      );

      const states = await stateService.getStates(stateFilter);
      assert.isOk(states![0]);
      assert.strictEqual(states![0]._id?.toString(), stateId.toString());
      assert.isTrue(queryStatesFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the states cannot be found', async () => {
      const stateName = 'stateName1';
      const stateFilter = {name: stateName};
      const errMessage = 'Cannot find the state';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        stateFilter
      );
      const getStateFromModelStub = sandbox.stub();
      getStateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.StateModel,
        'queryStates',
        getStateFromModelStub
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

      const state = await stateService.getStates(stateFilter);
      assert.notOk(state);

      assert.isTrue(getStateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const stateName = 'stateName1';
      const stateFilter = {name: stateName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getStateByEmail'
      );
      const getStateFromModelStub = sandbox.stub();
      getStateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.StateModel,
        'queryStates',
        getStateFromModelStub
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
        await stateService.getStates(stateFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getStateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateState', () => {
    it('will update a state', async () => {
      const stateId = new mongooseTypes.ObjectId().toString();
      const updateStateFromModelStub = sandbox.stub();
      updateStateFromModelStub.resolves({
         ...mocks.MOCK_STATE,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        createdBy: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        document: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IDocument,
      } as unknown as databaseTypes.IState);
      sandbox.replace(
        dbConnection.models.StateModel,
        'updateStateById',
        updateStateFromModelStub
      );

      const state = await stateService.updateState(stateId, {
        deletedAt: new Date(),
      });
      assert.isOk(state);
      assert.strictEqual(state.id, 'id');
      assert.isOk(state.deletedAt);
      assert.isTrue(updateStateFromModelStub.calledOnce);
    });
    it('will update a state when the id is a string', async () => {
     const stateId = new mongooseTypes.ObjectId();
      const updateStateFromModelStub = sandbox.stub();
      updateStateFromModelStub.resolves({
         ...mocks.MOCK_STATE,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        createdBy: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        document: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IDocument,
      } as unknown as databaseTypes.IState);
      sandbox.replace(
        dbConnection.models.StateModel,
        'updateStateById',
        updateStateFromModelStub
      );

      const state = await stateService.updateState(stateId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(state);
      assert.strictEqual(state.id, 'id');
      assert.isOk(state.deletedAt);
      assert.isTrue(updateStateFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when state model throws it', async () => {
      const stateId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateStateFromModelStub = sandbox.stub();
      updateStateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.StateModel,
        'updateStateById',
        updateStateFromModelStub
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
        await stateService.updateState(stateId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateStateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when state model throws it ', async () => {
      const stateId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateStateFromModelStub = sandbox.stub();
      updateStateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.StateModel,
        'updateStateById',
        updateStateFromModelStub
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
        await stateService.updateState(stateId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateStateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when state model throws a DataOperationError ', async () => {
      const stateId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateStateById'
      );
      const updateStateFromModelStub = sandbox.stub();
      updateStateFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.StateModel,
        'updateStateById',
        updateStateFromModelStub
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
        await stateService.updateState(stateId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateStateFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});

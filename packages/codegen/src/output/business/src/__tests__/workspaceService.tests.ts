// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import {workspaceService} from '../services';
import * as mocks from 'database/src/mongoose/mocks';

describe('#services/workspace', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createWorkspace', () => {
    it('will create a Workspace', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const createdAtId = new mongooseTypes.ObjectId();
      const tagsId = new mongooseTypes.ObjectId();
      const creatorId = new mongooseTypes.ObjectId();
      const membersId = new mongooseTypes.ObjectId();
      const projectsId = new mongooseTypes.ObjectId();
      const statesId = new mongooseTypes.ObjectId();

      // createWorkspace
      const createWorkspaceFromModelStub = sandbox.stub();
      createWorkspaceFromModelStub.resolves({
        ...mocks.MOCK_WORKSPACE,
        _id: new mongooseTypes.ObjectId(),
        tags: [],
        creator: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        members: [],
        projects: [],
        states: [],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'createWorkspace',
        createWorkspaceFromModelStub
      );

      const doc = await workspaceService.createWorkspace({
        ...mocks.MOCK_WORKSPACE,
        _id: new mongooseTypes.ObjectId(),
        tags: [],
        creator: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        members: [],
        projects: [],
        states: [],
      } as unknown as databaseTypes.IWorkspace);

      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
    });
    // workspace model fails
    it('will publish and rethrow an InvalidArgumentError when workspace model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createWorkspace
      const createWorkspaceFromModelStub = sandbox.stub();
      createWorkspaceFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'createWorkspace',
        createWorkspaceFromModelStub
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
        await workspaceService.createWorkspace({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when workspace model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createWorkspace
      const createWorkspaceFromModelStub = sandbox.stub();
      createWorkspaceFromModelStub.rejects(err);

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
        await workspaceService.createWorkspace({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when workspace model throws it', async () => {
      const createWorkspaceFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createWorkspaceFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'createWorkspace',
        createWorkspaceFromModelStub
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
        await workspaceService.createWorkspace({});
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when workspace model throws a DataOperationError', async () => {
      const createWorkspaceFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createWorkspaceFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'createWorkspace',
        createWorkspaceFromModelStub
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
        await workspaceService.createWorkspace({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when workspace model throws a UnexpectedError', async () => {
      const createWorkspaceFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(errMessage, 'mongodDb');

      createWorkspaceFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'createWorkspace',
        createWorkspaceFromModelStub
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
        await workspaceService.createWorkspace({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getWorkspace', () => {
    it('should get a workspace by id', async () => {
      const workspaceId = new mongooseTypes.ObjectId();

      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.resolves({
        _id: workspaceId,
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceFromModelStub
      );

      const workspace = await workspaceService.getWorkspace(workspaceId);
      assert.isOk(workspace);
      assert.strictEqual(workspace?._id?.toString(), workspaceId.toString());

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
    });
    it('should get a workspace by id when id is a string', async () => {
      const workspaceId = new mongooseTypes.ObjectId();

      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.resolves({
        _id: workspaceId,
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceFromModelStub
      );

      const workspace = await workspaceService.getWorkspace(
        workspaceId.toString()
      );
      assert.isOk(workspace);
      assert.strictEqual(workspace?._id?.toString(), workspaceId.toString());

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the workspace cannot be found', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'workspaceId',
        workspaceId
      );
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceFromModelStub
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

      const workspace = await workspaceService.getWorkspace(workspaceId);
      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getWorkspaceById'
      );
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceFromModelStub
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
        await workspaceService.getWorkspace(workspaceId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getWorkspaces', () => {
    it('should get workspaces by filter', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceId2 = new mongooseTypes.ObjectId();
      const workspaceFilter = {_id: workspaceId};

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            ...mocks.MOCK_WORKSPACE,
            _id: workspaceId,
            tags: [],
            creator: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
            members: [],
            projects: [],
            states: [],
          } as unknown as databaseTypes.IWorkspace,
          {
            ...mocks.MOCK_WORKSPACE,
            _id: workspaceId2,
            tags: [],
            creator: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
            members: [],
            projects: [],
            states: [],
          } as unknown as databaseTypes.IWorkspace,
        ],
      } as unknown as databaseTypes.IWorkspace[]);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        queryWorkspacesFromModelStub
      );

      const workspaces = await workspaceService.getWorkspaces(workspaceFilter);
      assert.isOk(workspaces![0]);
      assert.strictEqual(
        workspaces![0]._id?.toString(),
        workspaceId.toString()
      );
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the workspaces cannot be found', async () => {
      const workspaceName = 'workspaceName1';
      const workspaceFilter = {name: workspaceName};
      const errMessage = 'Cannot find the workspace';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        workspaceFilter
      );
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        getWorkspaceFromModelStub
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

      const workspace = await workspaceService.getWorkspaces(workspaceFilter);
      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const workspaceName = 'workspaceName1';
      const workspaceFilter = {name: workspaceName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getWorkspaceByEmail'
      );
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        getWorkspaceFromModelStub
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
        await workspaceService.getWorkspaces(workspaceFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateWorkspace', () => {
    it('will update a workspace', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves({
        ...mocks.MOCK_WORKSPACE,
        _id: new mongooseTypes.ObjectId(),
        tags: [],
        creator: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        members: [],
        projects: [],
        states: [],
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceById',
        updateWorkspaceFromModelStub
      );

      const workspace = await workspaceService.updateWorkspace(workspaceId, {
        deletedAt: new Date(),
      });
      assert.isOk(workspace);
      assert.strictEqual(workspace._id, workspaceId);
      assert.isOk(workspace.deletedAt);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
    });
    it('will update a workspace when the id is a string', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves({
        ...mocks.MOCK_WORKSPACE,
        _id: new mongooseTypes.ObjectId(),
        tags: [],
        creator: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        members: [],
        projects: [],
        states: [],
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceById',
        updateWorkspaceFromModelStub
      );

      const workspace = await workspaceService.updateWorkspace(
        workspaceId.toString(),
        {
          deletedAt: new Date(),
        }
      );
      assert.isOk(workspace);
      assert.strictEqual(workspace._id, workspaceId);
      assert.isOk(workspace.deletedAt);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when workspace model throws it ', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceById',
        updateWorkspaceFromModelStub
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
        await workspaceService.updateWorkspace(workspaceId, {
          deletedAt: new Date(),
        });
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when workspace model throws it ', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceById',
        updateWorkspaceFromModelStub
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
        await workspaceService.updateWorkspace(workspaceId, {
          deletedAt: new Date(),
        });
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when workspace model throws a DataOperationError ', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateWorkspaceById'
      );
      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceById',
        updateWorkspaceFromModelStub
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
        await workspaceService.updateWorkspace(workspaceId, {
          deletedAt: new Date(),
        });
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});

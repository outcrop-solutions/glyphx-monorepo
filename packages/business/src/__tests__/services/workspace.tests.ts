import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {database, database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from '@glyphx/database';
import {error} from '@glyphx/core';
import {workspaceService} from '../../services';
import {v4} from 'uuid';

describe('#services/workspace', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();

  afterEach(() => {
    sandbox.restore();
  });

  context('countWorkspaces', () => {
    it('should return the number of workspaces by slug', async () => {
      const slug = 'testSlug';
      const numWorks = 4;
      const getWorkspaceCountStub = sandbox.stub();
      getWorkspaceCountStub.resolves(numWorks as number);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'count',
        getWorkspaceCountStub
      );

      const numWorkspaces = await workspaceService.countWorkspaces(slug);
      assert.isOk(numWorkspaces);
      assert.strictEqual(numWorkspaces, numWorks);

      assert.isTrue(getWorkspaceCountStub.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const slug = 'testSlug';
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'count'
      );
      const countWorkspacesFromModelStub = sandbox.stub();
      countWorkspacesFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'count',
        countWorkspacesFromModelStub
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
        await workspaceService.countWorkspaces(slug);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(countWorkspacesFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('createWorkspace', () => {
    it('will create a Workspace with user associated as creator', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceName = 'testWorkspaceName';
      const workspaceSlug = 'testWorkspaceSlug';
      const creatorId = new mongooseTypes.ObjectId();
      const creatorEmail = 'testUserEmail';
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');

      const createWorkspaceFromModelStub = sandbox.stub();
      createWorkspaceFromModelStub.resolves({
        _id: workspaceId,
        inviteCode,
        workspaceCode,
        creator: {
          _id: creatorId,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'createWorkspace',
        createWorkspaceFromModelStub
      );

      const doc = await workspaceService.createWorkspace(
        creatorId,
        creatorEmail,
        workspaceName,
        workspaceSlug
      );

      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isOk(doc!.creator.email, creatorEmail);
      assert.strictEqual(doc?.creator._id, creatorId);
    });
    it('will create Workspace with user associated as creator when creatorId is a string', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceName = 'testWorkspaceName';
      const workspaceSlug = 'testWorkspaceSlug';
      const creatorId = new mongooseTypes.ObjectId();
      const creatorEmail = 'testUserEmail';
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');

      const createWorkspaceFromModelStub = sandbox.stub();
      createWorkspaceFromModelStub.resolves({
        _id: workspaceId,
        inviteCode,
        workspaceCode,
        creator: {
          _id: creatorId,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'createWorkspace',
        createWorkspaceFromModelStub
      );

      const doc = await workspaceService.createWorkspace(
        creatorId.toString(),
        creatorEmail,
        workspaceName,
        workspaceSlug
      );

      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isOk(doc!.creator.email, creatorEmail);
      assert.strictEqual(doc?.creator._id, creatorId);
    });
    it('will publish and rethrow an InvalidArgumentError when workspace model throws it ', async () => {
      const workspaceName = 'testWorkspaceName';
      const workspaceSlug = 'testWorkspaceSlug';
      const creatorId = new mongooseTypes.ObjectId();
      const creatorEmail = 'testUserEmail';
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(
        errMessage,
        'emailVerified',
        true
      );
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
        await workspaceService.createWorkspace(
          creatorId,
          creatorEmail,
          workspaceName,
          workspaceSlug
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when workspace model throws it ', async () => {
      const workspaceName = 'testWorkspaceName';
      const workspaceSlug = 'testWorkspaceSlug';
      const creatorId = new mongooseTypes.ObjectId();
      const creatorEmail = 'testUserEmail';
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(
        errMessage,
        'emailVerified',
        true
      );
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
        await workspaceService.createWorkspace(
          creatorId,
          creatorEmail,
          workspaceName,
          workspaceSlug
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow a DataValidationError when workspace model throws it ', async () => {
      const workspaceName = 'testWorkspaceName';
      const workspaceSlug = 'testWorkspaceSlug';
      const creatorId = new mongooseTypes.ObjectId();
      const creatorEmail = 'testUserEmail';
      const errMessage = 'You have an invalid argument';
      const err = new error.DataValidationError(
        errMessage,
        'emailVerified',
        true
      );
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
        await workspaceService.createWorkspace(
          creatorId,
          creatorEmail,
          workspaceName,
          workspaceSlug
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when workspace model throws a DataOperationError ', async () => {
      const workspaceName = 'testWorkspaceName';
      const workspaceSlug = 'testWorkspaceSlug';
      const creatorId = new mongooseTypes.ObjectId();
      const creatorEmail = 'testUserEmail';
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateWorkspaceById'
      );
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
        await workspaceService.createWorkspace(
          creatorId,
          creatorEmail,
          workspaceName,
          workspaceSlug
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getOwnWorkspace', () => {
    it('should get default user workspace by filter if all condiitons match happy case', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            members: [
              {
                _id: userId,
                email: userEmail,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        queryWorkspacesFromModelStub
      );

      const workspace = await workspaceService.getOwnWorkspace(
        userId,
        userEmail,
        workspaceSlug
      );
      assert.isOk(workspace);
      assert.strictEqual(workspace?.slug?.toString(), workspaceSlug.toString());

      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member email match', async () => {
      const userId = new mongooseTypes.ObjectId();
      const differentUserId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            members: [
              {
                _id: differentUserId,
                email: 'differentemail@gmail.com',
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        queryWorkspacesFromModelStub
      );

      const workspace = await workspaceService.getOwnWorkspace(
        userId,
        userEmail,
        workspaceSlug
      );
      assert.isNotOk(workspace);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member email match that is also OWNER', async () => {
      const userId = new mongooseTypes.ObjectId();
      const differentUserId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            members: [
              {
                _id: differentUserId,
                email: userEmail,
                teamRole: databaseTypes.constants.ROLE.MEMBER,
                deletedAt: null,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ],
        numberOfItems: 1,
      } as unknown as databaseTypes.IWorkspace[]);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        queryWorkspacesFromModelStub
      );

      const workspace = await workspaceService.getOwnWorkspace(
        userId,
        userEmail,
        workspaceSlug
      );
      assert.isNotOk(workspace);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member owner match that has not been deleted', async () => {
      const userId = new mongooseTypes.ObjectId();
      const differentUserId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            members: [
              {
                _id: differentUserId,
                email: userEmail,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: new Date(),
              } as unknown as databaseTypes.IUser,
            ],
          },
        ],
        numberOfItems: 1,
      } as unknown as databaseTypes.IWorkspace[]);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        queryWorkspacesFromModelStub
      );

      const workspace = await workspaceService.getOwnWorkspace(
        userId,
        userEmail,
        workspaceSlug
      );
      assert.isNotOk(workspace);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('will log the failure, return null and publish DataNotFoundError if the underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'email', {userEmail});
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

      const workspace = await workspaceService.getOwnWorkspace(
        userId,
        userEmail,
        workspaceSlug
      );

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure, return null and publish InvalidArgumentError if the underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidArgumentError(errMessage, 'email', {
        userEmail,
      });
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
        assert.instanceOf(this, error.InvalidArgumentError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const workspace = await workspaceService.getOwnWorkspace(
        userId,
        userEmail,
        workspaceSlug
      );

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Something bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'queryWorkspaces'
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
        await workspaceService.getOwnWorkspace(
          userId,
          userEmail,
          workspaceSlug
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getInvitation', () => {
    it('should get associated workspace with invite by inviteCode', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceInviteCode = 'testInviteCode';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            inviteCode: workspaceInviteCode,
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        queryWorkspacesFromModelStub
      );

      const workspace = await workspaceService.getInvitation(
        workspaceInviteCode
      );
      assert.isOk(workspace);
      assert.strictEqual(
        workspace?.inviteCode?.toString(),
        workspaceInviteCode.toString()
      );

      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('will log the failure, return null and publish DataNotFoundError if the underlying model throws one', async () => {
      const workspaceInviteCode = 'testInviteCode';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'inviteCode', {
        inviteCode: workspaceInviteCode,
      });

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

      const workspace = await workspaceService.getInvitation(
        workspaceInviteCode
      );

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure, return null and publish InvalidArgumentError if the underlying model throws one', async () => {
      const workspaceInviteCode = 'testInviteCode';
      const errMessage = 'Something went wrong';

      const err = new error.InvalidArgumentError(errMessage, 'inviteCode', {
        inviteCode: workspaceInviteCode,
      });
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
        assert.instanceOf(this, error.InvalidArgumentError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const workspace = await workspaceService.getInvitation(
        workspaceInviteCode
      );

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const workspaceInviteCode = 'testInviteCode';
      const errMessage = 'Something bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'queryWorkspaces'
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
        await workspaceService.getInvitation(workspaceInviteCode);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getSiteWorkspace', () => {
    it('should get non-dleeted workspaces by slug', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        queryWorkspacesFromModelStub
      );

      const workspace = await workspaceService.getSiteWorkspace(workspaceSlug);
      assert.isOk(workspace);
      assert.strictEqual(workspace?.slug?.toString(), workspaceSlug.toString());

      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('will log the failure, return null and publish DataNotFoundError if the underlying model throws one', async () => {
      const workspaceSlug = 'testSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'slug', {
        slug: workspaceSlug,
      });

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

      const workspace = await workspaceService.getSiteWorkspace(workspaceSlug);

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure, return null and publish InvalidArgumentError if the underlying model throws one', async () => {
      const workspaceSlug = 'testSlug';
      const errMessage = 'Something went wrong';

      const err = new error.InvalidArgumentError(errMessage, 'slug', {
        slug: workspaceSlug,
      });
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
        assert.instanceOf(this, error.InvalidArgumentError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const workspace = await workspaceService.getSiteWorkspace(workspaceSlug);

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const workspaceSlug = 'testSlug';
      const errMessage = 'Something bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'queryWorkspaces'
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
        await workspaceService.getSiteWorkspace(workspaceSlug);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getWorkspace', () => {
    it('should get a workspace by slug for a given user', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            members: [
              {
                _id: userId,
                email: userEmail,
                teamRole: databaseTypes.constants.ROLE.MEMBER,
                deletedAt: null,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        queryWorkspacesFromModelStub
      );

      const workspace = await workspaceService.getWorkspace(
        userId,
        userEmail,
        workspaceSlug
      );
      assert.isOk(workspace);
      assert.strictEqual(workspace?.slug?.toString(), workspaceSlug.toString());

      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member email match', async () => {
      const userId = new mongooseTypes.ObjectId();
      const differentUserId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            members: [
              {
                _id: differentUserId,
                email: 'differentemail@gmail.com',
                teamRole: databaseTypes.constants.ROLE.MEMBER,
                deletedAt: null,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        queryWorkspacesFromModelStub
      );

      const workspace = await workspaceService.getWorkspace(
        userId,
        userEmail,
        workspaceSlug
      );
      assert.isNotOk(workspace);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member match that has not been deleted', async () => {
      const userId = new mongooseTypes.ObjectId();
      const differentUserId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            members: [
              {
                _id: differentUserId,
                email: userEmail,
                teamRole: databaseTypes.constants.ROLE.MEMBER,
                deletedAt: new Date(),
              } as unknown as databaseTypes.IUser,
            ],
          },
        ],
        numberOfItems: 1,
      } as unknown as databaseTypes.IWorkspace[]);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        queryWorkspacesFromModelStub
      );

      const workspace = await workspaceService.getWorkspace(
        userId,
        userEmail,
        workspaceSlug
      );
      assert.isNotOk(workspace);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('will log the failure, return null and publish DataNotFoundError if the underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'email', {userEmail});
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

      const workspace = await workspaceService.getWorkspace(
        userId,
        userEmail,
        workspaceSlug
      );

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure, return null and publish InvalidArgumentError if the underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidArgumentError(errMessage, 'email', {
        userEmail,
      });
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
        assert.instanceOf(this, error.InvalidArgumentError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const workspace = await workspaceService.getWorkspace(
        userId,
        userEmail,
        workspaceSlug
      );

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Something bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'queryWorkspaces'
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
        await workspaceService.getWorkspace(userId, userEmail, workspaceSlug);
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
    it('should get all workspaces with accepted invitations for a given user', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            members: [
              {
                _id: userId,
                email: userEmail,
                status: databaseTypes.constants.INVITATION_STATUS.ACCEPTED,
                deletedAt: null,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        queryWorkspacesFromModelStub
      );

      const workspaces = await workspaceService.getWorkspaces(
        userId,
        userEmail
      );
      assert.isOk(workspaces);
      assert.strictEqual(
        workspaces![0]?.slug?.toString(),
        workspaceSlug.toString()
      );

      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member email match', async () => {
      const userId = new mongooseTypes.ObjectId();
      const differentUserId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            members: [
              {
                _id: differentUserId,
                email: 'differentemail@gmail.com',
                status: databaseTypes.constants.INVITATION_STATUS.ACCEPTED,
                deletedAt: null,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        queryWorkspacesFromModelStub
      );

      const workspaces = await workspaceService.getWorkspaces(
        userId,
        userEmail
      );
      assert.isNotOk(workspaces);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member match that has not been deleted', async () => {
      const userId = new mongooseTypes.ObjectId();
      const differentUserId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            members: [
              {
                _id: differentUserId,
                email: userEmail,
                status: databaseTypes.constants.INVITATION_STATUS.ACCEPTED,
                deletedAt: new Date(),
              } as unknown as databaseTypes.IUser,
            ],
          },
        ],
        numberOfItems: 1,
      } as unknown as databaseTypes.IWorkspace[]);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'queryWorkspaces',
        queryWorkspacesFromModelStub
      );

      const workspaces = await workspaceService.getWorkspaces(
        userId,
        userEmail
      );
      assert.isNotOk(workspaces);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('will log the failure, return null and publish DataNotFoundError if the underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'email', {userEmail});
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

      const workspaces = await workspaceService.getWorkspaces(
        userId,
        userEmail
      );

      assert.notOk(workspaces);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure, return null and publish InvalidArgumentError if the underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidArgumentError(errMessage, 'email', {
        userEmail,
      });
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
        assert.instanceOf(this, error.InvalidArgumentError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const workspaces = await workspaceService.getWorkspaces(
        userId,
        userEmail
      );

      assert.notOk(workspaces);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const errMessage = 'Something bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'queryWorkspaces'
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
        await workspaceService.getWorkspaces(userId, userEmail);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('isWorkspaceCreator', () => {
    it('should return true when creatorId and Id are equal', async () => {
      const creatorId = new mongooseTypes.ObjectId();
      const result = await workspaceService.isWorkspaceCreator(
        creatorId,
        creatorId
      );
      assert.isTrue(result);
    });
    it('should return false when creatorId and Id are not equal', async () => {
      const creatorId = new mongooseTypes.ObjectId();
      const id = new mongooseTypes.ObjectId();

      const result = await workspaceService.isWorkspaceCreator(id, creatorId);
      assert.isFalse(result);
    });
  });
  context('isWorkspaceOwner', () => {
    it('should return true when given user is the owner of the workspace', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';

      const workspace = {
        _id: workspaceId,
        slug: workspaceSlug,
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.OWNER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace;

      const result = await workspaceService.isWorkspaceOwner(
        userEmail,
        workspace
      );
      assert.isTrue(result);
    });
    it('should return false when the user is not the workspace owner', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';

      const workspace = {
        _id: workspaceId,
        slug: workspaceSlug,
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.MEMBER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace;

      const result = await workspaceService.isWorkspaceOwner(
        userEmail,
        workspace
      );
      assert.isFalse(result);
    });
  });
  context('updateWorkspaceName', () => {
    it('should update a workspace name', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';

      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.resolves({
        _id: workspaceId,
        slug: workspaceSlug,
        name: 'workspace1',
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.OWNER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromModelStub
      );

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves({
        _id: workspaceId,
        slug: workspaceSlug,
        name: newWorkspaceName,
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.MEMBER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceById',
        updateWorkspaceFromModelStub
      );

      const workspaceName = await workspaceService.updateWorkspaceName(
        userId,
        userEmail,
        newWorkspaceName,
        workspaceSlug
      );

      assert.isOk(workspaceName);
      assert.strictEqual(
        workspaceName!.toString(),
        newWorkspaceName.toString()
      );

      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
    });
    it('will return null, and publish DataNotFoundError if getOwnWorkspace throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'slug', {
        workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.rejects(err);
      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
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

      const workspaceName = await workspaceService.updateWorkspaceName(
        userId,
        userEmail,
        newWorkspaceName,
        workspaceSlug
      );

      assert.notOk(workspaceName);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish DataNotFoundError if getOwnWorkspace returns null', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'slug', {
        workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves(null);
      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
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

      const workspaceName = await workspaceService.updateWorkspaceName(
        userId,
        userEmail,
        newWorkspaceName,
        workspaceSlug
      );

      assert.notOk(workspaceName);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish InvalidArgumentError if getOwnWorkspace throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidArgumentError(errMessage, 'slug', {
        workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.rejects(err);
      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const workspaceName = await workspaceService.updateWorkspaceName(
        userId,
        userEmail,
        newWorkspaceName,
        workspaceSlug
      );

      assert.notOk(workspaceName);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will re-publish DataServiceError if getOwnWorkspace throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataServiceError(
        errMessage,
        'workspace',
        'getWorkspace',
        {userEmail}
      );

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.rejects(err);
      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataServiceError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await workspaceService.updateWorkspaceName(
          userId,
          userEmail,
          newWorkspaceName,
          workspaceSlug
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish InvalidArgumentError if updateWorkspaceByFilter in underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidArgumentError(errMessage, 'slug', {
        workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        slug: workspaceSlug,
        name: 'workspace1',
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.OWNER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceByFilter',
        updateWorkspaceFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const workspaceName = await workspaceService.updateWorkspaceName(
        userId,
        userEmail,
        newWorkspaceName,
        workspaceSlug
      );

      assert.notOk(workspaceName);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish InvalidOperationError if updateWorkspaceByFilter in underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidOperationError(errMessage, {
        slug: workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        slug: workspaceSlug,
        name: 'workspace1',
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.OWNER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceByFilter',
        updateWorkspaceFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const workspaceName = await workspaceService.updateWorkspaceName(
        userId,
        userEmail,
        newWorkspaceName,
        workspaceSlug
      );

      assert.notOk(workspaceName);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will throw and publish DataServiceError if updateWorkspaceByFilter in underlying model throws DatabaseOperationError', async () => {
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'updateWorkspaceByFilter',
        {
          slug: workspaceSlug,
        }
      );

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        slug: workspaceSlug,
        name: 'workspace1',
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.OWNER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceByFilter',
        updateWorkspaceFromModelStub
      );

      const publishOverride = sandbox.stub();
      publishOverride.resolves();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await workspaceService.updateWorkspaceName(
          userId,
          userEmail,
          newWorkspaceName,
          workspaceSlug
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish DataNotFoundError if getWorkspaceById in underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'slug', {
        workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        slug: workspaceSlug,
        name: 'workspace1',
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.OWNER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceByFilter',
        updateWorkspaceFromModelStub
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

      const workspaceName = await workspaceService.updateWorkspaceName(
        userId,
        userEmail,
        newWorkspaceName,
        workspaceSlug
      );

      assert.notOk(workspaceName);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will throw and publish DataServiceError if getWorkspaceById in underlying model throws DatabaseOperationError', async () => {
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'updateWorkspaceByFilter',
        {
          slug: workspaceSlug,
        }
      );

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        slug: workspaceSlug,
        name: 'workspace1',
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.OWNER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceByFilter',
        updateWorkspaceFromModelStub
      );

      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceFromModelStub
      );

      const publishOverride = sandbox.stub();
      publishOverride.resolves();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await workspaceService.updateWorkspaceName(
          userId,
          userEmail,
          newWorkspaceName,
          workspaceSlug
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateWorkspaceSlug', () => {
    it('should update a workspace slug', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';
      const workspaceName = 'testName';
      const newWorkspaceSlug = 'testNewSlug';

      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.resolves({
        _id: workspaceId,
        slug: workspaceSlug,
        name: workspaceName,
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.OWNER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromModelStub
      );

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves({
        _id: workspaceId,
        slug: newWorkspaceSlug,
        name: workspaceName,
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.MEMBER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceById',
        updateWorkspaceFromModelStub
      );

      const workspaceSlugResult = await workspaceService.updateWorkspaceSlug(
        userId,
        userEmail,
        newWorkspaceSlug,
        workspaceSlug
      );

      assert.isOk(workspaceSlugResult);
      assert.strictEqual(
        workspaceSlugResult!.toString(),
        newWorkspaceSlug.toString().toLowerCase()
      );

      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
    });
    it('will return null, and publish DataNotFoundError if getOwnWorkspace throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceSlug = 'newTestSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'slug', {
        workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.rejects(err);
      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
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

      const workspaceName = await workspaceService.updateWorkspaceSlug(
        userId,
        userEmail,
        newWorkspaceSlug,
        workspaceSlug
      );

      assert.notOk(workspaceName);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish DataNotFoundError if getOwnWorkspace returns null', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceSlug = 'tnewTstSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'slug', {
        workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves(null);
      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
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

      const workspaceName = await workspaceService.updateWorkspaceSlug(
        userId,
        userEmail,
        newWorkspaceSlug,
        workspaceSlug
      );

      assert.notOk(workspaceName);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish InvalidArgumentError if getOwnWorkspace throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceSlug = 'newTestSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidArgumentError(errMessage, 'slug', {
        workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.rejects(err);
      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const workspaceName = await workspaceService.updateWorkspaceSlug(
        userId,
        userEmail,
        newWorkspaceSlug,
        workspaceSlug
      );

      assert.notOk(workspaceName);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will re-publish DataServiceError if getOwnWorkspace throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceSlug = 'newTestSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataServiceError(
        errMessage,
        'workspace',
        'getWorkspace',
        {userEmail}
      );

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.rejects(err);
      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataServiceError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await workspaceService.updateWorkspaceSlug(
          userId,
          userEmail,
          newWorkspaceSlug,
          workspaceSlug
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish InvalidArgumentError if updateWorkspaceByFilter in underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceSlug = 'newTestSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidArgumentError(errMessage, 'slug', {
        workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        slug: workspaceSlug,
        name: 'workspace1',
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.OWNER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceByFilter',
        updateWorkspaceFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const workspaceName = await workspaceService.updateWorkspaceSlug(
        userId,
        userEmail,
        newWorkspaceSlug,
        workspaceSlug
      );

      assert.notOk(workspaceName);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish InvalidOperationError if updateWorkspaceByFilter in underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceSlug = 'newTestSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidOperationError(errMessage, {
        slug: workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        slug: workspaceSlug,
        name: 'workspace1',
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.OWNER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceByFilter',
        updateWorkspaceFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const workspaceName = await workspaceService.updateWorkspaceSlug(
        userId,
        userEmail,
        newWorkspaceSlug,
        workspaceSlug
      );

      assert.notOk(workspaceName);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will throw and publish DataServiceError if updateWorkspaceByFilter in underlying model throws DatabaseOperationError', async () => {
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceSlug = 'newTestSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'updateWorkspaceByFilter',
        {
          slug: workspaceSlug,
        }
      );

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        slug: workspaceSlug,
        name: 'workspace1',
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.OWNER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceByFilter',
        updateWorkspaceFromModelStub
      );

      const publishOverride = sandbox.stub();
      publishOverride.resolves();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await workspaceService.updateWorkspaceSlug(
          userId,
          userEmail,
          newWorkspaceSlug,
          workspaceSlug
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish DataNotFoundError if getWorkspaceById in underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceSlug = 'newTestSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'slug', {
        workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        slug: workspaceSlug,
        name: 'workspace1',
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.OWNER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceByFilter',
        updateWorkspaceFromModelStub
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

      const workspaceName = await workspaceService.updateWorkspaceSlug(
        userId,
        userEmail,
        newWorkspaceSlug,
        workspaceSlug
      );

      assert.notOk(workspaceName);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will throw and publish DataServiceError if getWorkspaceById in underlying model throws DatabaseOperationError', async () => {
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceSlug = 'newTestSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'updateWorkspaceByFilter',
        {
          slug: workspaceSlug,
        }
      );

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        slug: workspaceSlug,
        name: 'workspace1',
        members: [
          {
            _id: userId,
            email: userEmail,
            teamRole: databaseTypes.constants.ROLE.OWNER,
            deletedAt: null,
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(
        workspaceService,
        'getOwnWorkspace',
        getWorkspaceFromServiceStub
      );

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'updateWorkspaceByFilter',
        updateWorkspaceFromModelStub
      );

      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceFromModelStub
      );

      const publishOverride = sandbox.stub();
      publishOverride.resolves();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await workspaceService.updateWorkspaceSlug(
          userId,
          userEmail,
          newWorkspaceSlug,
          workspaceSlug
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});

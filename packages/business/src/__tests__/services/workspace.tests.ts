import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from '@glyphx/database';
import {error} from '@glyphx/core';
import {workspaceService} from '../../services';

describe('#services/customer', () => {
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
  //   context('getSiteWorkspace', () => {
  //     it('should get workspaces by filter', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const workspaceEmail = 'testemail@gmail.com';
  //       const workspaceFilter = {email: workspaceEmail};

  //       const queryWorkspacesFromModelStub = sandbox.stub();
  //       queryWorkspacesFromModelStub.resolves({
  //         results: [
  //           {
  //             _id: workspaceId,
  //             email: workspaceEmail,
  //           },
  //         ],
  //       } as unknown as databaseTypes.IWorkspace[]);

  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'queryWorkspaces',
  //         queryWorkspacesFromModelStub
  //       );

  //       const workspaces = await workspaceService.getWorkspaces(workspaceFilter);
  //       assert.isOk(workspaces![0]);
  //       assert.strictEqual(workspaces![0].email?.toString(), workspaceEmail.toString());

  //       assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
  //     });
  //     it('will log the failure and return null if the workspace cannot be found', async () => {
  //       const workspaceEmail = 'testemail@gmail.com';
  //       const workspaceFilter = {email: workspaceEmail};
  //       const errMessage = 'Cannot find the workspace';
  //       const err = new error.DataNotFoundError(
  //         errMessage,
  //         'email',
  //         workspaceFilter
  //       );
  //       const getWorkspaceFromModelStub = sandbox.stub();
  //       getWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'queryWorkspaces',
  //         getWorkspaceFromModelStub
  //       );
  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.DataNotFoundError);
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       const workspace = await workspaceService.getWorkspaces(workspaceFilter);
  //       assert.notOk(workspace);

  //       assert.isTrue(getWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
  //       const workspaceEmail = 'testemail@gmail.com';
  //       const workspaceFilter = {email: workspaceEmail};
  //       const errMessage = 'Something Bad has happened';
  //       const err = new error.DatabaseOperationError(
  //         errMessage,
  //         'mongoDb',
  //         'getWorkspaceByEmail'
  //       );
  //       const getWorkspaceFromModelStub = sandbox.stub();
  //       getWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'queryWorkspaces',
  //         getWorkspaceFromModelStub
  //       );
  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.DatabaseOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await workspaceService.getWorkspaces(workspaceFilter);
  //       } catch (e) {
  //         assert.instanceOf(e, error.DataServiceError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);
  //       assert.isTrue(getWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //   });
  //   context('getWorkspace', () => {
  //     it('should get workspaces by filter', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const workspaceEmail = 'testemail@gmail.com';
  //       const workspaceFilter = {email: workspaceEmail};

  //       const queryWorkspacesFromModelStub = sandbox.stub();
  //       queryWorkspacesFromModelStub.resolves({
  //         results: [
  //           {
  //             _id: workspaceId,
  //             email: workspaceEmail,
  //           },
  //         ],
  //       } as unknown as databaseTypes.IWorkspace[]);

  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'queryWorkspaces',
  //         queryWorkspacesFromModelStub
  //       );

  //       const workspaces = await workspaceService.getWorkspaces(workspaceFilter);
  //       assert.isOk(workspaces![0]);
  //       assert.strictEqual(workspaces![0].email?.toString(), workspaceEmail.toString());

  //       assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
  //     });
  //     it('will log the failure and return null if the workspace cannot be found', async () => {
  //       const workspaceEmail = 'testemail@gmail.com';
  //       const workspaceFilter = {email: workspaceEmail};
  //       const errMessage = 'Cannot find the workspace';
  //       const err = new error.DataNotFoundError(
  //         errMessage,
  //         'email',
  //         workspaceFilter
  //       );
  //       const getWorkspaceFromModelStub = sandbox.stub();
  //       getWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'queryWorkspaces',
  //         getWorkspaceFromModelStub
  //       );
  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.DataNotFoundError);
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       const workspace = await workspaceService.getWorkspaces(workspaceFilter);
  //       assert.notOk(workspace);

  //       assert.isTrue(getWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
  //       const workspaceEmail = 'testemail@gmail.com';
  //       const workspaceFilter = {email: workspaceEmail};
  //       const errMessage = 'Something Bad has happened';
  //       const err = new error.DatabaseOperationError(
  //         errMessage,
  //         'mongoDb',
  //         'getWorkspaceByEmail'
  //       );
  //       const getWorkspaceFromModelStub = sandbox.stub();
  //       getWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'queryWorkspaces',
  //         getWorkspaceFromModelStub
  //       );
  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.DatabaseOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await workspaceService.getWorkspaces(workspaceFilter);
  //       } catch (e) {
  //         assert.instanceOf(e, error.DataServiceError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);
  //       assert.isTrue(getWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //   });
  //   context('getWorkspaces', () => {
  //     it('should get workspaces by filter', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const workspaceEmail = 'testemail@gmail.com';
  //       const workspaceFilter = {email: workspaceEmail};

  //       const queryWorkspacesFromModelStub = sandbox.stub();
  //       queryWorkspacesFromModelStub.resolves({
  //         results: [
  //           {
  //             _id: workspaceId,
  //             email: workspaceEmail,
  //           },
  //         ],
  //       } as unknown as databaseTypes.IWorkspace[]);

  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'queryWorkspaces',
  //         queryWorkspacesFromModelStub
  //       );

  //       const workspaces = await workspaceService.getWorkspaces(workspaceFilter);
  //       assert.isOk(workspaces![0]);
  //       assert.strictEqual(workspaces![0].email?.toString(), workspaceEmail.toString());

  //       assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
  //     });
  //     it('will log the failure and return null if the workspace cannot be found', async () => {
  //       const workspaceEmail = 'testemail@gmail.com';
  //       const workspaceFilter = {email: workspaceEmail};
  //       const errMessage = 'Cannot find the workspace';
  //       const err = new error.DataNotFoundError(
  //         errMessage,
  //         'email',
  //         workspaceFilter
  //       );
  //       const getWorkspaceFromModelStub = sandbox.stub();
  //       getWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'queryWorkspaces',
  //         getWorkspaceFromModelStub
  //       );
  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.DataNotFoundError);
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       const workspace = await workspaceService.getWorkspaces(workspaceFilter);
  //       assert.notOk(workspace);

  //       assert.isTrue(getWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
  //       const workspaceEmail = 'testemail@gmail.com';
  //       const workspaceFilter = {email: workspaceEmail};
  //       const errMessage = 'Something Bad has happened';
  //       const err = new error.DatabaseOperationError(
  //         errMessage,
  //         'mongoDb',
  //         'getWorkspaceByEmail'
  //       );
  //       const getWorkspaceFromModelStub = sandbox.stub();
  //       getWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'queryWorkspaces',
  //         getWorkspaceFromModelStub
  //       );
  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.DatabaseOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await workspaceService.getWorkspaces(workspaceFilter);
  //       } catch (e) {
  //         assert.instanceOf(e, error.DataServiceError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);
  //       assert.isTrue(getWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //   });
  //   context('getWorkspacePaths', () => {});
  //   context('inviteUsers', () => {
  //     it('will delete a workspace by updating the deletedAt property', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const deletedAt = new Date();

  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.resolves({
  //         _id: workspaceId,
  //         deletedAt: deletedAt,
  //       });

  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       await workspaceService.remove(workspaceId);
  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //     });
  //     it('will delete a workspace by updating the deletedAt property when workspaceId is a string', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const deletedAt = new Date();

  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.resolves({
  //         _id: workspaceId,
  //         deletedAt: deletedAt,
  //       });

  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       await workspaceService.remove(workspaceId.toString());
  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //     });
  //     it('will publish and rethrow an InvalidArgumentError when workspace model throws it ', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       // const deletedAt = new Date();
  //       const errMessage = 'You have an invalid argument';
  //       const err = new error.InvalidArgumentError(errMessage, 'workspaceId', true);
  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.InvalidArgumentError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await workspaceService.remove(workspaceId);
  //       } catch (e) {
  //         assert.instanceOf(e, error.InvalidArgumentError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will publish and rethrow an InvalidOperationError when workspace model throws it ', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const errMessage = 'You tried to perform an invalid operation';
  //       const err = new error.InvalidOperationError(errMessage, {});
  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.InvalidOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await workspaceService.remove(workspaceId);
  //       } catch (e) {
  //         assert.instanceOf(e, error.InvalidOperationError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will publish and throw an DataServiceError when workspace model throws a DataOperationError ', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const errMessage = 'A DataOperationError has occurred';
  //       const err = new error.DatabaseOperationError(
  //         errMessage,
  //         'mongodDb',
  //         'updateWorkspaceById'
  //       );
  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.DatabaseOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await workspaceService.remove(workspaceId);
  //       } catch (e) {
  //         assert.instanceOf(e, error.DataServiceError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //   });
  //   context('isWorkspaceCreator', () => {});
  //   context('isWorkspaceOwner', () => {});
  //   context('joinWorkspace', () => {});
  //   context('updateWorkspaceName', () => {
  //     it('will update a workspace teamRole', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const teamRole = databaseTypes.constants.ROLE.MEMBER;

  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.resolves({
  //         _id: workspaceId,
  //         teamRole: teamRole,
  //       });

  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       await workspaceService.toggleRole(workspaceId, teamRole);
  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //     });
  //     it('will update a workspace teamRole when workspaceId is a string', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const teamRole = databaseTypes.constants.ROLE.MEMBER;

  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.resolves({
  //         _id: workspaceId,
  //         teamRole: teamRole,
  //       });

  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       await workspaceService.toggleRole(workspaceId.toString(), teamRole);
  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //     });
  //     it('will publish and rethrow an InvalidArgumentError when workspace model throws it ', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const teamRole = databaseTypes.constants.ROLE.MEMBER;
  //       const errMessage = 'You have an invalid argument';
  //       const err = new error.InvalidArgumentError(errMessage, 'workspaceId', true);
  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.InvalidArgumentError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await workspaceService.toggleRole(workspaceId, teamRole);
  //       } catch (e) {
  //         assert.instanceOf(e, error.InvalidArgumentError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will publish and rethrow an InvalidOperationError when workspace model throws it ', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const teamRole = databaseTypes.constants.ROLE.MEMBER;
  //       const errMessage = 'You tried to perform an invalid operation';
  //       const err = new error.InvalidOperationError(errMessage, {});
  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.InvalidOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await workspaceService.toggleRole(workspaceId, teamRole);
  //       } catch (e) {
  //         assert.instanceOf(e, error.InvalidOperationError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will publish and throw an DataServiceError when workspace model throws a DataOperationError ', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const teamRole = databaseTypes.constants.ROLE.MEMBER;
  //       const errMessage = 'A DataOperationError has occurred';
  //       const err = new error.DatabaseOperationError(
  //         errMessage,
  //         'mongodDb',
  //         'updateWorkspaceById'
  //       );
  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.DatabaseOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await workspaceService.toggleRole(workspaceId, teamRole);
  //       } catch (e) {
  //         assert.instanceOf(e, error.DataServiceError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //   });
  //   context('updateWorkspaceSlug', () => {
  //     it('will update a workspace status', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const status = databaseTypes.constants.INVITATION_STATUS.ACCEPTED;

  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.resolves({
  //         _id: workspaceId,
  //         status: status,
  //       });

  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       await workspaceService.updateStatus(workspaceId, status);
  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //     });
  //     it('will update a workspace status when workspaceId is a string', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const status = databaseTypes.constants.INVITATION_STATUS.ACCEPTED;

  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.resolves({
  //         _id: workspaceId,
  //         status: status,
  //       });

  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       await workspaceService.updateStatus(workspaceId.toString(), status);
  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //     });
  //     it('will publish and rethrow an InvalidArgumentError when workspace model throws it ', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const status = databaseTypes.constants.INVITATION_STATUS.ACCEPTED;
  //       const errMessage = 'You have an invalid argument';
  //       const err = new error.InvalidArgumentError(errMessage, 'workspaceId', true);
  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.InvalidArgumentError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await workspaceService.updateStatus(workspaceId, status);
  //       } catch (e) {
  //         assert.instanceOf(e, error.InvalidArgumentError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will publish and rethrow an InvalidOperationError when workspace model throws it ', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const status = databaseTypes.constants.INVITATION_STATUS.ACCEPTED;
  //       const errMessage = 'You tried to perform an invalid operation';
  //       const err = new error.InvalidOperationError(errMessage, {});
  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.InvalidOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await workspaceService.updateStatus(workspaceId, status);
  //       } catch (e) {
  //         assert.instanceOf(e, error.InvalidOperationError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //     it('will publish and throw an DataServiceError when workspace model throws a DataOperationError ', async () => {
  //       const workspaceId = new mongooseTypes.ObjectId();
  //       const status = databaseTypes.constants.INVITATION_STATUS.ACCEPTED;
  //       const errMessage = 'A DataOperationError has occurred';
  //       const err = new error.DatabaseOperationError(
  //         errMessage,
  //         'mongodDb',
  //         'updateWorkspaceById'
  //       );
  //       const updateWorkspaceFromModelStub = sandbox.stub();
  //       updateWorkspaceFromModelStub.rejects(err);
  //       sandbox.replace(
  //         dbConnection.models.WorkspaceModel,
  //         'updateWorkspaceById',
  //         updateWorkspaceFromModelStub
  //       );

  //       function fakePublish() {
  //         /*eslint-disable  @typescript-eslint/ban-ts-comment */
  //         //@ts-ignore
  //         assert.instanceOf(this, error.DatabaseOperationError);
  //         //@ts-ignore
  //         assert.strictEqual(this.message, errMessage);
  //       }

  //       const boundPublish = fakePublish.bind(err);
  //       const publishOverride = sandbox.stub();
  //       publishOverride.callsFake(boundPublish);
  //       sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

  //       let errored = false;
  //       try {
  //         await workspaceService.updateStatus(workspaceId, status);
  //       } catch (e) {
  //         assert.instanceOf(e, error.DataServiceError);
  //         errored = true;
  //       }
  //       assert.isTrue(errored);

  //       assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
  //       assert.isTrue(publishOverride.calledOnce);
  //     });
  //   });
});

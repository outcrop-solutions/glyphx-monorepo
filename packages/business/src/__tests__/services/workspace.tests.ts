import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import {workspaceService} from '../../services';
import {v4} from 'uuid';
import {EmailClient} from 'email';

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

      sandbox.replace(dbConnection.models.WorkspaceModel, 'count', getWorkspaceCountStub);

      const numWorkspaces = await workspaceService.countWorkspaces(slug);
      assert.isOk(numWorkspaces);
      assert.strictEqual(numWorkspaces, numWorks);

      assert.isTrue(getWorkspaceCountStub.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const slug = 'testSlug';
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'count');
      const countWorkspacesFromModelStub = sandbox.stub();
      countWorkspacesFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'count', countWorkspacesFromModelStub);
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
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceName = 'testWorkspaceName';
      const workspaceSlug = 'testWorkspaceSlug';
      const count = 0;
      const creatorId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const creatorEmail = 'testUserEmail';
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');

      const countWorkspacesFromServiceStub = sandbox.stub();
      countWorkspacesFromServiceStub.resolves(count as unknown as number);
      sandbox.replace(workspaceService, 'countWorkspaces', countWorkspacesFromServiceStub);

      const createWorkspaceFromModelStub = sandbox.stub();
      createWorkspaceFromModelStub.resolves({
        _id: workspaceId,
        inviteCode,
        workspaceCode,
        slug: `${workspaceSlug}-${count}`,
        creator: {
          _id: creatorId,
          email: creatorEmail,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(dbConnection.models.WorkspaceModel, 'createWorkspace', createWorkspaceFromModelStub);

      const createMemberFromModelStub = sandbox.stub();
      createMemberFromModelStub.resolves({
        _id: workspaceId,
        email: creatorEmail,
        inviter: creatorEmail,
        workspace: {
          _id: workspaceId,
        } as unknown as databaseTypes.IWorkspace,
        invitedBy: {
          _id: creatorId,
          email: creatorEmail,
        } as unknown as databaseTypes.IUser,
        member: {
          _id: creatorId,
          email: creatorEmail,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(dbConnection.models.MemberModel, 'createWorkspaceMember', createMemberFromModelStub);

      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.resolves({
        _id: workspaceId,
        inviteCode,
        workspaceCode,
        slug: `${workspaceSlug}-${count}`,
        creator: {
          _id: creatorId,
          email: creatorEmail,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

      const addMembershipFromUserModel = sandbox.stub();
      addMembershipFromUserModel.resolves();
      sandbox.replace(dbConnection.models.UserModel, 'addMembership', addMembershipFromUserModel);

      const addWorkspacesFromUserModel = sandbox.stub();
      addWorkspacesFromUserModel.resolves();
      sandbox.replace(dbConnection.models.UserModel, 'addWorkspaces', addWorkspacesFromUserModel);

      const sendStub = sandbox.stub();
      sendStub.resolves();
      sandbox.replace(EmailClient, 'sendMail', sendStub);

      const doc = await workspaceService.createWorkspace(
        creatorId.toString(),
        creatorEmail,
        workspaceName,
        workspaceSlug
      );

      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(countWorkspacesFromServiceStub.calledOnce);
      assert.isTrue(sendStub.calledOnce);
      assert.strictEqual(`${workspaceSlug}-${count}`, doc?.slug);
      assert.strictEqual(doc?.creator._id, creatorId);
    });
    it('will create Workspace with user associated as creator when creatorId is a string', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceName = 'testWorkspaceName';
      const workspaceSlug = 'testWorkspaceSlug';
      const count = 0;
      const creatorId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const creatorEmail = 'testUserEmail';
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');

      const countWorkspacesFromServiceStub = sandbox.stub();
      countWorkspacesFromServiceStub.resolves(count as unknown as number);
      sandbox.replace(workspaceService, 'countWorkspaces', countWorkspacesFromServiceStub);

      const createWorkspaceFromModelStub = sandbox.stub();
      createWorkspaceFromModelStub.resolves({
        _id: workspaceId,
        inviteCode,
        workspaceCode,
        slug: `${workspaceSlug}-${count}`,
        creator: {
          _id: creatorId,
          email: creatorEmail,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(dbConnection.models.WorkspaceModel, 'createWorkspace', createWorkspaceFromModelStub);

      const createMemberFromModelStub = sandbox.stub();
      createMemberFromModelStub.resolves({
        _id: workspaceId,
        email: creatorEmail,
        inviter: creatorEmail,
        workspace: {
          _id: workspaceId,
        } as unknown as databaseTypes.IWorkspace,
        invitedBy: {
          _id: creatorId,
          email: creatorEmail,
        } as unknown as databaseTypes.IUser,
        member: {
          _id: creatorId,
          email: creatorEmail,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(dbConnection.models.MemberModel, 'createWorkspaceMember', createMemberFromModelStub);

      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.resolves({
        _id: workspaceId,
        inviteCode,
        workspaceCode,
        slug: `${workspaceSlug}-${count}`,
        creator: {
          _id: creatorId,
          email: creatorEmail,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

      const addMembershipFromUserModel = sandbox.stub();
      addMembershipFromUserModel.resolves();
      sandbox.replace(dbConnection.models.UserModel, 'addMembership', addMembershipFromUserModel);

      const addWorkspacesFromUserModel = sandbox.stub();
      addWorkspacesFromUserModel.resolves();
      sandbox.replace(dbConnection.models.UserModel, 'addWorkspaces', addWorkspacesFromUserModel);

      const sendStub = sandbox.stub();
      sendStub.resolves();
      sandbox.replace(EmailClient, 'sendMail', sendStub);

      const doc = await workspaceService.createWorkspace(
        creatorId.toString(),
        creatorEmail,
        workspaceName,
        workspaceSlug
      );

      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(countWorkspacesFromServiceStub.calledOnce);
      assert.isTrue(sendStub.calledOnce);
      assert.strictEqual(`${workspaceSlug}-${count}`, doc?.slug);
      assert.strictEqual(doc?.creator._id, creatorId);
    });
    it('will publish and rethrow a DataServiceError when workspace service throws it ', async () => {
      const workspaceName = 'testWorkspaceName';
      const workspaceSlug = 'testWorkspaceSlug';
      const creatorId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const creatorEmail = 'testUserEmail';
      const errMessage = 'You have an invalid argument';
      const err = new error.DataServiceError(errMessage, 'workspace', 'countWorkspaces', {slug: workspaceSlug});

      const countWorkspacesFromServiceStub = sandbox.stub();
      countWorkspacesFromServiceStub.rejects(err);
      sandbox.replace(workspaceService, 'countWorkspaces', countWorkspacesFromServiceStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.DataServiceError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await workspaceService.createWorkspace(creatorId.toString(), creatorEmail, workspaceName, workspaceSlug);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(countWorkspacesFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow a DataValidationError when workspace model throws it', async () => {
      const workspaceName = 'testWorkspaceName';
      const workspaceSlug = 'testWorkspaceSlug';
      const creatorId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const creatorEmail = 'testUserEmail';
      const count = 0;
      const errMessage = 'You have an invalid document';
      const err = new error.DataValidationError(errMessage, 'IWorkspaceDocument', true);

      const countWorkspacesFromServiceStub = sandbox.stub();
      countWorkspacesFromServiceStub.resolves(count as unknown as number);
      sandbox.replace(workspaceService, 'countWorkspaces', countWorkspacesFromServiceStub);

      const createWorkspaceFromModelStub = sandbox.stub();
      createWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'createWorkspace', createWorkspaceFromModelStub);

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
        await workspaceService.createWorkspace(creatorId.toString(), creatorEmail, workspaceName, workspaceSlug);
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(countWorkspacesFromServiceStub.calledOnce);
      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an UnexpectedError when underlying workspace model throws it ', async () => {
      const workspaceName = 'testWorkspaceName';
      const workspaceSlug = 'testWorkspaceSlug';
      const creatorId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const creatorEmail = 'testUserEmail';
      const count = 0;
      const errMessage = 'You have an invalid document';
      const err = new error.UnexpectedError(errMessage);

      const countWorkspacesFromServiceStub = sandbox.stub();
      countWorkspacesFromServiceStub.resolves(count as unknown as number);
      sandbox.replace(workspaceService, 'countWorkspaces', countWorkspacesFromServiceStub);

      const createWorkspaceFromModelStub = sandbox.stub();
      createWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'createWorkspace', createWorkspaceFromModelStub);

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
        await workspaceService.createWorkspace(creatorId.toString(), creatorEmail, workspaceName, workspaceSlug);
      } catch (e) {
        assert.instanceOf(e, error.UnexpectedError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(countWorkspacesFromServiceStub.calledOnce);
      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when workspace model throws a DataOperationError ', async () => {
      const workspaceName = 'testWorkspaceName';
      const workspaceSlug = 'testWorkspaceSlug';
      const creatorId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const count = 0;
      const creatorEmail = 'testUserEmail';
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(errMessage, 'mongodDb', 'updateWorkspaceById');

      const countWorkspacesFromServiceStub = sandbox.stub();
      countWorkspacesFromServiceStub.resolves(count as unknown as number);
      sandbox.replace(workspaceService, 'countWorkspaces', countWorkspacesFromServiceStub);

      const createWorkspaceFromModelStub = sandbox.stub();
      createWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'createWorkspace', createWorkspaceFromModelStub);

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
        await workspaceService.createWorkspace(creatorId.toString(), creatorEmail, workspaceName, workspaceSlug);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(countWorkspacesFromServiceStub.calledOnce);
      assert.isTrue(createWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('deleteWorkspace', () => {
    it('should update a workspace deletedAt', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

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
            member: userId,
          } as unknown as databaseTypes.IMember,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(workspaceService, 'getOwnWorkspace', getWorkspaceFromModelStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();

      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      // remove workspaces from user
      const removeUserWorkspacesFromModelStub = sandbox.stub();
      removeUserWorkspacesFromModelStub.resolves();

      sandbox.replace(dbConnection.models.UserModel, 'removeWorkspaces', removeUserWorkspacesFromModelStub);

      // remove membership from user
      const removeUserMembershipFromModelStub = sandbox.stub();
      removeUserMembershipFromModelStub.resolves();

      sandbox.replace(dbConnection.models.UserModel, 'removeMembership', removeUserMembershipFromModelStub);

      // delete all projects associated with workspace
      const updateMemberWithFilterStub = sandbox.stub();
      updateMemberWithFilterStub.resolves();

      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberWithFilterStub);

      // delete all projects associated with workspace
      const updateProjectWithFilterStub = sandbox.stub();
      updateProjectWithFilterStub.resolves();

      sandbox.replace(dbConnection.models.ProjectModel, 'updateProjectWithFilter', updateProjectWithFilterStub);

      const doc = await workspaceService.deleteWorkspace(userId.toString(), userEmail, workspaceSlug);

      assert.isOk(doc);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(removeUserWorkspacesFromModelStub.calledOnce);
      assert.isTrue(removeUserMembershipFromModelStub.calledOnce);
      assert.isTrue(updateMemberWithFilterStub.calledOnce);
    });
    it('should update a workspace deletedAt wehn userId is a string', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

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
            member: userId,
          } as unknown as databaseTypes.IMember,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(workspaceService, 'getOwnWorkspace', getWorkspaceFromModelStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves();

      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      // remove workspaces from user
      const removeUserWorkspacesFromModelStub = sandbox.stub();
      removeUserWorkspacesFromModelStub.resolves();

      sandbox.replace(dbConnection.models.UserModel, 'removeWorkspaces', removeUserWorkspacesFromModelStub);

      // remove membership from user
      const removeUserMembershipFromModelStub = sandbox.stub();
      removeUserMembershipFromModelStub.resolves();

      sandbox.replace(dbConnection.models.UserModel, 'removeMembership', removeUserMembershipFromModelStub);

      // delete all projects associated with workspace
      const updateMemberWithFilterStub = sandbox.stub();
      updateMemberWithFilterStub.resolves();

      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberWithFilterStub);

      // delete all projects associated with workspace
      const updateProjectWithFilterStub = sandbox.stub();
      updateProjectWithFilterStub.resolves();

      sandbox.replace(dbConnection.models.ProjectModel, 'updateProjectWithFilter', updateProjectWithFilterStub);

      const doc = await workspaceService.deleteWorkspace(userId.toString(), userEmail, workspaceSlug);

      assert.isOk(doc);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(removeUserWorkspacesFromModelStub.calledOnce);
      assert.isTrue(removeUserMembershipFromModelStub.calledOnce);
      assert.isTrue(updateMemberWithFilterStub.calledOnce);
    });

    // getOwnWorkspace fails
    it('will return null, and publish DataNotFoundError if getOwnWorkspace throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'slug', {
        workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.rejects(err);
      sandbox.replace(workspaceService, 'getOwnWorkspace', getWorkspaceFromServiceStub);

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

      const slug = await workspaceService.deleteWorkspace(userId.toString(), userEmail, workspaceSlug);

      assert.notOk(slug);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish DataNotFoundError if getOwnWorkspace returns null', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'slug', {
        workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves(null);
      sandbox.replace(workspaceService, 'getOwnWorkspace', getWorkspaceFromServiceStub);

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

      const slug = await workspaceService.deleteWorkspace(userId.toString(), userEmail, workspaceSlug);

      assert.notOk(slug);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish InvalidArgumentError if getOwnWorkspace throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidArgumentError(errMessage, 'slug', {
        workspaceSlug,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.rejects(err);
      sandbox.replace(workspaceService, 'getOwnWorkspace', getWorkspaceFromServiceStub);

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

      const slug = await workspaceService.deleteWorkspace(userId.toString(), userEmail, workspaceSlug);

      assert.notOk(slug);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will re-publish DataServiceError if getOwnWorkspace throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataServiceError(errMessage, 'workspace', 'getWorkspace', {userEmail});

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.rejects(err);
      sandbox.replace(workspaceService, 'getOwnWorkspace', getWorkspaceFromServiceStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.DataServiceError);

        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await workspaceService.deleteWorkspace(userId.toString(), userEmail, workspaceSlug);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // delete workspace fails
    it('will return null, and publish InvalidArgumentError if updateWorkspaceByFilter in underlying model throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
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
            deletedAt: new Date(),
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(workspaceService, 'getOwnWorkspace', getWorkspaceFromServiceStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

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

      const slug = await workspaceService.deleteWorkspace(userId.toString(), userEmail, workspaceSlug);

      assert.notOk(slug);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish InvalidOperationError if updateWorkspaceByFilter in underlying model throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
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
            deletedAt: new Date(),
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(workspaceService, 'getOwnWorkspace', getWorkspaceFromServiceStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

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

      const slug = await workspaceService.deleteWorkspace(userId.toString(), userEmail, workspaceSlug);

      assert.notOk(slug);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will throw and publish DataServiceError if updateWorkspaceByFilter in underlying model throws DatabaseOperationError', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'updateWorkspaceByFilter', {
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
            deletedAt: new Date(),
          } as unknown as databaseTypes.IUser,
        ],
      } as unknown as databaseTypes.IWorkspace);

      sandbox.replace(workspaceService, 'getOwnWorkspace', getWorkspaceFromServiceStub);

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceByFilter', updateWorkspaceFromModelStub);

      const publishOverride = sandbox.stub();
      publishOverride.resolves();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await workspaceService.deleteWorkspace(userId.toString(), userEmail, workspaceSlug);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getOwnWorkspace', () => {
    it('should get default user workspace by filter if all condiitons match happy case', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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
                deletedAt: undefined,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });

      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      const workspace = await workspaceService.getOwnWorkspace(userId.toString(), userEmail, workspaceSlug);
      assert.isOk(workspace);
      assert.strictEqual(workspace?.slug?.toString(), workspaceSlug.toString());

      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member email match', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const differentUserId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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

      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      const workspace = await workspaceService.getOwnWorkspace(userId.toString(), userEmail, workspaceSlug);
      assert.isNotOk(workspace);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member email match that is also OWNER', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const differentUserId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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

      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      const workspace = await workspaceService.getOwnWorkspace(userId.toString(), userEmail, workspaceSlug);
      assert.isNotOk(workspace);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member owner match that has not been deleted', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const differentUserId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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

      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      const workspace = await workspaceService.getOwnWorkspace(userId.toString(), userEmail, workspaceSlug);
      assert.isNotOk(workspace);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('will log the failure, return null and publish DataNotFoundError if the underlying model throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'email', {userEmail});
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', getWorkspaceFromModelStub);
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

      const workspace = await workspaceService.getOwnWorkspace(userId.toString(), userEmail, workspaceSlug);

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure, return null and publish InvalidArgumentError if the underlying model throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidArgumentError(errMessage, 'email', {
        userEmail,
      });
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', getWorkspaceFromModelStub);
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

      const workspace = await workspaceService.getOwnWorkspace(userId.toString(), userEmail, workspaceSlug);

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const errMessage = 'Something bad has happened';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'queryWorkspaces');
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', getWorkspaceFromModelStub);
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
        await workspaceService.getOwnWorkspace(userId.toString(), userEmail, workspaceSlug);
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
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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

      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      const workspace = await workspaceService.getInvitation(workspaceInviteCode);
      assert.isOk(workspace);
      assert.strictEqual(workspace?.inviteCode?.toString(), workspaceInviteCode.toString());

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
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', getWorkspaceFromModelStub);
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

      const workspace = await workspaceService.getInvitation(workspaceInviteCode);

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
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', getWorkspaceFromModelStub);
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

      const workspace = await workspaceService.getInvitation(workspaceInviteCode);

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const workspaceInviteCode = 'testInviteCode';
      const errMessage = 'Something bad has happened';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'queryWorkspaces');
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', getWorkspaceFromModelStub);
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
    it('should get non-deleted workspaces by slug', async () => {
      const workspaceId = new mongooseTypes.ObjectId().toString();

      const getWorkspaceByIdFromModelStub = sandbox.stub();
      getWorkspaceByIdFromModelStub.resolves({
        _id: workspaceId.toString(),
        deletedAt: undefined,
      });

      sandbox.replace(dbConnection.models.WorkspaceModel, 'getWorkspaceById', getWorkspaceByIdFromModelStub);

      const workspace = await workspaceService.getSiteWorkspace(workspaceId.toString());
      assert.isOk(workspace);
      assert.strictEqual(workspace?._id?.toString(), workspaceId);

      assert.isTrue(getWorkspaceByIdFromModelStub.calledOnce);
    });
    it('will log the failure, return null and publish DataNotFoundError if the underlying model throws one', async () => {
      const workspaceSlug = 'testSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'slug', {
        slug: workspaceSlug,
      });

      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'getWorkspaceById', getWorkspaceFromModelStub);
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
      sandbox.replace(dbConnection.models.WorkspaceModel, 'getWorkspaceById', getWorkspaceFromModelStub);
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

      const workspace = await workspaceService.getSiteWorkspace(workspaceSlug);

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const workspaceSlug = 'testSlug';
      const errMessage = 'Something bad has happened';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'getWorkspaceById');
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'getWorkspaceById', getWorkspaceFromModelStub);
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
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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
                deletedAt: undefined,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });

      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      const workspace = await workspaceService.getWorkspace(userEmail, workspaceId.toString());
      assert.isOk(workspace);
      assert.strictEqual(workspace?.slug?.toString(), workspaceSlug.toString());

      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member email match', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const differentUserId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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

      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      const workspace = await workspaceService.getWorkspace(userEmail, workspaceId.toString());
      assert.isNotOk(workspace);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member match that has not been deleted', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const differentUserId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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

      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      const workspace = await workspaceService.getWorkspace(userEmail, workspaceId.toString());
      assert.isNotOk(workspace);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('will log the failure, return null and publish DataNotFoundError if the underlying model throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'email', {userEmail});
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', getWorkspaceFromModelStub);
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

      const workspace = await workspaceService.getWorkspace(userEmail, workspaceId.toString());

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure, return null and publish InvalidArgumentError if the underlying model throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidArgumentError(errMessage, 'email', {
        userEmail,
      });
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', getWorkspaceFromModelStub);
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

      const workspace = await workspaceService.getWorkspace(userEmail, workspaceId.toString());

      assert.notOk(workspace);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId = new mongooseTypes.ObjectId();
      const errMessage = 'Something bad has happened';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'queryWorkspaces');
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', getWorkspaceFromModelStub);
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
        await workspaceService.getWorkspace(userEmail, workspaceId.toString());
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
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves([
        {
          _id: workspaceId,
          slug: workspaceSlug,
          members: [
            {
              _id: userId,
              email: userEmail,
              status: databaseTypes.constants.INVITATION_STATUS.ACCEPTED,
              deletedAt: undefined,
            } as unknown as databaseTypes.IUser,
          ],
        },
      ] as unknown as databaseTypes.IWorkspace[]);

      sandbox.replace(dbConnection.models.WorkspaceModel, 'aggregate', queryWorkspacesFromModelStub);

      const workspaces = await workspaceService.getWorkspaces(userId.toString(), userEmail);
      assert.isOk(workspaces);
      assert.strictEqual(workspaces![0]?.slug?.toString(), workspaceSlug.toString());

      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member email match', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const differentUserId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves([]);

      sandbox.replace(dbConnection.models.WorkspaceModel, 'aggregate', queryWorkspacesFromModelStub);

      const workspaces = await workspaceService.getWorkspaces(userId.toString(), userEmail);
      assert.isNotOk(workspaces);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('should return null if no workspaces contain a member match that has not been deleted', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const differentUserId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves([]);

      sandbox.replace(dbConnection.models.WorkspaceModel, 'aggregate', queryWorkspacesFromModelStub);

      const workspaces = await workspaceService.getWorkspaces(userId.toString(), userEmail);
      assert.isNotOk(workspaces);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
    });
    it('will log the failure, return null and publish DataNotFoundError if the underlying model throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'email', {userEmail});
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'aggregate', getWorkspaceFromModelStub);
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

      const workspaces = await workspaceService.getWorkspaces(userId.toString(), userEmail);

      assert.notOk(workspaces);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure, return null and publish InvalidArgumentError if the underlying model throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidArgumentError(errMessage, 'email', {
        userEmail,
      });
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'aggregate', getWorkspaceFromModelStub);
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

      const workspaces = await workspaceService.getWorkspaces(userId.toString(), userEmail);

      assert.notOk(workspaces);

      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const errMessage = 'Something bad has happened';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'aggregate');
      const getWorkspaceFromModelStub = sandbox.stub();
      getWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'aggregate', getWorkspaceFromModelStub);
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
        await workspaceService.getWorkspaces(userId.toString(), userEmail);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('inviteUsers', () => {
    // happy case
    it('should create members if they do not already exist and attach them to the workspace', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const count = 1;

      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testuserEmail';
      const memberId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const memberEmail = 'testMemberEmail';
      const memberRole = databaseTypes.constants.ROLE.MEMBER;
      const members = [{email: memberEmail, teamRole: memberRole}];
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const workspaceName = 'testWorkspaceName';
      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        name: workspaceName,
        inviteCode,
        workspaceCode,
        slug: `${workspaceSlug}-${count}`,
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(workspaceService, 'getWorkspace', getWorkspaceFromServiceStub);

      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.resolves({
        _id: userId,
        email: userEmail,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);

      const createMembersFromModel = sandbox.stub();
      createMembersFromModel.resolves([{_id: memberId, email: memberEmail, teamRole: memberRole}]);
      sandbox.replace(dbConnection.models.MemberModel, 'create', createMembersFromModel);

      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.resolves({
        _id: workspaceId,
        inviteCode,
        workspaceCode,
        name: workspaceName,
        slug: `${workspaceSlug}-${count}`,
        members: [
          {
            _id: memberId,
            email: memberEmail,
          },
        ] as unknown as databaseTypes.IMember[],
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

      const sendStub = sandbox.stub();
      sendStub.resolves();
      sandbox.replace(EmailClient, 'sendMail', sendStub);

      const result = await workspaceService.inviteUsers(
        userId.toString(),
        userEmail,
        members,
        `${workspaceSlug}-${count}`
      );

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(createMembersFromModel.calledOnce);
      assert.isTrue(addMembersFromWorkspaceModel.calledOnce);
      assert.isTrue(sendStub.calledOnce);
      assert.strictEqual(result!.members![0]._id, memberId);
      assert.strictEqual(result!.members![0].email, memberEmail);
      assert.strictEqual(result!.members!.length, 1);
    });
    it('should create members if they do not already exist and attach them to the workspace when the userId is a string', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const count = 1;

      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testuserEmail';
      const memberId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const memberEmail = 'testMemberEmail';
      const memberRole = databaseTypes.constants.ROLE.MEMBER;
      const members = [{email: memberEmail, teamRole: memberRole}];
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const workspaceName = 'testWorkspaceName';
      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        name: workspaceName,
        inviteCode,
        workspaceCode,
        slug: `${workspaceSlug}-${count}`,
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(workspaceService, 'getWorkspace', getWorkspaceFromServiceStub);

      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.resolves({
        _id: userId,
        email: userEmail,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);

      const createMembersFromModel = sandbox.stub();
      createMembersFromModel.resolves([{_id: memberId, email: memberEmail, teamRole: memberRole}]);
      sandbox.replace(dbConnection.models.MemberModel, 'create', createMembersFromModel);

      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.resolves({
        _id: workspaceId,
        inviteCode,
        workspaceCode,
        name: workspaceName,
        slug: `${workspaceSlug}-${count}`,
        members: [
          {
            _id: memberId,
            email: memberEmail,
          },
        ] as unknown as databaseTypes.IMember[],
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

      const sendStub = sandbox.stub();
      sendStub.resolves();
      sandbox.replace(EmailClient, 'sendMail', sendStub);

      const result = await workspaceService.inviteUsers(
        userId.toString(),
        userEmail,
        members,
        `${workspaceSlug}-${count}`
      );

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(createMembersFromModel.calledOnce);
      assert.isTrue(addMembersFromWorkspaceModel.calledOnce);
      assert.isTrue(sendStub.calledOnce);
      assert.strictEqual(result!.members![0]._id, memberId);
      assert.strictEqual(result!.members![0].email, memberEmail);
      assert.strictEqual(result!.members!.length, 1);
    });
    // workspace service fails
    it('will publish and rethrow a DataServiceError when workspace service throws it', async () => {
      const workspaceSlug = 'testWorkspaceSlug';
      const count = 1;

      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testuserEmail';
      const memberEmail = 'testMemberEmail';
      const memberRole = databaseTypes.constants.ROLE.MEMBER;
      const members = [{email: memberEmail, teamRole: memberRole}];
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataServiceError(errMessage, 'workspace', 'getWorkspace', {userEmail});

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.rejects(err);
      sandbox.replace(workspaceService, 'getWorkspace', getWorkspaceFromServiceStub);

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.DataServiceError);

        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await workspaceService.inviteUsers(userId.toString(), userEmail, members, `${workspaceSlug}-${count}`);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow a DataNotFoundError when workspace service returns null', async () => {
      const workspaceSlug = 'testWorkspaceSlug';
      const count = 1;

      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testuserEmail';
      const memberEmail = 'testMemberEmail';
      const memberRole = databaseTypes.constants.ROLE.MEMBER;
      const members = [{email: memberEmail, teamRole: memberRole}];

      const errMessage = 'Cannot find the user';

      const err = new error.DataNotFoundError(errMessage, 'user', 'getUserById', {userId, userEmail});

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves(null);
      sandbox.replace(workspaceService, 'getWorkspace', getWorkspaceFromServiceStub);

      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.resolves({
        _id: userId,
        email: userEmail,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);

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

      const memberResult = await workspaceService.inviteUsers(
        userId.toString(),
        userEmail,
        members,
        `${workspaceSlug}-${count}`
      );

      assert.isNotOk(memberResult);
      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    // user model fails
    it('will publish and rethrow a DataNotFoundError when user model throws it', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const count = 1;

      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testuserEmail';
      const memberEmail = 'testMemberEmail';
      const memberRole = databaseTypes.constants.ROLE.MEMBER;
      const members = [{email: memberEmail, teamRole: memberRole}];
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const workspaceName = 'testWorkspaceName';

      const errMessage = 'Cannot find the user';

      const err = new error.DataNotFoundError(errMessage, 'user', 'getUserById', {userId, userEmail});

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        name: workspaceName,
        inviteCode,
        workspaceCode,
        slug: `${workspaceSlug}-${count}`,
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(workspaceService, 'getWorkspace', getWorkspaceFromServiceStub);

      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);

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

      const memberResult = await workspaceService.inviteUsers(
        userId.toString(),
        userEmail,
        members,
        `${workspaceSlug}-${count}`
      );

      assert.isNotOk(memberResult);
      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw a DataServiceError when user model throws DatabaseOperationError', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const count = 1;

      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testuserEmail';
      const memberEmail = 'testMemberEmail';
      const memberRole = databaseTypes.constants.ROLE.MEMBER;
      const members = [{email: memberEmail, teamRole: memberRole}];
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const workspaceName = 'testWorkspaceName';

      const errMessage = 'Cannot find the user';

      const err = new error.DatabaseOperationError(errMessage, 'user', 'getUserById', {userId, userEmail});

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        name: workspaceName,
        inviteCode,
        workspaceCode,
        slug: `${workspaceSlug}-${count}`,
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(workspaceService, 'getWorkspace', getWorkspaceFromServiceStub);

      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);

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
        await workspaceService.inviteUsers(userId.toString(), userEmail, members, `${workspaceSlug}-${count}`);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    // member model fails
    it('will publish and throw a DataServiceError when member model create fails', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const count = 1;

      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testuserEmail';
      const memberEmail = 'testMemberEmail';
      const memberRole = databaseTypes.constants.ROLE.MEMBER;
      const members = [{email: memberEmail, teamRole: memberRole}];
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const workspaceName = 'testWorkspaceName';

      const errMessage = 'Cannot find the user';

      const err = new error.UnexpectedError(errMessage);

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        name: workspaceName,
        inviteCode,
        workspaceCode,
        slug: `${workspaceSlug}-${count}`,
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(workspaceService, 'getWorkspace', getWorkspaceFromServiceStub);

      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.resolves({
        _id: userId,
        email: userEmail,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);

      const createMembersFromModelStub = sandbox.stub();
      createMembersFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'create', createMembersFromModelStub);

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
        await workspaceService.inviteUsers(userId.toString(), userEmail, members, `${workspaceSlug}-${count}`);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(createMembersFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    // workspace model fails
    it('will publish and rethrow a InvalidArgumentError when workspace model throws it', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const count = 1;

      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testuserEmail';
      const memberId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const memberEmail = 'testMemberEmail';
      const memberRole = databaseTypes.constants.ROLE.MEMBER;
      const members = [{email: memberEmail, teamRole: memberRole}];
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const workspaceName = 'testWorkspaceName';

      const errMessage = 'Members must have length of at least 1';

      const err = new error.InvalidArgumentError(errMessage, 'members', [], {
        userId,
        userEmail,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        name: workspaceName,
        inviteCode,
        workspaceCode,
        slug: `${workspaceSlug}-${count}`,
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(workspaceService, 'getWorkspace', getWorkspaceFromServiceStub);

      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.resolves({
        _id: userId,
        email: userEmail,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);

      const createMembersFromModel = sandbox.stub();
      createMembersFromModel.resolves([{_id: memberId, email: memberEmail, teamRole: memberRole}]);
      sandbox.replace(dbConnection.models.MemberModel, 'create', createMembersFromModel);

      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

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

      const memberResult = await workspaceService.inviteUsers(
        userId.toString(),
        userEmail,
        members,
        `${workspaceSlug}-${count}`
      );

      assert.isNotOk(memberResult);
      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow a DataValidationError when workspace model throws it', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const count = 1;

      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testuserEmail';
      const memberId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const memberEmail = 'testMemberEmail';
      const memberRole = databaseTypes.constants.ROLE.MEMBER;
      const members = [{email: memberEmail, teamRole: memberRole}];
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const workspaceName = 'testWorkspaceName';

      const errMessage = 'Members must have length of at least 1';

      const err = new error.DataValidationError(errMessage, 'members', [], {
        userId,
        userEmail,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        name: workspaceName,
        inviteCode,
        workspaceCode,
        slug: `${workspaceSlug}-${count}`,
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(workspaceService, 'getWorkspace', getWorkspaceFromServiceStub);

      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.resolves({
        _id: userId,
        email: userEmail,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);

      const createMembersFromModel = sandbox.stub();
      createMembersFromModel.resolves([{_id: memberId, email: memberEmail, teamRole: memberRole}]);
      sandbox.replace(dbConnection.models.MemberModel, 'create', createMembersFromModel);

      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

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

      const memberResult = await workspaceService.inviteUsers(
        userId.toString(),
        userEmail,
        members,
        `${workspaceSlug}-${count}`
      );

      assert.isNotOk(memberResult);
      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow a DataNotFoundError when workspace model throws it', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const count = 1;

      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testuserEmail';
      const memberId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const memberEmail = 'testMemberEmail';
      const memberRole = databaseTypes.constants.ROLE.MEMBER;
      const members = [{email: memberEmail, teamRole: memberRole}];
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const workspaceName = 'testWorkspaceName';

      const errMessage = 'Members must have length of at least 1';

      const err = new error.DataNotFoundError(errMessage, 'members', [], {
        userId,
        userEmail,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        name: workspaceName,
        inviteCode,
        workspaceCode,
        slug: `${workspaceSlug}-${count}`,
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(workspaceService, 'getWorkspace', getWorkspaceFromServiceStub);

      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.resolves({
        _id: userId,
        email: userEmail,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);

      const createMembersFromModel = sandbox.stub();
      createMembersFromModel.resolves([{_id: memberId, email: memberEmail, teamRole: memberRole}]);
      sandbox.replace(dbConnection.models.MemberModel, 'create', createMembersFromModel);

      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

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

      const memberResult = await workspaceService.inviteUsers(
        userId.toString(),
        userEmail,
        members,
        `${workspaceSlug}-${count}`
      );

      assert.isNotOk(memberResult);
      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish a DataServiceError when workspace model throws a DatabaseOperationError', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const count = 1;

      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testuserEmail';
      const memberId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const memberEmail = 'testMemberEmail';
      const memberRole = databaseTypes.constants.ROLE.MEMBER;
      const members = [{email: memberEmail, teamRole: memberRole}];
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const workspaceName = 'testWorkspaceName';

      const errMessage = 'Cannot find the user';

      const err = new error.DatabaseOperationError(errMessage, 'mongoDB', 'addMembers', {
        userEmail,
        inviteCode,
        workspaceCode,
      });

      const getWorkspaceFromServiceStub = sandbox.stub();
      getWorkspaceFromServiceStub.resolves({
        _id: workspaceId,
        name: workspaceName,
        inviteCode,
        workspaceCode,
        slug: `${workspaceSlug}-${count}`,
      } as unknown as databaseTypes.IWorkspace);
      sandbox.replace(workspaceService, 'getWorkspace', getWorkspaceFromServiceStub);

      const getUserFromModelStub = sandbox.stub();
      getUserFromModelStub.resolves({
        _id: userId,
        email: userEmail,
      } as unknown as databaseTypes.IUser);
      sandbox.replace(dbConnection.models.UserModel, 'getUserById', getUserFromModelStub);

      const createMembersFromModel = sandbox.stub();
      createMembersFromModel.resolves([{_id: memberId, email: memberEmail, teamRole: memberRole}]);
      sandbox.replace(dbConnection.models.MemberModel, 'create', createMembersFromModel);

      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

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
        await workspaceService.inviteUsers(userId.toString(), userEmail, members, `${workspaceSlug}-${count}`);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(getWorkspaceFromServiceStub.calledOnce);
      assert.isTrue(getUserFromModelStub.calledOnce);
      assert.isTrue(createMembersFromModel.calledOnce);
      assert.isTrue(addMembersFromWorkspaceModel.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('isWorkspaceOwner', () => {
    it('should return true when given user is the owner of the workspace', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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

      const result = await workspaceService.isWorkspaceOwner(userEmail, workspace);
      assert.isTrue(result);
    });
    it('should return false when the user is not the workspace owner', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
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

      const result = await workspaceService.isWorkspaceOwner(userEmail, workspace);
      assert.isFalse(result);
    });
  });
  context('joinWorkspace', () => {
    // happy case
    it('will create member, add it to the workspace, and change their invitation status to accepted when member does not exist', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const joinedDate = new Date();
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const memberId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const memberStatus = databaseTypes.constants.INVITATION_STATUS.PENDING;
      const memberEmail = 'testmember@gmail.com';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            id: workspaceId.toString(),
            slug: workspaceSlug,
            workspaceCode: workspaceCode,
            inviteCode: inviteCode,
            creator: {
              _id: userId.toString(),
              email: userEmail,
            } as unknown as databaseTypes.IUser,
            members: [
              {
                id: userId.toString(),
                email: userEmail,
                invitedAt: joinedDate,
                joinedDate: joinedDate,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
                status: memberStatus,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      // triggers member create
      const memberEmailExistsStub = sandbox.stub();
      memberEmailExistsStub.resolves(false);
      sandbox.replace(dbConnection.models.MemberModel, 'memberExists', memberEmailExistsStub);

      // create member
      const createMemberFromModelStub = sandbox.stub();
      createMemberFromModelStub.resolves({
        id: memberId.toString(),
        email: memberEmail,
        invitedAt: joinedDate,
        joinedDate: joinedDate,
        teamRole: databaseTypes.constants.ROLE.OWNER,
        deletedAt: null,
        status: memberStatus,
      } as unknown as databaseTypes.IMember);
      sandbox.replace(dbConnection.models.MemberModel, 'createWorkspaceMember', createMemberFromModelStub);

      // update member
      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves({
        id: memberId.toString(),
        email: memberEmail,
        invitedAt: joinedDate,
        joinedDate: joinedDate,
        teamRole: databaseTypes.constants.ROLE.OWNER,
        deletedAt: null,
        status: memberStatus,
      } as unknown as databaseTypes.IMember);

      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.resolves({});
      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

      const workspace = await workspaceService.joinWorkspace(
        workspaceCode,
        userEmail,
        memberId.toString(),
        invitedBy.toString()
      );

      assert.isOk(workspace);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(memberEmailExistsStub.calledOnce);
      assert.isTrue(createMemberFromModelStub.calledOnce);
      assert.isTrue(addMembersFromWorkspaceModel.calledOnce);
    });
    it('will update member, add it to the workspace, and change their invitation status to accepted when member already exists', async () => {
      const workspaceId = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const joinedDate = new Date();
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const userId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const memberStatus = databaseTypes.constants.INVITATION_STATUS.PENDING;
      const memberEmail = 'testmember@gmail.com';

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            workspaceCode: workspaceCode,
            inviteCode: inviteCode,
            creator: {
              _id: userId,
              email: userEmail,
            } as unknown as databaseTypes.IUser,
            members: [
              {
                _id: userId,
                email: userEmail,
                invitedAt: joinedDate,
                joinedDate: joinedDate,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
                status: memberStatus,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      // triggers member update
      const memberEmailExistsStub = sandbox.stub();
      memberEmailExistsStub.resolves(true);
      sandbox.replace(dbConnection.models.MemberModel, 'memberExists', memberEmailExistsStub);

      // update member
      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves({
        _id: memberId,
        email: memberEmail,
        invitedAt: joinedDate,
        joinedDate: joinedDate,
        teamRole: databaseTypes.constants.ROLE.OWNER,
        deletedAt: null,
        status: memberStatus,
      } as unknown as databaseTypes.IMember);
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.resolves({});
      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

      const workspace = await workspaceService.joinWorkspace(
        workspaceCode,
        userEmail,
        memberId.toString(),
        invitedBy.toString()
      );

      assert.isOk(workspace);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(memberEmailExistsStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
    });
    // queryWorkspaces fails
    it('will publish and rethrow a InvalidArgumentError when workspace model throws it', async () => {
      const workspaceCode = v4().replaceAll('-', '');
      const userEmail = 'testemail@gmail.com';
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the workspace';
      const err = new error.InvalidArgumentError(errMessage, 'email', {
        userEmail,
      });

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

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

      const date = await workspaceService.joinWorkspace(
        workspaceCode,
        userEmail,
        memberId.toString(),
        invitedBy.toString()
      );
      assert.isNotOk(date);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow a DataNotFoundError when workspace model throws it', async () => {
      const workspaceCode = v4().replaceAll('-', '');
      const userEmail = 'testemail@gmail.com';
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the workspace';
      const err = new error.DataNotFoundError(errMessage, 'email', {
        userEmail,
      });

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

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

      const date = await workspaceService.joinWorkspace(
        workspaceCode,
        userEmail,
        memberId.toString(),
        invitedBy.toString()
      );
      assert.isNotOk(date);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish a DataServiceError when workspace model throws a DatabaseOperationError', async () => {
      const workspaceCode = v4().replaceAll('-', '');
      const userEmail = 'testemail@gmail.com';
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the workspace';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'queryWorkspaces');

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

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
        await workspaceService.joinWorkspace(workspaceCode, userEmail, memberId.toString(), invitedBy.toString());
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // memberEmailExists fails
    it('will publish a DataServiceError when member model throws a DatabaseOperationError', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const joinedDate = new Date();
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const memberStatus = databaseTypes.constants.INVITATION_STATUS.PENDING;

      const errMessage = 'Cannot find the workspace';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'queryWorkspaces');

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            workspaceCode: workspaceCode,
            inviteCode: inviteCode,
            creator: {
              _id: userId,
              email: userEmail,
            } as unknown as databaseTypes.IUser,
            members: [
              {
                _id: userId,
                email: userEmail,
                invitedAt: joinedDate,
                joinedDate: joinedDate,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
                status: memberStatus,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      // triggers member create
      const memberEmailExistsStub = sandbox.stub();
      memberEmailExistsStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'memberExists', memberEmailExistsStub);

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
        await workspaceService.joinWorkspace(workspaceCode, userEmail, memberId.toString(), invitedBy.toString());
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(memberEmailExistsStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // createMember fails
    it('will publish and rethrow an InvalidArgumentError when the member model throws it', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const joinedDate = new Date();
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const memberStatus = databaseTypes.constants.INVITATION_STATUS.PENDING;

      const errMessage = 'Cannot find the workspace';
      const err = new error.InvalidArgumentError(errMessage, 'email', {
        userEmail,
      });

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            id: workspaceId.toString(),
            slug: workspaceSlug,
            workspaceCode: workspaceCode,
            inviteCode: inviteCode,
            creator: {
              id: userId.toString(),
              email: userEmail,
            } as unknown as databaseTypes.IUser,
            members: [
              {
                id: userId.toString(),
                email: userEmail,
                invitedAt: joinedDate,
                joinedDate: joinedDate,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
                status: memberStatus,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      // triggers member create
      const memberEmailExistsStub = sandbox.stub();
      memberEmailExistsStub.resolves(false);
      sandbox.replace(dbConnection.models.MemberModel, 'memberExists', memberEmailExistsStub);

      // create member
      const createMemberFromModelStub = sandbox.stub();
      createMemberFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'createWorkspaceMember', createMemberFromModelStub);

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

      const date = await workspaceService.joinWorkspace(
        workspaceCode,
        userEmail,
        memberId.toString(),
        invitedBy.toString()
      );
      assert.isNotOk(date);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(memberEmailExistsStub.calledOnce);
      assert.isTrue(createMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when the member model throws it', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const joinedDate = new Date();
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const memberStatus = databaseTypes.constants.INVITATION_STATUS.PENDING;

      const errMessage = 'Cannot find the workspace';
      const err = new error.DataValidationError(errMessage, 'email', {
        userEmail,
      });

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            id: workspaceId.toString(),
            slug: workspaceSlug,
            workspaceCode: workspaceCode,
            inviteCode: inviteCode,
            creator: {
              id: userId.toString(),
              email: userEmail,
            } as unknown as databaseTypes.IUser,
            members: [
              {
                id: userId.toString(),
                email: userEmail,
                invitedAt: joinedDate,
                joinedDate: joinedDate,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
                status: memberStatus,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      // triggers member create
      const memberEmailExistsStub = sandbox.stub();
      memberEmailExistsStub.resolves(false);
      sandbox.replace(dbConnection.models.MemberModel, 'memberExists', memberEmailExistsStub);

      // create member
      const createMemberFromModelStub = sandbox.stub();
      createMemberFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'createWorkspaceMember', createMemberFromModelStub);

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

      const date = await workspaceService.joinWorkspace(
        workspaceCode,
        userEmail,
        memberId.toString(),
        invitedBy.toString()
      );
      assert.isNotOk(date);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(memberEmailExistsStub.calledOnce);
      assert.isTrue(createMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish a DataServiceError when member model throws a DatabaseOperationError', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const joinedDate = new Date();
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const memberStatus = databaseTypes.constants.INVITATION_STATUS.PENDING;

      const errMessage = 'Cannot find the workspace';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'queryWorkspaces');

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            workspaceCode: workspaceCode,
            inviteCode: inviteCode,
            creator: {
              _id: userId,
              email: userEmail,
            } as unknown as databaseTypes.IUser,
            members: [
              {
                _id: userId,
                email: userEmail,
                invitedAt: joinedDate,
                joinedDate: joinedDate,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
                status: memberStatus,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      // triggers member create
      const memberEmailExistsStub = sandbox.stub();
      memberEmailExistsStub.resolves(false);
      sandbox.replace(dbConnection.models.MemberModel, 'memberExists', memberEmailExistsStub);

      // create member
      const createMemberFromModelStub = sandbox.stub();
      createMemberFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'createWorkspaceMember', createMemberFromModelStub);

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
        await workspaceService.joinWorkspace(workspaceCode, userEmail, memberId.toString(), invitedBy.toString());
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(memberEmailExistsStub.calledOnce);
      assert.isTrue(createMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // updateMemberWithFilter fails
    it('will publish and rethrow an InvalidArgumentError when the member model throws it', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const joinedDate = new Date();
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const memberStatus = databaseTypes.constants.INVITATION_STATUS.PENDING;

      const errMessage = 'Cannot find the workspace';
      const err = new error.InvalidArgumentError(errMessage, 'email', {
        userEmail,
      });

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            workspaceCode: workspaceCode,
            inviteCode: inviteCode,
            creator: {
              _id: userId,
              email: userEmail,
            } as unknown as databaseTypes.IUser,
            members: [
              {
                _id: userId,
                email: userEmail,
                invitedAt: joinedDate,
                joinedDate: joinedDate,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
                status: memberStatus,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      // triggers member update
      const memberEmailExistsStub = sandbox.stub();
      memberEmailExistsStub.resolves(true);
      sandbox.replace(dbConnection.models.MemberModel, 'memberExists', memberEmailExistsStub);

      // update member
      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

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

      const date = await workspaceService.joinWorkspace(
        workspaceCode,
        userEmail,
        memberId.toString(),
        invitedBy.toString()
      );
      assert.isNotOk(date);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(memberEmailExistsStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when the member model throws it', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const joinedDate = new Date();
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const memberStatus = databaseTypes.constants.INVITATION_STATUS.PENDING;

      const errMessage = 'Cannot find the workspace';
      const err = new error.InvalidOperationError(errMessage, {
        userEmail,
      });

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            workspaceCode: workspaceCode,
            inviteCode: inviteCode,
            creator: {
              _id: userId,
              email: userEmail,
            } as unknown as databaseTypes.IUser,
            members: [
              {
                _id: userId,
                email: userEmail,
                invitedAt: joinedDate,
                joinedDate: joinedDate,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
                status: memberStatus,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      // triggers member update
      const memberEmailExistsStub = sandbox.stub();
      memberEmailExistsStub.resolves(true);
      sandbox.replace(dbConnection.models.MemberModel, 'memberExists', memberEmailExistsStub);

      // update member
      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

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

      const date = await workspaceService.joinWorkspace(
        workspaceCode,
        userEmail,
        memberId.toString(),
        invitedBy.toString()
      );
      assert.isNotOk(date);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(memberEmailExistsStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish a DataServiceError when member model throws a DatabaseOperationError', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const joinedDate = new Date();
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const memberStatus = databaseTypes.constants.INVITATION_STATUS.PENDING;

      const errMessage = 'Cannot find the workspace';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'queryWorkspaces');

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            workspaceCode: workspaceCode,
            inviteCode: inviteCode,
            creator: {
              _id: userId,
              email: userEmail,
            } as unknown as databaseTypes.IUser,
            members: [
              {
                _id: userId,
                email: userEmail,
                invitedAt: joinedDate,
                joinedDate: joinedDate,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
                status: memberStatus,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      // triggers member update
      const memberEmailExistsStub = sandbox.stub();
      memberEmailExistsStub.resolves(true);
      sandbox.replace(dbConnection.models.MemberModel, 'memberExists', memberEmailExistsStub);

      // update member
      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.MemberModel, 'updateMemberWithFilter', updateMemberFromModelStub);

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
        await workspaceService.joinWorkspace(workspaceCode, userEmail, memberId.toString(), invitedBy.toString());
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(memberEmailExistsStub.calledOnce);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    // addMembers fails
    it('will publish and rethrow an InvalidArgumentError when the workspace model throws it', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';

      const joinedDate = new Date();
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const memberEmail = 'testmember@gmail.com';
      const memberStatus = databaseTypes.constants.INVITATION_STATUS.PENDING;

      const errMessage = 'Cannot find the workspace';
      const err = new error.InvalidArgumentError(errMessage, 'email', {
        userEmail,
      });

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            workspaceCode: workspaceCode,
            inviteCode: inviteCode,
            creator: {
              _id: userId,
              email: userEmail,
            } as unknown as databaseTypes.IUser,
            members: [
              {
                _id: userId,
                email: userEmail,
                invitedAt: joinedDate,
                joinedDate: joinedDate,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
                status: memberStatus,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      // triggers member create
      const memberEmailExistsStub = sandbox.stub();
      memberEmailExistsStub.resolves(false);
      sandbox.replace(dbConnection.models.MemberModel, 'memberExists', memberEmailExistsStub);

      const createMemberFromModelStub = sandbox.stub();
      createMemberFromModelStub.resolves({
        _id: memberId,
        email: memberEmail,
        invitedAt: joinedDate,
        joinedDate: joinedDate,
        teamRole: databaseTypes.constants.ROLE.OWNER,
        deletedAt: null,
        status: memberStatus,
      } as unknown as databaseTypes.IMember);
      sandbox.replace(dbConnection.models.MemberModel, 'createWorkspaceMember', createMemberFromModelStub);

      // add members
      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

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

      const date = await workspaceService.joinWorkspace(
        workspaceCode,
        userEmail,
        memberId.toString(),
        invitedBy.toString()
      );
      assert.isNotOk(date);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(memberEmailExistsStub.calledOnce);
      assert.isTrue(createMemberFromModelStub.calledOnce);
      assert.isTrue(addMembersFromWorkspaceModel.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow a DataNotFoundError when the workspace model throws it', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const joinedDate = new Date();
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const memberEmail = 'testmember@gmail.com';
      const memberStatus = databaseTypes.constants.INVITATION_STATUS.PENDING;

      const errMessage = 'Cannot find the workspace';
      const err = new error.DataNotFoundError(errMessage, 'email', {
        userEmail,
      });

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            workspaceCode: workspaceCode,
            inviteCode: inviteCode,
            creator: {
              _id: userId,
              email: userEmail,
            } as unknown as databaseTypes.IUser,
            members: [
              {
                _id: userId,
                email: userEmail,
                invitedAt: joinedDate,
                joinedDate: joinedDate,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
                status: memberStatus,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      // triggers member create
      const memberEmailExistsStub = sandbox.stub();
      memberEmailExistsStub.resolves(false);
      sandbox.replace(dbConnection.models.MemberModel, 'memberExists', memberEmailExistsStub);

      const createMemberFromModelStub = sandbox.stub();
      createMemberFromModelStub.resolves({
        _id: memberId,
        email: memberEmail,
        invitedAt: joinedDate,
        joinedDate: joinedDate,
        teamRole: databaseTypes.constants.ROLE.OWNER,
        deletedAt: null,
        status: memberStatus,
      } as unknown as databaseTypes.IMember);
      sandbox.replace(dbConnection.models.MemberModel, 'createWorkspaceMember', createMemberFromModelStub);

      // add members
      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

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

      const date = await workspaceService.joinWorkspace(
        workspaceCode,
        userEmail,
        memberId.toString(),
        invitedBy.toString()
      );
      assert.isNotOk(date);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(memberEmailExistsStub.calledOnce);
      assert.isTrue(createMemberFromModelStub.calledOnce);
      assert.isTrue(addMembersFromWorkspaceModel.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow a DataValidationError when the workspace model throws it', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const joinedDate = new Date();
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const memberEmail = 'testmember@gmail.com';
      const memberStatus = databaseTypes.constants.INVITATION_STATUS.PENDING;

      const errMessage = 'Cannot find the workspace';
      const err = new error.DataValidationError(errMessage, 'email', {
        userEmail,
      });

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            workspaceCode: workspaceCode,
            inviteCode: inviteCode,
            creator: {
              _id: userId,
              email: userEmail,
            } as unknown as databaseTypes.IUser,
            members: [
              {
                _id: userId,
                email: userEmail,
                invitedAt: joinedDate,
                joinedDate: joinedDate,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
                status: memberStatus,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      // triggers member create
      const memberEmailExistsStub = sandbox.stub();
      memberEmailExistsStub.resolves(false);
      sandbox.replace(dbConnection.models.MemberModel, 'memberExists', memberEmailExistsStub);

      const createMemberFromModelStub = sandbox.stub();
      createMemberFromModelStub.resolves({
        _id: memberId,
        email: memberEmail,
        invitedAt: joinedDate,
        joinedDate: joinedDate,
        teamRole: databaseTypes.constants.ROLE.OWNER,
        deletedAt: null,
        status: memberStatus,
      } as unknown as databaseTypes.IMember);
      sandbox.replace(dbConnection.models.MemberModel, 'createWorkspaceMember', createMemberFromModelStub);

      // add members
      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

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

      const date = await workspaceService.joinWorkspace(
        workspaceCode,
        userEmail,
        memberId.toString(),
        invitedBy.toString()
      );
      assert.isNotOk(date);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(memberEmailExistsStub.calledOnce);
      assert.isTrue(createMemberFromModelStub.calledOnce);
      assert.isTrue(addMembersFromWorkspaceModel.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw a DataServiceError when the workspace model throws a DatabaseOperationError', async () => {
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testWorkspaceSlug';
      const joinedDate = new Date();
      const inviteCode = v4().replaceAll('-', '');
      const workspaceCode = v4().replaceAll('-', '');
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const memberId = new mongooseTypes.ObjectId();
      const invitedBy = new mongooseTypes.ObjectId();
      const memberEmail = 'testmember@gmail.com';
      const memberStatus = databaseTypes.constants.INVITATION_STATUS.PENDING;

      const errMessage = 'Cannot find the workspace';
      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'queryWorkspaces');

      const queryWorkspacesFromModelStub = sandbox.stub();
      queryWorkspacesFromModelStub.resolves({
        results: [
          {
            _id: workspaceId,
            slug: workspaceSlug,
            workspaceCode: workspaceCode,
            inviteCode: inviteCode,
            creator: {
              _id: userId,
              email: userEmail,
            } as unknown as databaseTypes.IUser,
            members: [
              {
                _id: userId,
                email: userEmail,
                invitedAt: joinedDate,
                joinedDate: joinedDate,
                teamRole: databaseTypes.constants.ROLE.OWNER,
                deletedAt: null,
                status: memberStatus,
              } as unknown as databaseTypes.IUser,
            ],
          },
        ] as unknown as databaseTypes.IWorkspace[],
        numberOfItems: 1,
      });
      sandbox.replace(dbConnection.models.WorkspaceModel, 'queryWorkspaces', queryWorkspacesFromModelStub);

      // triggers member create
      const memberEmailExistsStub = sandbox.stub();
      memberEmailExistsStub.resolves(false);
      sandbox.replace(dbConnection.models.MemberModel, 'memberExists', memberEmailExistsStub);

      const createMemberFromModelStub = sandbox.stub();
      createMemberFromModelStub.resolves({
        _id: memberId,
        email: memberEmail,
        invitedAt: joinedDate,
        joinedDate: joinedDate,
        teamRole: databaseTypes.constants.ROLE.OWNER,
        deletedAt: null,
        status: memberStatus,
      } as unknown as databaseTypes.IMember);
      sandbox.replace(dbConnection.models.MemberModel, 'createWorkspaceMember', createMemberFromModelStub);

      // add members
      const addMembersFromWorkspaceModel = sandbox.stub();
      addMembersFromWorkspaceModel.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'addMembers', addMembersFromWorkspaceModel);

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
        await workspaceService.joinWorkspace(workspaceCode, userEmail, memberId.toString(), invitedBy.toString());
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(queryWorkspacesFromModelStub.calledOnce);
      assert.isTrue(memberEmailExistsStub.calledOnce);
      assert.isTrue(createMemberFromModelStub.calledOnce);
      assert.isTrue(addMembersFromWorkspaceModel.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateWorkspaceName', () => {
    it('should update a workspace name', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';

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

      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceById', updateWorkspaceFromModelStub);

      const workspaceName = await workspaceService.updateWorkspaceName(
        userId.toString(),
        userEmail,
        newWorkspaceName,
        workspaceSlug
      );

      assert.isOk(workspaceName);
      assert.strictEqual(workspaceName!.toString(), newWorkspaceName.toString());

      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
    });
    it('will return null, and publish InvalidArgumentError if updateWorkspaceById in underlying model throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidArgumentError(errMessage, 'slug', {
        workspaceSlug,
      });

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceById', updateWorkspaceFromModelStub);

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

      const workspaceName = await workspaceService.updateWorkspaceName(
        userId.toString(),
        userEmail,
        newWorkspaceName,
        workspaceSlug
      );

      assert.notOk(workspaceName);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish InvalidOperationError if updateWorkspaceById in underlying model throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidOperationError(errMessage, {
        slug: workspaceSlug,
      });

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceById', updateWorkspaceFromModelStub);

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

      const workspaceName = await workspaceService.updateWorkspaceName(
        userId.toString(),
        userEmail,
        newWorkspaceName,
        workspaceSlug
      );

      assert.notOk(workspaceName);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will throw and publish DataServiceError if updateWorkspaceById in underlying model throws DatabaseOperationError', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'updateWorkspaceById', {
        slug: workspaceSlug,
      });

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceById', updateWorkspaceFromModelStub);

      const publishOverride = sandbox.stub();
      publishOverride.resolves();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await workspaceService.updateWorkspaceName(userId.toString(), userEmail, newWorkspaceName, workspaceSlug);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish DataNotFoundError if getWorkspaceById in underlying model throws one', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DataNotFoundError(errMessage, 'slug', {
        workspaceSlug,
      });

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceById', updateWorkspaceFromModelStub);

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

      const workspaceName = await workspaceService.updateWorkspaceName(
        userId.toString(),
        userEmail,
        newWorkspaceName,
        workspaceSlug
      );

      assert.notOk(workspaceName);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will throw and publish DataServiceError if getWorkspaceById in underlying model throws DatabaseOperationError', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceName = 'testName';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'updateWorkspaceById', {
        slug: workspaceSlug,
      });

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceById', updateWorkspaceFromModelStub);

      const publishOverride = sandbox.stub();
      publishOverride.resolves();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await workspaceService.updateWorkspaceName(userId.toString(), userEmail, newWorkspaceName, workspaceSlug);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateWorkspaceSlug', () => {
    it('should update a workspace slug', async () => {
      const userId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const workspaceSlug = 'testSlug';
      const workspaceName = 'testName';
      const newWorkspaceSlug = 'testNewSlug';

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.resolves({
        _id: workspaceId,
        slug: newWorkspaceSlug.toLowerCase(),
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

      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceById', updateWorkspaceFromModelStub);

      const workspaceSlugResult = await workspaceService.updateWorkspaceSlug(workspaceId.toString(), newWorkspaceSlug);
      assert.isOk(workspaceSlugResult);
      assert.strictEqual(workspaceSlugResult?.slug!.toString(), newWorkspaceSlug.toLowerCase());
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
    });
    it('will return null, and publish InvalidArgumentError if updateWorkspaceById in underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceSlug = 'newTestSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidArgumentError(errMessage, 'slug', {
        workspaceSlug,
      });

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceById', updateWorkspaceFromModelStub);

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

      const workspaceName = await workspaceService.updateWorkspaceSlug(workspaceId.toString(), newWorkspaceSlug);

      assert.notOk(workspaceName);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will return null, and publish InvalidOperationError if updateWorkspaceById in underlying model throws one', async () => {
      const userId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceSlug = 'newTestSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.InvalidOperationError(errMessage, {
        slug: workspaceSlug,
      });

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceById', updateWorkspaceFromModelStub);

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

      const workspaceName = await workspaceService.updateWorkspaceSlug(workspaceId.toString(), newWorkspaceSlug);

      assert.notOk(workspaceName);
      assert.isTrue(updateWorkspaceFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will throw and publish DataServiceError if updateWorkspaceById in underlying model throws DatabaseOperationError', async () => {
      const userId = new mongooseTypes.ObjectId();
      const workspaceId =
        // @ts-ignore
        new mongooseTypes.ObjectId();
      const userEmail = 'testemail@gmail.com';
      const workspaceSlug = 'testSlug';
      const newWorkspaceSlug = 'newTestSlug';
      const errMessage = 'Cannot find the workspace';

      const err = new error.DatabaseOperationError(errMessage, 'mongoDb', 'updateWorkspaceByFilter', {
        slug: workspaceSlug,
      });

      const updateWorkspaceFromModelStub = sandbox.stub();
      updateWorkspaceFromModelStub.rejects(err);
      sandbox.replace(dbConnection.models.WorkspaceModel, 'updateWorkspaceById', updateWorkspaceFromModelStub);

      const publishOverride = sandbox.stub();
      publishOverride.resolves();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await workspaceService.updateWorkspaceSlug(workspaceId.toString(), newWorkspaceSlug);
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

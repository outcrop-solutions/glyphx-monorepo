// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from '../../../../database';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from '@glyphx/database';
import {error} from '@glyphx/core';
import {memberService} from '../services';
import * as mocks from '../../database/mongoose/mocks';

describe('#services/member', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createMember', () => {
    it('will create a Member', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const updatedAtId = new mongooseTypes.ObjectId();
      const typeId = new mongooseTypes.ObjectId();
      const statusId = new mongooseTypes.ObjectId();
      const teamRoleId = new mongooseTypes.ObjectId();
      const projectRoleId = new mongooseTypes.ObjectId();
      const memberId = new mongooseTypes.ObjectId();
      const workspaceId = new mongooseTypes.ObjectId();
      const projectId = new mongooseTypes.ObjectId();

      // createMember
      const createMemberFromModelStub = sandbox.stub();
      createMemberFromModelStub.resolves({
        ...mocks.MOCK_MEMBER,
        _id: new mongooseTypes.ObjectId(),
        member: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        invitedBy: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
      } as unknown as databaseTypes.IMember);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createMember',
        createMemberFromModelStub
      );

      const doc = await memberService.createMember({
        ...mocks.MOCK_MEMBER,
        _id: new mongooseTypes.ObjectId(),
        member: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        invitedBy: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
      } as unknown as databaseTypes.IMember);

      assert.isTrue(createMemberFromModelStub.calledOnce);
    });
    // member model fails
    it('will publish and rethrow an InvalidArgumentError when member model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createMember
      const createMemberFromModelStub = sandbox.stub();
      createMemberFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createMember',
        createMemberFromModelStub
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
        await memberService.createMember({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when member model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createMember
      const createMemberFromModelStub = sandbox.stub();
      createMemberFromModelStub.rejects(err);

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
        await memberService.createMember({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when member model throws it', async () => {
      const createMemberFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createMemberFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createMember',
        createMemberFromModelStub
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
        await memberService.createMember({});
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when member model throws a DataOperationError', async () => {
      const createMemberFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createMemberFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createMember',
        createMemberFromModelStub
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
        await memberService.createMember({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when member model throws a UnexpectedError', async () => {
      const createMemberFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(errMessage, 'mongodDb');

      createMemberFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'createMember',
        createMemberFromModelStub
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
        await memberService.createMember({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getMember', () => {
    it('should get a member by id', async () => {
      const memberId = new mongooseTypes.ObjectId();

      const getMemberFromModelStub = sandbox.stub();
      getMemberFromModelStub.resolves({
        _id: memberId,
      } as unknown as databaseTypes.IMember);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'getMemberById',
        getMemberFromModelStub
      );

      const member = await memberService.getMember(memberId);
      assert.isOk(member);
      assert.strictEqual(member?._id?.toString(), memberId.toString());

      assert.isTrue(getMemberFromModelStub.calledOnce);
    });
    it('should get a member by id when id is a string', async () => {
      const memberId = new mongooseTypes.ObjectId();

      const getMemberFromModelStub = sandbox.stub();
      getMemberFromModelStub.resolves({
        _id: memberId,
      } as unknown as databaseTypes.IMember);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'getMemberById',
        getMemberFromModelStub
      );

      const member = await memberService.getMember(memberId.toString());
      assert.isOk(member);
      assert.strictEqual(member?._id?.toString(), memberId.toString());

      assert.isTrue(getMemberFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the member cannot be found', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(errMessage, 'memberId', memberId);
      const getMemberFromModelStub = sandbox.stub();
      getMemberFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'getMemberById',
        getMemberFromModelStub
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

      const member = await memberService.getMember(memberId);
      assert.notOk(member);

      assert.isTrue(getMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getMemberById'
      );
      const getMemberFromModelStub = sandbox.stub();
      getMemberFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'getMemberById',
        getMemberFromModelStub
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
        await memberService.getMember(memberId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getMembers', () => {
    it('should get members by filter', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const memberId2 = new mongooseTypes.ObjectId();
      const memberFilter = {_id: memberId};

      const queryMembersFromModelStub = sandbox.stub();
      queryMembersFromModelStub.resolves({
        results: [
          {
            ...mocks.MOCK_MEMBER,
            _id: memberId,
            member: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
            invitedBy: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
            workspace: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IWorkspace,
            project: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IProject,
          } as unknown as databaseTypes.IMember,
          {
            ...mocks.MOCK_MEMBER,
            _id: memberId2,
            member: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
            invitedBy: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
            workspace: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IWorkspace,
            project: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IProject,
          } as unknown as databaseTypes.IMember,
        ],
      } as unknown as databaseTypes.IMember[]);

      sandbox.replace(
        dbConnection.models.MemberModel,
        'queryMembers',
        queryMembersFromModelStub
      );

      const members = await memberService.getMembers(memberFilter);
      assert.isOk(members![0]);
      assert.strictEqual(members![0]._id?.toString(), memberId.toString());
      assert.isTrue(queryMembersFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the members cannot be found', async () => {
      const memberName = 'memberName1';
      const memberFilter = {name: memberName};
      const errMessage = 'Cannot find the member';
      const err = new error.DataNotFoundError(errMessage, 'name', memberFilter);
      const getMemberFromModelStub = sandbox.stub();
      getMemberFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'queryMembers',
        getMemberFromModelStub
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

      const member = await memberService.getMembers(memberFilter);
      assert.notOk(member);

      assert.isTrue(getMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const memberName = 'memberName1';
      const memberFilter = {name: memberName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getMemberByEmail'
      );
      const getMemberFromModelStub = sandbox.stub();
      getMemberFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'queryMembers',
        getMemberFromModelStub
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
        await memberService.getMembers(memberFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateMember', () => {
    it('will update a member', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves({
        ...mocks.MOCK_MEMBER,
        _id: new mongooseTypes.ObjectId(),
        member: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        invitedBy: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
      } as unknown as databaseTypes.IMember);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'updateMemberById',
        updateMemberFromModelStub
      );

      const member = await memberService.updateMember(memberId, {
        deletedAt: new Date(),
      });
      assert.isOk(member);
      assert.strictEqual(member._id, memberId);
      assert.isOk(member.deletedAt);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
    });
    it('will update a member when the id is a string', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.resolves({
        ...mocks.MOCK_MEMBER,
        _id: new mongooseTypes.ObjectId(),
        member: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        invitedBy: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
      } as unknown as databaseTypes.IMember);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'updateMemberById',
        updateMemberFromModelStub
      );

      const member = await memberService.updateMember(memberId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(member);
      assert.strictEqual(member._id, memberId);
      assert.isOk(member.deletedAt);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when member model throws it ', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'updateMemberById',
        updateMemberFromModelStub
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
        await memberService.updateMember(memberId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when member model throws it ', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'updateMemberById',
        updateMemberFromModelStub
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
        await memberService.updateMember(memberId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when member model throws a DataOperationError ', async () => {
      const memberId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateMemberById'
      );
      const updateMemberFromModelStub = sandbox.stub();
      updateMemberFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.MemberModel,
        'updateMemberById',
        updateMemberFromModelStub
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
        await memberService.updateMember(memberId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateMemberFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});

// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {MemberModel} from '../../../mongoose/models/member';
import * as mocks from '../../../mongoose/mocks';
import {UserModel} from '../../../mongoose/models/user';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
import {ProjectModel} from '../../../mongoose/models/project';
import {IQueryResult, databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/member', () => {
  context('memberIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the memberId exists', async () => {
      const memberId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      const result = await MemberModel.memberIdExists(memberId);

      assert.isTrue(result);
    });

    it('should return false if the memberId does not exist', async () => {
      const memberId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      const result = await MemberModel.memberIdExists(memberId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const memberId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await MemberModel.memberIdExists(memberId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allMemberIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the member ids exist', async () => {
      const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedMemberIds = memberIds.map((memberId) => {
        return {
          _id: memberId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedMemberIds);
      sandbox.replace(MemberModel, 'find', findStub);

      assert.isTrue(await MemberModel.allMemberIdsExist(memberIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedMemberIds = [
        {
          _id: memberIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedMemberIds);
      sandbox.replace(MemberModel, 'find', findStub);
      let errored = false;
      try {
        await MemberModel.allMemberIdsExist(memberIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(err.data.value[0].toString(), memberIds[1].toString());
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const memberIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(MemberModel, 'find', findStub);
      let errored = false;
      try {
        await MemberModel.allMemberIdsExist(memberIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will not throw an error when no unsafe fields are present', async () => {
      const memberStub = sandbox.stub();
      memberStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', memberStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);

      let errored = false;

      try {
        await MemberModel.validateUpdateObject(
          mocks.MOCK_MEMBER as unknown as Omit<Partial<databaseTypes.IMember>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const memberStub = sandbox.stub();
      memberStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', memberStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);

      let errored = false;

      try {
        await MemberModel.validateUpdateObject(
          mocks.MOCK_MEMBER as unknown as Omit<Partial<databaseTypes.IMember>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(memberStub.calledTwice);
      assert.isTrue(workspaceStub.calledOnce);
      assert.isTrue(projectStub.calledOnce);
    });

    it('will fail when the member does not exist.', async () => {
      const memberStub = sandbox.stub();
      memberStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', memberStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);

      let errored = false;

      try {
        await MemberModel.validateUpdateObject(
          mocks.MOCK_MEMBER as unknown as Omit<Partial<databaseTypes.IMember>, '_id'>
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
    it('will fail when the workspace does not exist.', async () => {
      const memberStub = sandbox.stub();
      memberStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', memberStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(false);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);

      let errored = false;

      try {
        await MemberModel.validateUpdateObject(
          mocks.MOCK_MEMBER as unknown as Omit<Partial<databaseTypes.IMember>, '_id'>
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
    it('will fail when the project does not exist.', async () => {
      const memberStub = sandbox.stub();
      memberStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', memberStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(false);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);

      let errored = false;

      try {
        await MemberModel.validateUpdateObject(
          mocks.MOCK_MEMBER as unknown as Omit<Partial<databaseTypes.IMember>, '_id'>
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the _id', async () => {
      const memberStub = sandbox.stub();
      memberStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', memberStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);

      let errored = false;

      try {
        await MemberModel.validateUpdateObject({
          ...mocks.MOCK_MEMBER,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IMember>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const memberStub = sandbox.stub();
      memberStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', memberStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);

      let errored = false;

      try {
        await MemberModel.validateUpdateObject({...mocks.MOCK_MEMBER, createdAt: new Date()} as unknown as Omit<
          Partial<databaseTypes.IMember>,
          '_id'
        >);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const memberStub = sandbox.stub();
      memberStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', memberStub);
      const workspaceStub = sandbox.stub();
      workspaceStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'workspaceIdExists', workspaceStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(true);
      sandbox.replace(ProjectModel, 'projectIdExists', projectStub);

      let errored = false;

      try {
        await MemberModel.validateUpdateObject({...mocks.MOCK_MEMBER, updatedAt: new Date()} as unknown as Omit<
          Partial<databaseTypes.IMember>,
          '_id'
        >);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createMember', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a member document', async () => {
      sandbox.replace(MemberModel, 'validateMember', sandbox.stub().resolves(mocks.MOCK_MEMBER.member));
      sandbox.replace(MemberModel, 'validateInvitedBy', sandbox.stub().resolves(mocks.MOCK_MEMBER.invitedBy));
      sandbox.replace(MemberModel, 'validateWorkspace', sandbox.stub().resolves(mocks.MOCK_MEMBER.workspace));
      sandbox.replace(MemberModel, 'validateProject', sandbox.stub().resolves(mocks.MOCK_MEMBER.project));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(MemberModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(MemberModel, 'getMemberById', stub);

      const memberDocument = await MemberModel.createMember(mocks.MOCK_MEMBER);

      assert.strictEqual(memberDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when the member validator throws one', async () => {
      sandbox.replace(
        MemberModel,
        'validateMember',
        sandbox.stub().rejects(new error.DataValidationError('The member does not exist', 'member ', {}))
      );
      sandbox.replace(MemberModel, 'validateWorkspace', sandbox.stub().resolves(mocks.MOCK_MEMBER.workspace));
      sandbox.replace(MemberModel, 'validateProject', sandbox.stub().resolves(mocks.MOCK_MEMBER.project));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(MemberModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(MemberModel, 'getMemberById', stub);

      let errored = false;

      try {
        await MemberModel.createMember(mocks.MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will rethrow a DataValidationError when the workspace validator throws one', async () => {
      sandbox.replace(MemberModel, 'validateMember', sandbox.stub().resolves(mocks.MOCK_MEMBER.member));
      sandbox.replace(
        MemberModel,
        'validateWorkspace',
        sandbox.stub().rejects(new error.DataValidationError('The workspace does not exist', 'workspace ', {}))
      );
      sandbox.replace(MemberModel, 'validateProject', sandbox.stub().resolves(mocks.MOCK_MEMBER.project));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(MemberModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(MemberModel, 'getMemberById', stub);

      let errored = false;

      try {
        await MemberModel.createMember(mocks.MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will rethrow a DataValidationError when the project validator throws one', async () => {
      sandbox.replace(MemberModel, 'validateMember', sandbox.stub().resolves(mocks.MOCK_MEMBER.member));
      sandbox.replace(MemberModel, 'validateWorkspace', sandbox.stub().resolves(mocks.MOCK_MEMBER.workspace));
      sandbox.replace(
        MemberModel,
        'validateProject',
        sandbox.stub().rejects(new error.DataValidationError('The project does not exist', 'project ', {}))
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(MemberModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(MemberModel, 'getMemberById', stub);

      let errored = false;

      try {
        await MemberModel.createMember(mocks.MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(MemberModel, 'validateMember', sandbox.stub().resolves(mocks.MOCK_MEMBER.member));
      sandbox.replace(MemberModel, 'validateInvitedBy', sandbox.stub().resolves(mocks.MOCK_MEMBER.invitedBy));
      sandbox.replace(MemberModel, 'validateWorkspace', sandbox.stub().resolves(mocks.MOCK_MEMBER.workspace));
      sandbox.replace(MemberModel, 'validateProject', sandbox.stub().resolves(mocks.MOCK_MEMBER.project));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'create', sandbox.stub().rejects('oops, something bad has happened'));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(MemberModel, 'getMemberById', stub);
      let hasError = false;
      try {
        await MemberModel.createMember(mocks.MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(MemberModel, 'validateMember', sandbox.stub().resolves(mocks.MOCK_MEMBER.member));
      sandbox.replace(MemberModel, 'validateInvitedBy', sandbox.stub().resolves(mocks.MOCK_MEMBER.invitedBy));
      sandbox.replace(MemberModel, 'validateWorkspace', sandbox.stub().resolves(mocks.MOCK_MEMBER.workspace));
      sandbox.replace(MemberModel, 'validateProject', sandbox.stub().resolves(mocks.MOCK_MEMBER.project));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(MemberModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(MemberModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(MemberModel, 'getMemberById', stub);

      let hasError = false;
      try {
        await MemberModel.createMember(mocks.MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(MemberModel, 'validateMember', sandbox.stub().resolves(mocks.MOCK_MEMBER.member));
      sandbox.replace(MemberModel, 'validateInvitedBy', sandbox.stub().resolves(mocks.MOCK_MEMBER.invitedBy));
      sandbox.replace(MemberModel, 'validateWorkspace', sandbox.stub().resolves(mocks.MOCK_MEMBER.workspace));
      sandbox.replace(MemberModel, 'validateProject', sandbox.stub().resolves(mocks.MOCK_MEMBER.project));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(MemberModel, 'validate', sandbox.stub().rejects('oops an error has occurred'));
      sandbox.replace(MemberModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(MemberModel, 'getMemberById', stub);
      let hasError = false;
      try {
        await MemberModel.createMember(mocks.MOCK_MEMBER);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getMemberById', () => {
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

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a member document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_MEMBER));
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      const doc = await MemberModel.getMemberById(mocks.MOCK_MEMBER._id as mongoose.Types.ObjectId);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.member as any)?.__v);
      assert.isUndefined((doc.invitedBy as any)?.__v);
      assert.isUndefined((doc.workspace as any)?.__v);
      assert.isUndefined((doc.project as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_MEMBER._id);
    });

    it('will throw a DataNotFoundError when the member does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await MemberModel.getMemberById(mocks.MOCK_MEMBER._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(MemberModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await MemberModel.getMemberById(mocks.MOCK_MEMBER._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryMembers', () => {
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

    const mockMembers = [
      {
        ...mocks.MOCK_MEMBER,
        _id: new mongoose.Types.ObjectId(),
        member: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        invitedBy: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
      } as databaseTypes.IMember,
      {
        ...mocks.MOCK_MEMBER,
        _id: new mongoose.Types.ObjectId(),
        member: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        invitedBy: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
      } as databaseTypes.IMember,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered members', async () => {
      sandbox.replace(MemberModel, 'count', sandbox.stub().resolves(mockMembers.length));

      sandbox.replace(MemberModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockMembers)));

      const results = await MemberModel.queryMembers({});

      assert.strictEqual(results.numberOfItems, mockMembers.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockMembers.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.member as any)?.__v);
        assert.isUndefined((doc.invitedBy as any)?.__v);
        assert.isUndefined((doc.workspace as any)?.__v);
        assert.isUndefined((doc.project as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(MemberModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(MemberModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockMembers)));

      let errored = false;
      try {
        await MemberModel.queryMembers();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(MemberModel, 'count', sandbox.stub().resolves(mockMembers.length));

      sandbox.replace(MemberModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockMembers)));

      let errored = false;
      try {
        await MemberModel.queryMembers({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(MemberModel, 'count', sandbox.stub().resolves(mockMembers.length));

      sandbox.replace(
        MemberModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await MemberModel.queryMembers({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateMemberById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a member', async () => {
      const updateMember = {
        ...mocks.MOCK_MEMBER,
        deletedAt: new Date(),
        member: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        workspace: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
        project: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IProject,
      } as unknown as databaseTypes.IMember;

      const memberId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(MemberModel, 'updateOne', updateStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(MemberModel, 'validateUpdateObject', validateStub);

      const result = await MemberModel.updateMemberById(memberId, updateMember);

      assert.strictEqual(result._id, memberId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getMemberStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a member with references as ObjectIds', async () => {
      const updateMember = {
        ...mocks.MOCK_MEMBER,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IMember;

      const memberId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(MemberModel, 'updateOne', updateStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(MemberModel, 'validateUpdateObject', validateStub);

      const result = await MemberModel.updateMemberById(memberId, updateMember);

      assert.strictEqual(result._id, memberId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getMemberStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the member does not exist', async () => {
      const updateMember = {
        ...mocks.MOCK_MEMBER,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IMember;

      const memberId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(MemberModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(MemberModel, 'validateUpdateObject', validateStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);

      let errorred = false;
      try {
        await MemberModel.updateMemberById(memberId, updateMember);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateMember = {
        ...mocks.MOCK_MEMBER,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IMember;

      const memberId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(MemberModel, 'updateOne', updateStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(new error.InvalidOperationError("You can't do this", {}));
      sandbox.replace(MemberModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await MemberModel.updateMemberById(memberId, updateMember);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateMember = {
        ...mocks.MOCK_MEMBER,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IMember;

      const memberId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(MemberModel, 'updateOne', updateStub);

      const getMemberStub = sandbox.stub();
      getMemberStub.resolves({_id: memberId});
      sandbox.replace(MemberModel, 'getMemberById', getMemberStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(MemberModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await MemberModel.updateMemberById(memberId, updateMember);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a member document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a member', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(MemberModel, 'deleteOne', deleteStub);

      const memberId = new mongoose.Types.ObjectId();

      await MemberModel.deleteMemberById(memberId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the member does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(MemberModel, 'deleteOne', deleteStub);

      const memberId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await MemberModel.deleteMemberById(memberId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(MemberModel, 'deleteOne', deleteStub);

      const memberId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await MemberModel.deleteMemberById(memberId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});

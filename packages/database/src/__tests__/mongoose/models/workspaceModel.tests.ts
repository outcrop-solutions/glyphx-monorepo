// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
import * as mocks from '../../../mongoose/mocks';
import {TagModel} from '../../../mongoose/models/tag';
import {UserModel} from '../../../mongoose/models/user';
import {MemberModel} from '../../../mongoose/models/member';
import {ProjectModel} from '../../../mongoose/models/project';
import {FileStatModel} from '../../../mongoose/models/fileStat';
import {StateModel} from '../../../mongoose/models/state';
import {IQueryResult, databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/workspace', () => {
  context('workspaceIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the workspaceId exists', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: workspaceId});
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const result = await WorkspaceModel.workspaceIdExists(workspaceId);

      assert.isTrue(result);
    });

    it('should return false if the workspaceId does not exist', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const result = await WorkspaceModel.workspaceIdExists(workspaceId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await WorkspaceModel.workspaceIdExists(workspaceId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allWorkspaceIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the workspace ids exist', async () => {
      const workspaceIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedWorkspaceIds = workspaceIds.map((workspaceId) => {
        return {
          _id: workspaceId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedWorkspaceIds);
      sandbox.replace(WorkspaceModel, 'find', findStub);

      assert.isTrue(await WorkspaceModel.allWorkspaceIdsExist(workspaceIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const workspaceIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedWorkspaceIds = [
        {
          _id: workspaceIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedWorkspaceIds);
      sandbox.replace(WorkspaceModel, 'find', findStub);
      let errored = false;
      try {
        await WorkspaceModel.allWorkspaceIdsExist(workspaceIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(err.data.value[0].toString(), workspaceIds[1].toString());
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const workspaceIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(WorkspaceModel, 'find', findStub);
      let errored = false;
      try {
        await WorkspaceModel.allWorkspaceIdsExist(workspaceIds);
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
      const creatorStub = sandbox.stub();
      creatorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', creatorStub);

      let errored = false;

      try {
        await WorkspaceModel.validateUpdateObject(
          mocks.MOCK_WORKSPACE as unknown as Omit<Partial<databaseTypes.IWorkspace>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const creatorStub = sandbox.stub();
      creatorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', creatorStub);

      let errored = false;

      try {
        await WorkspaceModel.validateUpdateObject(
          mocks.MOCK_WORKSPACE as unknown as Omit<Partial<databaseTypes.IWorkspace>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(creatorStub.calledOnce);
    });

    it('will fail when the creator does not exist.', async () => {
      const creatorStub = sandbox.stub();
      creatorStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', creatorStub);

      let errored = false;

      try {
        await WorkspaceModel.validateUpdateObject(
          mocks.MOCK_WORKSPACE as unknown as Omit<Partial<databaseTypes.IWorkspace>, '_id'>
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the _id', async () => {
      const creatorStub = sandbox.stub();
      creatorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', creatorStub);

      let errored = false;

      try {
        await WorkspaceModel.validateUpdateObject({
          ...mocks.MOCK_WORKSPACE,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IWorkspace>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const creatorStub = sandbox.stub();
      creatorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', creatorStub);

      let errored = false;

      try {
        await WorkspaceModel.validateUpdateObject({...mocks.MOCK_WORKSPACE, createdAt: new Date()} as unknown as Omit<
          Partial<databaseTypes.IWorkspace>,
          '_id'
        >);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const creatorStub = sandbox.stub();
      creatorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', creatorStub);

      let errored = false;

      try {
        await WorkspaceModel.validateUpdateObject({...mocks.MOCK_WORKSPACE, updatedAt: new Date()} as unknown as Omit<
          Partial<databaseTypes.IWorkspace>,
          '_id'
        >);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createWorkspace', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a workspace document', async () => {
      sandbox.replace(WorkspaceModel, 'validateTags', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.tags));
      sandbox.replace(WorkspaceModel, 'validateCreator', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.creator));
      sandbox.replace(WorkspaceModel, 'validateMembers', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.members));
      sandbox.replace(WorkspaceModel, 'validateProjects', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.projects));
      sandbox.replace(WorkspaceModel, 'validateFilesystems', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.filesystem));
      sandbox.replace(WorkspaceModel, 'validateStates', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.states));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(WorkspaceModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(WorkspaceModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(WorkspaceModel, 'getWorkspaceById', stub);

      const workspaceDocument = await WorkspaceModel.createWorkspace(mocks.MOCK_WORKSPACE);

      assert.strictEqual(workspaceDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when the creator validator throws one', async () => {
      sandbox.replace(WorkspaceModel, 'validateTags', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.tags));
      sandbox.replace(
        WorkspaceModel,
        'validateCreator',
        sandbox.stub().rejects(new error.DataValidationError('The creator does not exist', 'creator ', {}))
      );
      sandbox.replace(WorkspaceModel, 'validateMembers', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.members));
      sandbox.replace(WorkspaceModel, 'validateProjects', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.projects));
      sandbox.replace(WorkspaceModel, 'validateFilesystems', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.filesystem));
      sandbox.replace(WorkspaceModel, 'validateStates', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.states));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(WorkspaceModel, 'create', sandbox.stub().resolves([{_id: objectId}]));

      sandbox.replace(WorkspaceModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(WorkspaceModel, 'getWorkspaceById', stub);

      let errored = false;

      try {
        await WorkspaceModel.createWorkspace(mocks.MOCK_WORKSPACE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(WorkspaceModel, 'validateTags', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.tags));
      sandbox.replace(WorkspaceModel, 'validateCreator', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.creator));
      sandbox.replace(WorkspaceModel, 'validateMembers', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.members));
      sandbox.replace(WorkspaceModel, 'validateProjects', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.projects));
      sandbox.replace(WorkspaceModel, 'validateFilesystems', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.filesystem));
      sandbox.replace(WorkspaceModel, 'validateStates', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.states));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(WorkspaceModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(WorkspaceModel, 'create', sandbox.stub().rejects('oops, something bad has happened'));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', stub);
      let hasError = false;
      try {
        await WorkspaceModel.createWorkspace(mocks.MOCK_WORKSPACE);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(WorkspaceModel, 'validateTags', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.tags));
      sandbox.replace(WorkspaceModel, 'validateCreator', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.creator));
      sandbox.replace(WorkspaceModel, 'validateMembers', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.members));
      sandbox.replace(WorkspaceModel, 'validateProjects', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.projects));
      sandbox.replace(WorkspaceModel, 'validateFilesystems', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.filesystem));
      sandbox.replace(WorkspaceModel, 'validateStates', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.states));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(WorkspaceModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(WorkspaceModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', stub);

      let hasError = false;
      try {
        await WorkspaceModel.createWorkspace(mocks.MOCK_WORKSPACE);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(WorkspaceModel, 'validateTags', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.tags));
      sandbox.replace(WorkspaceModel, 'validateCreator', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.creator));
      sandbox.replace(WorkspaceModel, 'validateMembers', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.members));
      sandbox.replace(WorkspaceModel, 'validateProjects', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.projects));
      sandbox.replace(WorkspaceModel, 'validateFilesystems', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.filesystem));
      sandbox.replace(WorkspaceModel, 'validateStates', sandbox.stub().resolves(mocks.MOCK_WORKSPACE.states));

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(WorkspaceModel, 'validate', sandbox.stub().rejects('oops an error has occurred'));
      sandbox.replace(WorkspaceModel, 'create', sandbox.stub().resolves([{_id: objectId}]));
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', stub);
      let hasError = false;
      try {
        await WorkspaceModel.createWorkspace(mocks.MOCK_WORKSPACE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getWorkspaceById', () => {
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

    it('will retreive a workspace document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_WORKSPACE));
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const doc = await WorkspaceModel.getWorkspaceById(mocks.MOCK_WORKSPACE._id as mongoose.Types.ObjectId);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.tags[0] as any)?.__v);
      assert.isUndefined((doc.creator as any)?.__v);
      assert.isUndefined((doc.members[0] as any)?.__v);
      assert.isUndefined((doc.projects[0] as any)?.__v);
      assert.isUndefined((doc.filesystem[0] as any)?.__v);
      assert.isUndefined((doc.states[0] as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_WORKSPACE._id);
    });

    it('will throw a DataNotFoundError when the workspace does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await WorkspaceModel.getWorkspaceById(mocks.MOCK_WORKSPACE._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await WorkspaceModel.getWorkspaceById(mocks.MOCK_WORKSPACE._id as mongoose.Types.ObjectId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryWorkspaces', () => {
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

    const mockWorkspaces = [
      {
        ...mocks.MOCK_WORKSPACE,
        _id: new mongoose.Types.ObjectId(),
        tags: [],
        creator: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        members: [],
        projects: [],
        filesystem: [],
        states: [],
      } as databaseTypes.IWorkspace,
      {
        ...mocks.MOCK_WORKSPACE,
        _id: new mongoose.Types.ObjectId(),
        tags: [],
        creator: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        members: [],
        projects: [],
        filesystem: [],
        states: [],
      } as databaseTypes.IWorkspace,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered workspaces', async () => {
      sandbox.replace(WorkspaceModel, 'count', sandbox.stub().resolves(mockWorkspaces.length));

      sandbox.replace(WorkspaceModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockWorkspaces)));

      const results = await WorkspaceModel.queryWorkspaces({});

      assert.strictEqual(results.numberOfItems, mockWorkspaces.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockWorkspaces.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.tags[0] as any)?.__v);
        assert.isUndefined((doc.creator as any)?.__v);
        assert.isUndefined((doc.members[0] as any)?.__v);
        assert.isUndefined((doc.projects[0] as any)?.__v);
        assert.isUndefined((doc.filesystem[0] as any)?.__v);
        assert.isUndefined((doc.states[0] as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(WorkspaceModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(WorkspaceModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockWorkspaces)));

      let errored = false;
      try {
        await WorkspaceModel.queryWorkspaces();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(WorkspaceModel, 'count', sandbox.stub().resolves(mockWorkspaces.length));

      sandbox.replace(WorkspaceModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockWorkspaces)));

      let errored = false;
      try {
        await WorkspaceModel.queryWorkspaces({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(WorkspaceModel, 'count', sandbox.stub().resolves(mockWorkspaces.length));

      sandbox.replace(
        WorkspaceModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await WorkspaceModel.queryWorkspaces({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateWorkspaceById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a workspace', async () => {
      const updateWorkspace = {
        ...mocks.MOCK_WORKSPACE,
        deletedAt: new Date(),
        tags: [],
        creator: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        members: [],
        projects: [],
        filesystem: [],
        states: [],
      } as unknown as databaseTypes.IWorkspace;

      const workspaceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(WorkspaceModel, 'updateOne', updateStub);

      const getWorkspaceStub = sandbox.stub();
      getWorkspaceStub.resolves({_id: workspaceId});
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', getWorkspaceStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(WorkspaceModel, 'validateUpdateObject', validateStub);

      const result = await WorkspaceModel.updateWorkspaceById(workspaceId, updateWorkspace);

      assert.strictEqual(result._id, workspaceId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getWorkspaceStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a workspace with references as ObjectIds', async () => {
      const updateWorkspace = {
        ...mocks.MOCK_WORKSPACE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IWorkspace;

      const workspaceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(WorkspaceModel, 'updateOne', updateStub);

      const getWorkspaceStub = sandbox.stub();
      getWorkspaceStub.resolves({_id: workspaceId});
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', getWorkspaceStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(WorkspaceModel, 'validateUpdateObject', validateStub);

      const result = await WorkspaceModel.updateWorkspaceById(workspaceId, updateWorkspace);

      assert.strictEqual(result._id, workspaceId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getWorkspaceStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the workspace does not exist', async () => {
      const updateWorkspace = {
        ...mocks.MOCK_WORKSPACE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IWorkspace;

      const workspaceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(WorkspaceModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'validateUpdateObject', validateStub);

      const getWorkspaceStub = sandbox.stub();
      getWorkspaceStub.resolves({_id: workspaceId});
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', getWorkspaceStub);

      let errorred = false;
      try {
        await WorkspaceModel.updateWorkspaceById(workspaceId, updateWorkspace);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateWorkspace = {
        ...mocks.MOCK_WORKSPACE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IWorkspace;

      const workspaceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(WorkspaceModel, 'updateOne', updateStub);

      const getWorkspaceStub = sandbox.stub();
      getWorkspaceStub.resolves({_id: workspaceId});
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', getWorkspaceStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(new error.InvalidOperationError("You can't do this", {}));
      sandbox.replace(WorkspaceModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await WorkspaceModel.updateWorkspaceById(workspaceId, updateWorkspace);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateWorkspace = {
        ...mocks.MOCK_WORKSPACE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IWorkspace;

      const workspaceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(WorkspaceModel, 'updateOne', updateStub);

      const getWorkspaceStub = sandbox.stub();
      getWorkspaceStub.resolves({_id: workspaceId});
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', getWorkspaceStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(WorkspaceModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await WorkspaceModel.updateWorkspaceById(workspaceId, updateWorkspace);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a workspace document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a workspace', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(WorkspaceModel, 'deleteOne', deleteStub);

      const workspaceId = new mongoose.Types.ObjectId();

      await WorkspaceModel.deleteWorkspaceById(workspaceId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the workspace does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(WorkspaceModel, 'deleteOne', deleteStub);

      const workspaceId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await WorkspaceModel.deleteWorkspaceById(workspaceId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(WorkspaceModel, 'deleteOne', deleteStub);

      const workspaceId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await WorkspaceModel.deleteWorkspaceById(workspaceId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});

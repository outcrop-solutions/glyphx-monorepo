import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
import {assert} from 'chai';
import {UserModel} from '../../../mongoose/models/user';
import {MemberModel} from '../../../mongoose/models/member';
import {ProjectModel} from '../../../mongoose/models/project';

const MOCK_WORKSPACE: databaseTypes.IWorkspace = {
  createdAt: new Date(),
  updatedAt: new Date(),
  workspaceCode: 'testWorkspaceCode',
  inviteCode: 'testInviteCode',
  name: 'Test Workspace',
  slug: 'testSlug',
  description: 'a test workspace',
  creator: {_id: new mongoose.Types.ObjectId()} as unknown as databaseTypes.IUser,
  members: [],
  projects: [],
};

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

      const result = await WorkspaceModel.workspaceIdExists(
        workspaceId
      );

      assert.isTrue(result);
    });

    it('should return false if the workspaceId does not exist', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const result = await WorkspaceModel.workspaceIdExists(
        workspaceId
      );

      assert.isFalse(result);
    });
    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const userId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await WorkspaceModel.workspaceIdExists(userId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('createWorkspace', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create an workspace document', async () => {
      sandbox.replace(
        WorkspaceModel,
        'validateProjects',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        WorkspaceModel,
        'validateMembers',
        sandbox.stub().resolves([])
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        WorkspaceModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      sandbox.replace(
        WorkspaceModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', stub);
      const workspaceDocument = await WorkspaceModel.createWorkspace(
        MOCK_WORKSPACE
      );

      assert.strictEqual(workspaceDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });
    it('will rethrow a DataValidationError when a validator throws one', async () => {
      sandbox.replace(
        WorkspaceModel,
        'validateProjects',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'Could not validate the projects',
              'projects',
              []
            )
          )
      );
      sandbox.replace(
        WorkspaceModel,
        'validateMembers',
        sandbox.stub().resolves([])
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        WorkspaceModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        WorkspaceModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', stub);
      let hasError = false;
      try {
        await WorkspaceModel.createWorkspace(MOCK_WORKSPACE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        WorkspaceModel,
        'validateProjects',
        sandbox.stub().resolves()
      );
      sandbox.replace(
        WorkspaceModel,
        'validateMembers',
        sandbox.stub().resolves([])
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        WorkspaceModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        WorkspaceModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', stub);
      let hasError = false;
      try {
        await WorkspaceModel.createWorkspace(MOCK_WORKSPACE);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        WorkspaceModel,
        'validateProjects',
        sandbox.stub().resolves()
      );
      sandbox.replace(
        WorkspaceModel,
        'validateMembers',
        sandbox.stub().resolves([])
      );
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        WorkspaceModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        WorkspaceModel,
        'create',
        sandbox.stub().resolves([{}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', stub);
      let hasError = false;
      try {
        await WorkspaceModel.createWorkspace(MOCK_WORKSPACE);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        WorkspaceModel,
        'validateProjects',
        sandbox.stub().resolves([])
      );
      sandbox.replace(
        WorkspaceModel,
        'validateMembers',
        sandbox.stub().resolves([])
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        WorkspaceModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        WorkspaceModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', stub);
      let hasError = false;
      try {
        await WorkspaceModel.createWorkspace(MOCK_WORKSPACE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('updateWorkspaceById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update an existing workspace', async () => {
      const updateWorkspace = {
        name: 'Camp Crystal Lake',
        description: 'Re-Opening Summer 1980',
      };

      const workspaceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(WorkspaceModel, 'updateOne', updateStub);

      const getWorkspaceStub = sandbox.stub();
      getWorkspaceStub.resolves({_id: workspaceId});
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceStub
      );

      const validateUpdateObjectStub = sandbox.stub();
      validateUpdateObjectStub.resolves(true);
      sandbox.replace(
        WorkspaceModel,
        'validateUpdateObject',
        validateUpdateObjectStub
      );

      const result = await WorkspaceModel.updateWorkspaceById(
        workspaceId,
        updateWorkspace
      );

      assert.strictEqual(result._id, workspaceId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getWorkspaceStub.calledOnce);
      assert.isTrue(validateUpdateObjectStub.calledOnce);
    });

    it('Should update an existing workspace changing the creator', async () => {
      const creatorId = new mongoose.Types.ObjectId();
      const updateWorkspace = {
        name: 'Camp Crystal Lake',
        description: 'Re-Opening Summer 1980',
        creator: {_id: creatorId} as unknown as databaseTypes.IUser,
      };

      const workspaceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(WorkspaceModel, 'updateOne', updateStub);

      const getWorkspaceStub = sandbox.stub();
      getWorkspaceStub.resolves({_id: workspaceId});
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceStub
      );

      const validateUpdateObjectStub = sandbox.stub();
      validateUpdateObjectStub.resolves(true);
      sandbox.replace(
        WorkspaceModel,
        'validateUpdateObject',
        validateUpdateObjectStub
      );

      const result = await WorkspaceModel.updateWorkspaceById(
        workspaceId,
        updateWorkspace
      );

      assert.strictEqual(result._id, workspaceId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getWorkspaceStub.calledOnce);
      assert.isTrue(validateUpdateObjectStub.calledOnce);

      const updateArg = updateStub.args[0];
      assert.isAtLeast(updateArg.length, 2);
      const updateDocument = updateArg[1];
      assert.strictEqual(updateDocument.creator, creatorId);
    });

    it('Will fail when the workspace does not exist', async () => {
      const updateWorkspace = {
        name: 'Camp Crystal Lake',
        description: 'Re-Opening Summer 1980',
      };

      const workspaceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(WorkspaceModel, 'updateOne', updateStub);

      const getWorkspaceStub = sandbox.stub();
      getWorkspaceStub.resolves({_id: workspaceId});
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceStub
      );
      const validateUpdateObjectStub = sandbox.stub();
      validateUpdateObjectStub.resolves(true);
      sandbox.replace(
        WorkspaceModel,
        'validateUpdateObject',
        validateUpdateObjectStub
      );

      let errorred = false;
      try {
        await WorkspaceModel.updateWorkspaceById(
          workspaceId,
          updateWorkspace
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateWorkspace = {
        name: 'Camp Crystal Lake',
        description: 'Re-Opening Summer 1980',
      };

      const workspaceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(WorkspaceModel, 'updateOne', updateStub);

      const getWorkspaceStub = sandbox.stub();
      getWorkspaceStub.resolves({_id: workspaceId});
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceStub
      );

      const validateUpdateObjectStub = sandbox.stub();
      validateUpdateObjectStub.rejects(
        new error.InvalidOperationError('You cant do this', {})
      );
      sandbox.replace(
        WorkspaceModel,
        'validateUpdateObject',
        validateUpdateObjectStub
      );

      let errorred = false;
      try {
        await WorkspaceModel.updateWorkspaceById(
          workspaceId,
          updateWorkspace
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateWorkspace = {
        name: 'Camp Crystal Lake',
        description: 'Re-Opening Summer 1980',
      };

      const workspaceId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(WorkspaceModel, 'updateOne', updateStub);

      const getWorkspaceStub = sandbox.stub();
      getWorkspaceStub.resolves({_id: workspaceId});
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceStub
      );
      const validateUpdateObjectStub = sandbox.stub();
      validateUpdateObjectStub.resolves(true);
      sandbox.replace(
        WorkspaceModel,
        'validateUpdateObject',
        validateUpdateObjectStub
      );

      let errorred = false;
      try {
        await WorkspaceModel.updateWorkspaceById(
          workspaceId,
          updateWorkspace
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return true when no restricted fields are present', async () => {
      const inputWorkspace = {
        projects: [],
        members: [],
      };

      assert.isTrue(
        await WorkspaceModel.validateUpdateObject(inputWorkspace)
      );
    });

    it('will fail when trying to update projects', async () => {
      const inputWorkspace = {
        projects: [new mongoose.Types.ObjectId()],
        members: [],
      } as unknown as databaseTypes.IWorkspace;

      let errored = false;
      try {
        await WorkspaceModel.validateUpdateObject(inputWorkspace);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update members', async () => {
      const inputWorkspace = {
        projects: [],
        members: [new mongoose.Types.ObjectId()],
      } as unknown as databaseTypes.IWorkspace;

      let errored = false;
      try {
        await WorkspaceModel.validateUpdateObject(inputWorkspace);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update _id', async () => {
      const inputWorkspace = {
        projects: [],
        members: [],
        _id: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.IWorkspace;

      let errored = false;
      try {
        await WorkspaceModel.validateUpdateObject(inputWorkspace);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update createdAt', async () => {
      const inputWorkspace = {
        projects: [],
        members: [],
        createdAt: new Date(),
      } as unknown as databaseTypes.IWorkspace;

      let errored = false;
      try {
        await WorkspaceModel.validateUpdateObject(inputWorkspace);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update updatedAt', async () => {
      const inputWorkspace = {
        projects: [],
        members: [],
        updatedAt: new Date(),
      } as unknown as databaseTypes.IWorkspace;

      let errored = false;
      try {
        await WorkspaceModel.validateUpdateObject(inputWorkspace);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update an creator that does not exist', async () => {
      const creatorId = new mongoose.Types.ObjectId();

      const inputWorkspace = {
        projects: [],
        members: [],
        creator: {_id: creatorId} as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWorkspace;

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      let errored = false;
      try {
        await WorkspaceModel.validateUpdateObject(inputWorkspace);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(userIdExistsStub.calledOnce);
    });

    it('will not fail when trying to update an creator that does exist', async () => {
      const creatorId = new mongoose.Types.ObjectId();

      const inputWorkspace = {
        projects: [],
        members: [],
        creator: {_id: creatorId} as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.IWorkspace;

      const userIdExistsStub = sandbox.stub();
      userIdExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userIdExistsStub);

      await WorkspaceModel.validateUpdateObject(inputWorkspace);
      assert.isTrue(userIdExistsStub.calledOnce);
    });
  });

  context('Delete an workspace document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove an workspace', async () => {
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

  context('allWorkspace1IdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the workspace ids exist', async () => {
      const workspaceIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedWorkspaceIds = workspaceIds.map(workspaceId => {
        return {
          _id: workspaceId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedWorkspaceIds);
      sandbox.replace(WorkspaceModel, 'find', findStub);

      assert.isTrue(
        await WorkspaceModel.allWorkspaceIdsExist(workspaceIds)
      );
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const workspaceIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

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
        assert.strictEqual(
          err.data.value[0].toString(),
          workspaceIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const workspaceIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

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

  context('validate members', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the members can be validated', async () => {
      const inputMembers = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IMember,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IMember,
      ];

      const allMemberIdsExistStub = sandbox.stub();
      allMemberIdsExistStub.resolves(true);
      sandbox.replace(MemberModel, 'allMemberIdsExist', allMemberIdsExistStub);

      const results = await WorkspaceModel.validateMembers(inputMembers);

      assert.strictEqual(results.length, inputMembers.length);
      results.forEach(r => {
        const foundId = inputMembers.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the memberIds can be validated ', async () => {
      const inputMembers = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allMemberIdsExistStub = sandbox.stub();
      allMemberIdsExistStub.resolves(true);
      sandbox.replace(MemberModel, 'allMemberIdsExist', allMemberIdsExistStub);

      const results = await WorkspaceModel.validateMembers(inputMembers);

      assert.strictEqual(results.length, inputMembers.length);
      results.forEach(r => {
        const foundId = inputMembers.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputMembers = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allMemberIdsExistStub = sandbox.stub();
      allMemberIdsExistStub.rejects(
        new error.DataNotFoundError(
          'the user ids cannot be found',
          'userIds',
          inputMembers
        )
      );
      sandbox.replace(MemberModel, 'allMemberIdsExist', allMemberIdsExistStub);

      let errored = false;
      try {
        await WorkspaceModel.validateMembers(inputMembers);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputMembers = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const errorText = 'something bad has happened';

      const allMemberIdsExistStub = sandbox.stub();
      allMemberIdsExistStub.rejects(errorText);
      sandbox.replace(MemberModel, 'allMemberIdsExist', allMemberIdsExistStub);

      let errored = false;
      try {
        await WorkspaceModel.validateMembers(inputMembers);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validate projects', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the projects can be validated', async () => {
      const inputProjects = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProject,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProject,
      ];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.resolves(true);
      sandbox.replace(
        ProjectModel,
        'allProjectIdsExist',
        allProjectIdsExistStub
      );

      const results = await WorkspaceModel.validateProjects(inputProjects);

      assert.strictEqual(results.length, inputProjects.length);
      results.forEach(r => {
        const foundId = inputProjects.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the projectIds can be validated ', async () => {
      const inputProjects = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.resolves(true);
      sandbox.replace(
        ProjectModel,
        'allProjectIdsExist',
        allProjectIdsExistStub
      );

      const results = await WorkspaceModel.validateProjects(inputProjects);

      assert.strictEqual(results.length, inputProjects.length);
      results.forEach(r => {
        const foundId = inputProjects.find(
          p => p._id?.toString() === r.toString()
        );
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputProjects = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.rejects(
        new error.DataNotFoundError(
          'the project ids cannot be found',
          'projectIds',
          inputProjects
        )
      );
      sandbox.replace(
        ProjectModel,
        'allProjectIdsExist',
        allProjectIdsExistStub
      );

      let errored = false;
      try {
        await WorkspaceModel.validateProjects(inputProjects);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputProjects = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const errorText = 'something bad has happened';

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.rejects(errorText);
      sandbox.replace(
        ProjectModel,
        'allProjectIdsExist',
        allProjectIdsExistStub
      );

      let errored = false;
      try {
        await WorkspaceModel.validateProjects(inputProjects);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('getWorkspaceById', () => {
    const mockWorkspace = {
      _id: new mongoose.Types.ObjectId(),
      name: 'testWorkspace',
      description: 'This is a test workspace',
      members: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test member1',
          __v: 1,
        } as unknown as databaseTypes.IUser,
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test member2',
          __v: 1,
        } as unknown as databaseTypes.IUser,
      ],
      projects: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test project1',
          __v: 1,
        } as unknown as databaseTypes.IProject,
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test project2',
          __v: 1,
        } as unknown as databaseTypes.IProject,
      ],
      __v: 1,
      creator: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test user',
        __v: 1,
      } as unknown as databaseTypes.IUser,
    };
    const sandbox = createSandbox();
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

    afterEach(() => {
      sandbox.restore();
    });

    it('will get an workspace', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockWorkspace));
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const doc = await WorkspaceModel.getWorkspaceById(
        mockWorkspace._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.creator as any).__v);
      doc.members.forEach(m => {
        assert.isUndefined((m as any).__v);
      });

      doc.projects.forEach(p => {
        assert.isUndefined((p as any).__v);
      });

      assert.strictEqual(doc._id, mockWorkspace._id);
    });

    it('will throw a DataNotFoundError when the workspace does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await WorkspaceModel.getWorkspaceById(
          mockWorkspace._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(
        new MockMongooseQuery('something bad happened', true)
      );
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await WorkspaceModel.getWorkspaceById(
          mockWorkspace._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('addProjects', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add a project to an workspace', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrg = JSON.parse(JSON.stringify(MOCK_WORKSPACE));
      localMockOrg._id = orgId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrg);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        WorkspaceModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrg);
      localMockOrg.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockOrg);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      const updatedWorkspace = await WorkspaceModel.addProjects(orgId, [
        projectId,
      ]);

      assert.strictEqual(updatedWorkspace._id, orgId);
      assert.strictEqual(
        updatedWorkspace.projects[0].toString(),
        projectId.toString()
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateProjectsStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getWorkspaceByIdStub.calledOnce);
    });

    it('will not save when a project is already attached to an workspace', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrg = JSON.parse(JSON.stringify(MOCK_WORKSPACE));
      localMockOrg._id = orgId;
      const projectId = new mongoose.Types.ObjectId();
      localMockOrg.projects.push(projectId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrg);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        WorkspaceModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrg);
      localMockOrg.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockOrg);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      const updatedWorkspace = await WorkspaceModel.addProjects(orgId, [
        projectId,
      ]);

      assert.strictEqual(updatedWorkspace._id, orgId);
      assert.strictEqual(
        updatedWorkspace.projects[0].toString(),
        projectId.toString()
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateProjectsStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getWorkspaceByIdStub.calledOnce);
    });

    it('will throw a data not found error when the workspace does not exist', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = orgId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        WorkspaceModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getOrgByIdStub = sandbox.stub();
      getOrgByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', getOrgByIdStub);

      let errored = false;
      try {
        await WorkspaceModel.addProjects(orgId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when project id does not exist', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = orgId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.rejects(
        new error.DataValidationError(
          'The projects id does not exist',
          'projectId',
          projectId
        )
      );
      sandbox.replace(
        WorkspaceModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      let errored = false;
      try {
        await WorkspaceModel.addProjects(orgId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = workspaceId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        WorkspaceModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      let errored = false;
      try {
        await WorkspaceModel.addProjects(workspaceId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the projects array is empty', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = workspaceId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        WorkspaceModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      let errored = false;
      try {
        await WorkspaceModel.addProjects(workspaceId, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('removeProjects', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove a project from the workspace', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = workspaceId;
      const projectId = new mongoose.Types.ObjectId();
      localMockWorkspace.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      const updatedWorkspace = await WorkspaceModel.removeProjects(
        workspaceId,
        [projectId]
      );

      assert.strictEqual(updatedWorkspace._id, workspaceId);
      assert.strictEqual(updatedWorkspace.projects.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getWorkspaceByIdStub.calledOnce);
    });

    it('will remove a project from the workspace passing in an IProject', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = workspaceId;
      const projectId = new mongoose.Types.ObjectId();
      localMockWorkspace.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      const updatedWorkspace = await WorkspaceModel.removeProjects(
        workspaceId,
        [{_id: projectId} as unknown as databaseTypes.IProject]
      );

      assert.strictEqual(updatedWorkspace._id, workspaceId);
      assert.strictEqual(updatedWorkspace.projects.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getWorkspaceByIdStub.calledOnce);
    });
    it('will not modify the projects if the projectid are not on the workspaces projects', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = orgId;
      const projectId = new mongoose.Types.ObjectId();
      localMockWorkspace.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      const updatedWorkspace = await WorkspaceModel.removeProjects(
        orgId,
        [new mongoose.Types.ObjectId()]
      );

      assert.strictEqual(updatedWorkspace._id, orgId);
      assert.strictEqual(updatedWorkspace.projects.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getWorkspaceByIdStub.calledOnce);
    });

    it('will throw a data not found error when the workspace does not exist', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = orgId;
      const projectId = new mongoose.Types.ObjectId();
      localMockWorkspace.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      let errored = false;
      try {
        await WorkspaceModel.removeProjects(orgId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = workspaceId;
      const projectId = new mongoose.Types.ObjectId();
      localMockWorkspace.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      let errored = false;
      try {
        await WorkspaceModel.removeProjects(workspaceId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the projects array is empty', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = orgId;
      const projectId = new mongoose.Types.ObjectId();
      localMockWorkspace.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      let errored = false;
      try {
        await WorkspaceModel.removeProjects(orgId, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('addmembers', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add a member to an workspace', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrg = JSON.parse(JSON.stringify(MOCK_WORKSPACE));
      localMockOrg._id = orgId;
      const userId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrg);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([userId]);
      sandbox.replace(
        WorkspaceModel,
        'validateMembers',
        validateMembersStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrg);
      localMockOrg.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockOrg);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      const updatedWorkspace = await WorkspaceModel.addMembers(orgId, [
        userId,
      ]);

      assert.strictEqual(updatedWorkspace._id, orgId);
      assert.strictEqual(
        updatedWorkspace.members[0].toString(),
        userId.toString()
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateMembersStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getWorkspaceByIdStub.calledOnce);
    });

    it('will not save when a member is already attached to an workspace', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockOrg = JSON.parse(JSON.stringify(MOCK_WORKSPACE));
      localMockOrg._id = orgId;
      const userId = new mongoose.Types.ObjectId();
      localMockOrg.members.push(userId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockOrg);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([userId]);
      sandbox.replace(
        WorkspaceModel,
        'validateMembers',
        validateMembersStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockOrg);
      localMockOrg.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockOrg);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      const updatedWorkspace = await WorkspaceModel.addMembers(orgId, [
        userId,
      ]);

      assert.strictEqual(updatedWorkspace._id, orgId);
      assert.strictEqual(
        updatedWorkspace.members[0].toString(),
        userId.toString()
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateMembersStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getWorkspaceByIdStub.calledOnce);
    });

    it('will throw a data not found error when the workspace does not exist', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = orgId;
      const userId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([userId]);
      sandbox.replace(
        WorkspaceModel,
        'validateMembers',
        validateMembersStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getOrgByIdStub = sandbox.stub();
      getOrgByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'getWorkspaceById', getOrgByIdStub);

      let errored = false;
      try {
        await WorkspaceModel.addMembers(orgId, [userId]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when user id does not exist', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = orgId;
      const userId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.rejects(
        new error.DataValidationError(
          'The user id does not exist',
          'userId',
          userId
        )
      );
      sandbox.replace(
        WorkspaceModel,
        'validateMembers',
        validateMembersStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      let errored = false;
      try {
        await WorkspaceModel.addMembers(orgId, [userId]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = workspaceId;
      const userId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([userId]);
      sandbox.replace(
        WorkspaceModel,
        'validateMembers',
        validateMembersStub
      );

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      let errored = false;
      try {
        await WorkspaceModel.addMembers(workspaceId, [userId]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the members array is empty', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = workspaceId;
      const userId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const validateMembersStub = sandbox.stub();
      validateMembersStub.resolves([userId]);
      sandbox.replace(
        WorkspaceModel,
        'validateMembers',
        validateMembersStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      let errored = false;
      try {
        await WorkspaceModel.addMembers(workspaceId, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('removeMembers', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove a member from the workspace', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = workspaceId;
      const userId = new mongoose.Types.ObjectId();
      localMockWorkspace.members.push(userId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      const updatedWorkspace = await WorkspaceModel.removeMembers(
        workspaceId,
        [userId]
      );

      assert.strictEqual(updatedWorkspace._id, workspaceId);
      assert.strictEqual(updatedWorkspace.members.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getWorkspaceByIdStub.calledOnce);
    });

    it('will remove a member from the workspace passing in an IUser', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = workspaceId;
      const userId = new mongoose.Types.ObjectId();
      localMockWorkspace.members.push(userId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      const updatedWorkspace = await WorkspaceModel.removeMembers(
        workspaceId,
        [{_id: userId} as unknown as databaseTypes.IMember]
      );

      assert.strictEqual(updatedWorkspace._id, workspaceId);
      assert.strictEqual(updatedWorkspace.members.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getWorkspaceByIdStub.calledOnce);
    });
    it('will not modify the membersif the userIds are not on the workspaces members', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = orgId;
      const userId = new mongoose.Types.ObjectId();
      localMockWorkspace.members.push(userId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      const updatedWorkspace = await WorkspaceModel.removeMembers(orgId, [
        new mongoose.Types.ObjectId(),
      ]);

      assert.strictEqual(updatedWorkspace._id, orgId);
      assert.strictEqual(updatedWorkspace.members.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getWorkspaceByIdStub.calledOnce);
    });

    it('will throw a data not found error when the workspace does not exist', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = orgId;
      const userId = new mongoose.Types.ObjectId();
      localMockWorkspace.members.push(userId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      let errored = false;
      try {
        await WorkspaceModel.removeMembers(orgId, [userId]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const workspaceId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = workspaceId;
      const userId = new mongoose.Types.ObjectId();
      localMockWorkspace.members.push(userId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockWorkspace);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      let errored = false;
      try {
        await WorkspaceModel.removeMembers(workspaceId, [userId]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the members array is empty', async () => {
      const orgId = new mongoose.Types.ObjectId();
      const localMockWorkspace = JSON.parse(
        JSON.stringify(MOCK_WORKSPACE)
      );
      localMockWorkspace._id = orgId;
      const userId = new mongoose.Types.ObjectId();
      localMockWorkspace.members.push(userId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(WorkspaceModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockWorkspace);
      localMockWorkspace.save = saveStub;

      const getWorkspaceByIdStub = sandbox.stub();
      getWorkspaceByIdStub.resolves(localMockWorkspace);
      sandbox.replace(
        WorkspaceModel,
        'getWorkspaceById',
        getWorkspaceByIdStub
      );

      let errored = false;
      try {
        await WorkspaceModel.removeMembers(orgId, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});

import {ProjectTypeModel} from '../../..//mongoose/models/projectType';
import {ProjectModel} from '../../../mongoose/models/project';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';
import {assert} from 'chai';

const MOCK_PROJECT_TYPE: databaseTypes.IProjectType = {
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'testProjectType',
  projects: [
    {_id: new mongoose.Types.ObjectId()} as unknown as databaseTypes.IProject,
  ],
  shape: {foo: {type: 'string', required: true}},
};

describe('#mongoose/models/projectType', () => {
  context('projetTypeIdExists', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the projectTypeId exists', async () => {
      const projectTypeId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: projectTypeId});
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const result = await ProjectTypeModel.projectTypeIdExists(projectTypeId);

      assert.isTrue(result);
    });

    it('should return false if the projectTypeId does not exist', async () => {
      const projectTypeId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const result = await ProjectTypeModel.projectTypeIdExists(projectTypeId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const projectTypeId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await ProjectTypeModel.projectTypeIdExists(projectTypeId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('createProjectType', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a projectType document', async () => {
      sandbox.replace(
        ProjectTypeModel,
        'validateProjects',
        sandbox.stub().resolves(MOCK_PROJECT_TYPE.projects.map(p => p._id))
      );

      const projectTypeId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProjectTypeModel,
        'create',
        sandbox.stub().resolves([{_id: projectTypeId}])
      );
      sandbox.replace(
        ProjectTypeModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      const stub = sandbox.stub();
      stub.resolves({_id: projectTypeId});
      sandbox.replace(ProjectTypeModel, 'getProjectTypeById', stub);
      const projectTypeDocument = await ProjectTypeModel.createProjectType(
        MOCK_PROJECT_TYPE
      );

      assert.strictEqual(projectTypeDocument._id, projectTypeId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when a validator throws one', async () => {
      sandbox.replace(
        ProjectTypeModel,
        'validateProjects',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'This data is not valid',
              'projects',
              {}
            )
          )
      );
      const projectTypeId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProjectTypeModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        ProjectTypeModel,
        'create',
        sandbox.stub().resolves([{_id: projectTypeId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: projectTypeId});
      sandbox.replace(ProjectTypeModel, 'getProjectTypeById', stub);
      let hasError = false;
      try {
        await ProjectTypeModel.createProjectType(MOCK_PROJECT_TYPE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        ProjectTypeModel,
        'validateProjects',
        sandbox.stub().resolves(MOCK_PROJECT_TYPE.projects.map(p => p._id))
      );

      const projectTypeId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProjectTypeModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        ProjectTypeModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );
      const stub = sandbox.stub();
      stub.resolves({_id: projectTypeId});
      sandbox.replace(ProjectTypeModel, 'getProjectTypeById', stub);
      let hasError = false;
      try {
        await ProjectTypeModel.createProjectType(MOCK_PROJECT_TYPE);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        ProjectTypeModel,
        'validateProjects',
        sandbox.stub().resolves(MOCK_PROJECT_TYPE.projects.map(p => p._id))
      );

      const projectTypeId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProjectTypeModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        ProjectTypeModel,
        'create',
        sandbox.stub().resolves([{}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: projectTypeId});
      sandbox.replace(ProjectTypeModel, 'getProjectTypeById', stub);
      let hasError = false;
      try {
        await ProjectTypeModel.createProjectType(MOCK_PROJECT_TYPE);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        ProjectTypeModel,
        'validateProjects',
        sandbox.stub().resolves(MOCK_PROJECT_TYPE.projects.map(p => p._id))
      );

      const projectTypeId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProjectTypeModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        ProjectTypeModel,
        'create',
        sandbox.stub().resolves([{_id: projectTypeId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: projectTypeId});
      sandbox.replace(ProjectTypeModel, 'getProjectTypeById', stub);
      let hasError = false;
      try {
        await ProjectTypeModel.createProjectType(MOCK_PROJECT_TYPE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('updateProjectTypeById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update an existing project type', async () => {
      const updateProjectType = {
        name: 'Some random project type',
      };

      const projectTypeId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProjectTypeModel, 'updateOne', updateStub);

      const getProjectTypeStub = sandbox.stub();
      getProjectTypeStub.resolves({_id: projectTypeId});
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeStub
      );

      const result = await ProjectTypeModel.updateProjectTypeById(
        projectTypeId,
        updateProjectType
      );

      assert.strictEqual(result._id, projectTypeId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getProjectTypeStub.calledOnce);
    });

    it('Will fail when the projectType does not exist', async () => {
      const updateProjectType = {
        name: 'Some random project type',
      };

      const projectTypeId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(ProjectTypeModel, 'updateOne', updateStub);

      const getProjectTypeStub = sandbox.stub();
      getProjectTypeStub.resolves({_id: projectTypeId});
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeStub
      );

      let errorred = false;
      try {
        await ProjectTypeModel.updateProjectTypeById(
          projectTypeId,
          updateProjectType
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateProjectType = {
        name: 'Some random project type',
      };

      const projectTypeId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProjectTypeModel, 'updateOne', updateStub);

      const getProjectTypeStub = sandbox.stub();
      getProjectTypeStub.resolves({_id: projectTypeId});
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeStub
      );

      sandbox.replace(
        ProjectTypeModel,
        'validateUpdateObject',
        sandbox
          .stub()
          .throws(new error.InvalidOperationError("You can't do this", {}))
      );
      let errorred = false;
      try {
        await ProjectTypeModel.updateProjectTypeById(
          projectTypeId,
          updateProjectType
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateProjectType = {
        name: 'Some random project type',
      };

      const projectTypeId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(ProjectTypeModel, 'updateOne', updateStub);

      const getProjectTypeStub = sandbox.stub();
      getProjectTypeStub.resolves({_id: projectTypeId});
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeStub
      );

      let errorred = false;
      try {
        await ProjectTypeModel.updateProjectTypeById(
          projectTypeId,
          updateProjectType
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('validateUpdateObject', () => {
    it('will succeed when no restricted fields are present', () => {
      const inputProjectType = {
        name: 'Some random project type',
        shape: {
          one: {
            type: 'foo',
            required: true,
          },
        },
      } as unknown as Omit<Partial<databaseTypes.IProjectType>, '_id'>;

      ProjectTypeModel.validateUpdateObject(inputProjectType);
    });

    it('will fail when trying to update projects', () => {
      const inputProjectType = {
        name: 'Some random project type',
        shape: {
          one: {
            type: 'foo',
            required: true,
          },
        },
        projects: [
          {
            _id: new mongoose.Types.ObjectId(),
          } as unknown as databaseTypes.IProject,
        ],
      } as unknown as Omit<Partial<databaseTypes.IProjectType>, '_id'>;

      assert.throws(() => {
        ProjectTypeModel.validateUpdateObject(inputProjectType);
      }, error.InvalidOperationError);
    });

    it('will fail when trying to update _id', () => {
      const inputProjectType = {
        _id: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.IProjectType;

      assert.throws(() => {
        ProjectTypeModel.validateUpdateObject(inputProjectType);
      }, error.InvalidOperationError);
    });

    it('will fail when trying to update createdAt', () => {
      const inputProjectType = {
        createdAt: new Date(),
      };

      assert.throws(() => {
        ProjectTypeModel.validateUpdateObject(inputProjectType);
      }, error.InvalidOperationError);
    });

    it('will fail when trying to update updatedAt', () => {
      const inputProjectType = {
        updatedAt: new Date(),
      };

      assert.throws(() => {
        ProjectTypeModel.validateUpdateObject(inputProjectType);
      }, error.InvalidOperationError);
    });

    it('will fail when trying to update shape with an invalid shape', () => {
      const inputProjectType = {
        shape: {
          foo: 'bar',
        },
      } as unknown as databaseTypes.IProjectType;

      assert.throws(() => {
        ProjectTypeModel.validateUpdateObject(inputProjectType);
      }, error.InvalidArgumentError);
    });
  });

  context('Delete a project type document', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a projectType', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(ProjectTypeModel, 'deleteOne', deleteStub);

      const projectTypeId = new mongoose.Types.ObjectId();

      await ProjectTypeModel.deleteProjectTypeById(projectTypeId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the projectType does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(ProjectTypeModel, 'deleteOne', deleteStub);

      const projectTypeId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ProjectTypeModel.deleteProjectTypeById(projectTypeId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(ProjectTypeModel, 'deleteOne', deleteStub);

      const projectTypeId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ProjectTypeModel.deleteProjectTypeById(projectTypeId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
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

      const results = await ProjectTypeModel.validateProjects(inputProjects);

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

      const results = await ProjectTypeModel.validateProjects(inputProjects);

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
        await ProjectTypeModel.validateProjects(inputProjects);
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
        await ProjectTypeModel.validateProjects(inputProjects);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('getProjectTypeById', () => {
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

    const mockProjectType: databaseTypes.IProjectType = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'test project type',
      shape: {foo: {type: 'string', required: true}},
      __v: 1,
      projects: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test project',
          __v: 1,
        } as unknown as databaseTypes.IProject,
      ],
    } as databaseTypes.IProjectType;
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a project document with the projects populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockProjectType));
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const doc = await ProjectTypeModel.getProjectTypeById(
        mockProjectType._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      doc.projects.forEach(p => assert.isUndefined((p as any).__v));

      assert.strictEqual(doc._id, mockProjectType._id);
    });

    it('will throw a DataNotFoundError when the projectType does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ProjectTypeModel.getProjectTypeById(
          mockProjectType._id as mongoose.Types.ObjectId
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
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ProjectTypeModel.getProjectTypeById(
          mockProjectType._id as mongoose.Types.ObjectId
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

    it('will add a project to a projectType', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TYPE));
      localMockProjType.projects = [];
      localMockProjType._id = projTypeId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        ProjectTypeModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTypeByIdStub = sandbox.stub();
      getProjectTypeByIdStub.resolves(localMockProjType);
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeByIdStub
      );

      const updatedProjectType = await ProjectTypeModel.addProjects(
        projTypeId,
        [projectId]
      );

      assert.strictEqual(updatedProjectType._id, projTypeId);
      assert.strictEqual(
        updatedProjectType.projects[0].toString(),
        projectId.toString()
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateProjectsStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getProjectTypeByIdStub.calledOnce);
    });

    it('will not save when a project is already attached to an project type', async () => {
      const projectTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TYPE));
      localMockProjType.projects = [];
      localMockProjType._id = projectTypeId;
      const projectId = new mongoose.Types.ObjectId();
      localMockProjType.projects.push(projectId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        ProjectTypeModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTypeByIdStub = sandbox.stub();
      getProjectTypeByIdStub.resolves(localMockProjType);
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeByIdStub
      );

      const updatedProjectType = await ProjectTypeModel.addProjects(
        projectTypeId,
        [projectId]
      );

      assert.strictEqual(updatedProjectType._id, projectTypeId);
      assert.strictEqual(
        updatedProjectType.projects[0].toString(),
        projectId.toString()
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateProjectsStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getProjectTypeByIdStub.calledOnce);
    });

    it('will throw a data not found error when the project type does not exist', async () => {
      const projectTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TYPE));
      localMockProjType._id = projectTypeId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        ProjectTypeModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTypeByIdStub = sandbox.stub();
      getProjectTypeByIdStub.resolves(localMockProjType);
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeByIdStub
      );

      let errored = false;
      try {
        await ProjectTypeModel.addProjects(projectTypeId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when project id does not exist', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TYPE));
      localMockProjType._id = projTypeId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.rejects(
        new error.DataValidationError(
          'The projects id does not exist',
          'projectId',
          projectId
        )
      );
      sandbox.replace(
        ProjectTypeModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTypeByIdStub = sandbox.stub();
      getProjectTypeByIdStub.resolves(localMockProjType);
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeByIdStub
      );

      let errored = false;
      try {
        await ProjectTypeModel.addProjects(projTypeId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const projectTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TYPE));
      localMockProjType._id = projectTypeId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        ProjectTypeModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockProjType.save = saveStub;

      const getProjectTypeByIdStub = sandbox.stub();
      getProjectTypeByIdStub.resolves(localMockProjType);
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeByIdStub
      );

      let errored = false;
      try {
        await ProjectTypeModel.addProjects(projectTypeId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the projects array is empty', async () => {
      const projectTypwId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TYPE));
      localMockProjType._id = projectTypwId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(
        ProjectTypeModel,
        'validateProjects',
        validateProjectsStub
      );

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTypeByIdStub = sandbox.stub();
      getProjectTypeByIdStub.resolves(localMockProjType);
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeByIdStub
      );

      let errored = false;
      try {
        await ProjectTypeModel.addProjects(projectTypwId, []);
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

    it('will remove a project from the projectType', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TYPE));
      localMockProjType._id = projTypeId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockProjType.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTypeByIdStub = sandbox.stub();
      getProjectTypeByIdStub.resolves(localMockProjType);
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeByIdStub
      );

      const updatedProjectType = await ProjectTypeModel.removeProjects(
        projTypeId,
        [projectId]
      );

      assert.strictEqual(updatedProjectType._id, projTypeId);
      assert.strictEqual(updatedProjectType.projects.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getProjectTypeByIdStub.calledOnce);
    });

    it('will not modify the projects if the projectid are not on the project type projects', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TYPE));
      localMockProjType._id = projTypeId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockProjType.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTypeByIdStub = sandbox.stub();
      getProjectTypeByIdStub.resolves(localMockProjType);
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeByIdStub
      );

      const updatedProjectType = await ProjectTypeModel.removeProjects(
        projTypeId,
        [new mongoose.Types.ObjectId()]
      );

      assert.strictEqual(updatedProjectType._id, projTypeId);
      assert.strictEqual(updatedProjectType.projects.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getProjectTypeByIdStub.calledOnce);
    });

    it('will throw a data not found error when the project type does not exist', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TYPE));
      localMockProjType._id = projTypeId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockProjType.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTypeByIdStub = sandbox.stub();
      getProjectTypeByIdStub.resolves(localMockProjType);
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeByIdStub
      );

      let errored = false;
      try {
        await ProjectTypeModel.removeProjects(projTypeId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const projectTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TYPE));
      localMockProjType._id = projectTypeId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockProjType.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockProjType.save = saveStub;

      const getProjectTypeByIdStub = sandbox.stub();
      getProjectTypeByIdStub.resolves(localMockProjType);
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeByIdStub
      );

      let errored = false;
      try {
        await ProjectTypeModel.removeProjects(projectTypeId, [projectId]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the projects array is empty', async () => {
      const projectTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TYPE));
      localMockProjType._id = projectTypeId;
      const projectId = new mongoose.Types.ObjectId();
      localMockProjType.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTypeModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTypeByIdStub = sandbox.stub();
      getProjectTypeByIdStub.resolves(localMockProjType);
      sandbox.replace(
        ProjectTypeModel,
        'getProjectTypeById',
        getProjectTypeByIdStub
      );

      let errored = false;
      try {
        await ProjectTypeModel.removeProjects(projectTypeId, []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});

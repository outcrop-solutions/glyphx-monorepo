import {ProjectTypeModel} from '../../..//mongoose/models/projectType';
import {ProjectModel} from '../../../mongoose/models/project';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';
import {assert} from 'chai';

const mockProjectType: databaseTypes.IProjectType = {
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
        sandbox.stub().resolves(mockProjectType.projects.map(p => p._id))
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
        mockProjectType
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
        await ProjectTypeModel.createProjectType(mockProjectType);
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
        sandbox.stub().resolves(mockProjectType.projects.map(p => p._id))
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
        await ProjectTypeModel.createProjectType(mockProjectType);
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
        sandbox.stub().resolves(mockProjectType.projects.map(p => p._id))
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
        await ProjectTypeModel.createProjectType(mockProjectType);
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
        sandbox.stub().resolves(mockProjectType.projects.map(p => p._id))
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
        await ProjectTypeModel.createProjectType(mockProjectType);
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

  context.only('getProjectTypeById', () => {
    class mockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError: boolean = false) {
        this.mockData = input;
        this.throwError = throwError;
      }
      populate(input: string) {
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
      findByIdStub.returns(new mockMongooseQuery(mockProjectType));
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
      findByIdStub.returns(new mockMongooseQuery(null));
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
        new mockMongooseQuery('something bad happened', true)
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
});

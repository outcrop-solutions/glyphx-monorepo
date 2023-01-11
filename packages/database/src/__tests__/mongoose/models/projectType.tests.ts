import {ProjectTypeModel} from '../../..//mongoose/models/projectType';
import {ProjectModel} from '../../../mongoose/models/project';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';
import {assert} from 'chai';

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
});

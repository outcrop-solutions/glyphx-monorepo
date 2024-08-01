import {ProjectTemplateModel} from '../../../mongoose/models/projectTemplate';
import {ProjectModel} from '../../../mongoose/models/project';
import {databaseTypes, fileIngestionTypes, webTypes} from 'types';
import {error} from 'core';
import mongoose, {Types as mongooseTypes} from 'mongoose';
import {createSandbox} from 'sinon';
import {assert} from 'chai';
import {TagModel} from '../../../mongoose/models';

const MOCK_PROJECT_TEMPLATE: databaseTypes.IProjectTemplate = {
  createdAt: new Date(),
  updatedAt: new Date(),
  name: 'testProjectTemplate',
  projects: [{_id: new mongoose.Types.ObjectId()} as unknown as databaseTypes.IProject],
  tags: [],
  shape: {
    X: {
      axis: webTypes.constants.AXIS.X,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column X', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    Y: {
      axis: webTypes.constants.AXIS.Y,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column Y', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    Z: {
      axis: webTypes.constants.AXIS.Z,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column Z', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    A: {
      axis: webTypes.constants.AXIS.A,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column 1', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    B: {
      axis: webTypes.constants.AXIS.B,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column 2', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
    C: {
      axis: webTypes.constants.AXIS.C,
      accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
      key: 'Column 3', // corresponds to column name
      dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
      interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
      direction: webTypes.constants.DIRECTION_TYPE.ASC,
      filter: {
        min: 0,
        max: 0,
      },
    },
  },
};

describe('#mongoose/models/projectTemplate', () => {
  context('projetTemplateIdExists', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the projectTemplateId exists', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: projectTemplateId});
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const result = await ProjectTemplateModel.projectTemplateIdExists(projectTemplateId);

      assert.isTrue(result);
    });

    it('should return false if the projectTemplateId does not exist', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const result = await ProjectTemplateModel.projectTemplateIdExists(projectTemplateId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await ProjectTemplateModel.projectTemplateIdExists(projectTemplateId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allProjectTemplateIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the template ids exist', async () => {
      const templateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedTemplateIds = templateIds.map((projectId) => {
        return {
          _id: projectId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedTemplateIds);
      sandbox.replace(ProjectTemplateModel, 'find', findStub);

      assert.isTrue(await ProjectTemplateModel.allProjectTemplateIdsExist(templateIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const templateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedTemplateIds = [
        {
          _id: templateIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedTemplateIds);
      sandbox.replace(ProjectTemplateModel, 'find', findStub);
      let errored = false;
      try {
        await ProjectTemplateModel.allProjectTemplateIdsExist(templateIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual((err as any).data.value[0].toString(), templateIds[1].toString());
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const templateIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(ProjectTemplateModel, 'find', findStub);
      let errored = false;
      try {
        await ProjectTemplateModel.allProjectTemplateIdsExist(templateIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('createProjectTemplate', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a projectTemplate document', async () => {
      sandbox.replace(
        ProjectTemplateModel,
        'validateProjects',
        sandbox.stub().resolves(MOCK_PROJECT_TEMPLATE.projects.map((p) => p._id))
      );

      sandbox.replace(ProjectTemplateModel, 'validateTags', sandbox.stub().resolves(MOCK_PROJECT_TEMPLATE.tags));

      const projectTemplateId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectTemplateModel, 'create', sandbox.stub().resolves([{_id: projectTemplateId}]));
      sandbox.replace(ProjectTemplateModel, 'validate', sandbox.stub().resolves(true));
      const stub = sandbox.stub();
      stub.resolves({_id: projectTemplateId});
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', stub);
      const projectTemplateDocument = await ProjectTemplateModel.createProjectTemplate(MOCK_PROJECT_TEMPLATE);

      assert.strictEqual(projectTemplateDocument._id, projectTemplateId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when a validator throws one', async () => {
      sandbox.replace(
        ProjectTemplateModel,
        'validateProjects',
        sandbox.stub().rejects(new error.DataValidationError('This data is not valid', 'projects', {}))
      );
      sandbox.replace(ProjectTemplateModel, 'validateTags', sandbox.stub().resolves(MOCK_PROJECT_TEMPLATE.tags));

      const projectTemplateId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectTemplateModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ProjectTemplateModel, 'create', sandbox.stub().resolves([{_id: projectTemplateId}]));
      const stub = sandbox.stub();
      stub.resolves({_id: projectTemplateId});
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', stub);
      let hasError = false;
      try {
        await ProjectTemplateModel.createProjectTemplate(MOCK_PROJECT_TEMPLATE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        ProjectTemplateModel,
        'validateProjects',
        sandbox.stub().resolves(MOCK_PROJECT_TEMPLATE.projects.map((p) => p._id))
      );
      sandbox.replace(ProjectTemplateModel, 'validateTags', sandbox.stub().resolves(MOCK_PROJECT_TEMPLATE.tags));

      const projectTemplateId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectTemplateModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ProjectTemplateModel, 'create', sandbox.stub().rejects('oops, something bad has happened'));
      const stub = sandbox.stub();
      stub.resolves({_id: projectTemplateId});
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', stub);
      let hasError = false;
      try {
        await ProjectTemplateModel.createProjectTemplate(MOCK_PROJECT_TEMPLATE);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        ProjectTemplateModel,
        'validateProjects',
        sandbox.stub().resolves(MOCK_PROJECT_TEMPLATE.projects.map((p) => p._id))
      );

      sandbox.replace(ProjectTemplateModel, 'validateTags', sandbox.stub().resolves(MOCK_PROJECT_TEMPLATE.tags));

      const projectTemplateId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectTemplateModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(ProjectTemplateModel, 'create', sandbox.stub().resolves([{}]));
      const stub = sandbox.stub();
      stub.resolves({_id: projectTemplateId});
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', stub);
      let hasError = false;
      try {
        await ProjectTemplateModel.createProjectTemplate(MOCK_PROJECT_TEMPLATE);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        ProjectTemplateModel,
        'validateProjects',
        sandbox.stub().resolves(MOCK_PROJECT_TEMPLATE.projects.map((p) => p._id))
      );
      sandbox.replace(ProjectTemplateModel, 'validateTags', sandbox.stub().resolves(MOCK_PROJECT_TEMPLATE.tags));

      const projectTemplateId = new mongoose.Types.ObjectId();
      sandbox.replace(ProjectTemplateModel, 'validate', sandbox.stub().rejects('oops an error has occurred'));
      sandbox.replace(ProjectTemplateModel, 'create', sandbox.stub().resolves([{_id: projectTemplateId}]));
      const stub = sandbox.stub();
      stub.resolves({_id: projectTemplateId});
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', stub);
      let hasError = false;
      try {
        await ProjectTemplateModel.createProjectTemplate(MOCK_PROJECT_TEMPLATE);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('updateProjectTemplateById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update an existing project type', async () => {
      const updateProjectTemplate = {
        name: 'Some random project type',
      };

      const projectTemplateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProjectTemplateModel, 'updateOne', updateStub);

      const getProjectTemplateStub = sandbox.stub();
      getProjectTemplateStub.resolves({_id: projectTemplateId});
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateStub);

      const result = await ProjectTemplateModel.updateProjectTemplateById(
        projectTemplateId.toString(),
        updateProjectTemplate
      );

      assert.strictEqual(result._id, projectTemplateId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getProjectTemplateStub.calledOnce);
    });

    it('Will fail when the projectTemplate does not exist', async () => {
      const updateProjectTemplate = {
        name: 'Some random project type',
      };

      const projectTemplateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(ProjectTemplateModel, 'updateOne', updateStub);

      const getProjectTemplateStub = sandbox.stub();
      getProjectTemplateStub.resolves({_id: projectTemplateId});
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateStub);

      let errorred = false;
      try {
        await ProjectTemplateModel.updateProjectTemplateById(projectTemplateId.toString(), updateProjectTemplate);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateProjectTemplate = {
        name: 'Some random project type',
      };

      const projectTemplateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProjectTemplateModel, 'updateOne', updateStub);

      const getProjectTemplateStub = sandbox.stub();
      getProjectTemplateStub.resolves({_id: projectTemplateId});
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateStub);

      sandbox.replace(
        ProjectTemplateModel,
        'validateUpdateObject',
        sandbox.stub().throws(new error.InvalidOperationError("You can't do this", {}))
      );
      let errorred = false;
      try {
        await ProjectTemplateModel.updateProjectTemplateById(projectTemplateId.toString(), updateProjectTemplate);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateProjectTemplate = {
        name: 'Some random project type',
      };

      const projectTemplateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(ProjectTemplateModel, 'updateOne', updateStub);

      const getProjectTemplateStub = sandbox.stub();
      getProjectTemplateStub.resolves({_id: projectTemplateId});
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateStub);

      let errorred = false;
      try {
        await ProjectTemplateModel.updateProjectTemplateById(projectTemplateId.toString(), updateProjectTemplate);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('validateUpdateObject', () => {
    it('will succeed when no restricted fields are present', () => {
      const inputProjectTemplate = {
        name: 'Some random project type',
        shape: {
          one: {
            type: 'foo',
            required: true,
          },
        },
      } as unknown as Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>;

      ProjectTemplateModel.validateUpdateObject(inputProjectTemplate);
    });

    it('will fail when trying to update projects', () => {
      const inputProjectTemplate = {
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
      } as unknown as Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>;

      assert.throws(() => {
        ProjectTemplateModel.validateUpdateObject(inputProjectTemplate);
      }, error.InvalidOperationError);
    });

    it('will fail when trying to update _id', () => {
      const inputProjectTemplate = {
        _id: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.IProjectTemplate;

      assert.throws(() => {
        ProjectTemplateModel.validateUpdateObject(inputProjectTemplate);
      }, error.InvalidOperationError);
    });

    it('will fail when trying to update createdAt', () => {
      const inputProjectTemplate = {
        createdAt: new Date(),
      };

      assert.throws(() => {
        ProjectTemplateModel.validateUpdateObject(inputProjectTemplate);
      }, error.InvalidOperationError);
    });

    it('will fail when trying to update updatedAt', () => {
      const inputProjectTemplate = {
        updatedAt: new Date(),
      };

      assert.throws(() => {
        ProjectTemplateModel.validateUpdateObject(inputProjectTemplate);
      }, error.InvalidOperationError);
    });

    it('will fail when trying to update shape with an invalid shape', () => {
      const inputProjectTemplate = {
        shape: {
          foo: 'bar',
        },
      } as unknown as databaseTypes.IProjectTemplate;

      assert.throws(() => {
        ProjectTemplateModel.validateUpdateObject(inputProjectTemplate);
      }, error.InvalidArgumentError);
    });
  });

  context('Delete a project type document', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a projectTemplate', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(ProjectTemplateModel, 'deleteOne', deleteStub);

      const projectTemplateId = new mongoose.Types.ObjectId();

      await ProjectTemplateModel.deleteProjectTemplateById(projectTemplateId.toString());

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the projectTemplate does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(ProjectTemplateModel, 'deleteOne', deleteStub);

      const projectTemplateId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ProjectTemplateModel.deleteProjectTemplateById(projectTemplateId.toString());
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(ProjectTemplateModel, 'deleteOne', deleteStub);

      const projectTemplateId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ProjectTemplateModel.deleteProjectTemplateById(projectTemplateId.toString());
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
          id: new mongoose.Types.ObjectId().toString(),
        } as unknown as databaseTypes.IProject,
        {
          id: new mongoose.Types.ObjectId().toString(),
        } as unknown as databaseTypes.IProject,
      ];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.resolves(true);
      sandbox.replace(ProjectModel, 'allProjectIdsExist', allProjectIdsExistStub);

      const results = await ProjectTemplateModel.validateProjects(inputProjects);

      assert.strictEqual(results.length, inputProjects.length);
      results.forEach((r) => {
        const foundId = inputProjects.find((p) => p.id === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the projectIds can be validated ', async () => {
      const inputProjects = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.resolves(true);
      sandbox.replace(ProjectModel, 'allProjectIdsExist', allProjectIdsExistStub);

      const results = await ProjectTemplateModel.validateProjects(inputProjects);

      assert.strictEqual(results.length, inputProjects.length);
      results.forEach((r) => {
        const foundId = inputProjects.find((p) => p === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputProjects = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.rejects(
        new error.DataNotFoundError('the project ids cannot be found', 'projectIds', inputProjects)
      );
      sandbox.replace(ProjectModel, 'allProjectIdsExist', allProjectIdsExistStub);

      let errored = false;
      try {
        await ProjectTemplateModel.validateProjects(inputProjects);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputProjects = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const errorText = 'something bad has happened';

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.rejects(errorText);
      sandbox.replace(ProjectModel, 'allProjectIdsExist', allProjectIdsExistStub);

      let errored = false;
      try {
        await ProjectTemplateModel.validateProjects(inputProjects);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validate tags', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the tags can be validated', async () => {
      const inputTags = [
        {
          id: new mongoose.Types.ObjectId().toString(),
        } as unknown as databaseTypes.ITag,
        {
          id: new mongoose.Types.ObjectId().toString(),
        } as unknown as databaseTypes.ITag,
      ];

      const allTagIdsExistStub = sandbox.stub();
      allTagIdsExistStub.resolves(true);
      sandbox.replace(TagModel, 'allTagIdsExist', allTagIdsExistStub);

      const results = await ProjectTemplateModel.validateTags(inputTags);

      assert.strictEqual(results.length, inputTags.length);
      results.forEach((r) => {
        const foundId = inputTags.find((p) => p.id === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the tagIds can be validated ', async () => {
      const inputTags = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allTagIdsExistStub = sandbox.stub();
      allTagIdsExistStub.resolves(true);
      sandbox.replace(TagModel, 'allTagIdsExist', allTagIdsExistStub);

      const results = await ProjectTemplateModel.validateTags(inputTags);

      assert.strictEqual(results.length, inputTags.length);
      results.forEach((r) => {
        const foundId = inputTags.find((p) => p === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputTags = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allTagIdsExistStub = sandbox.stub();
      allTagIdsExistStub.rejects(new error.DataNotFoundError('the tag ids cannot be found', 'projectIds', inputTags));
      sandbox.replace(TagModel, 'allTagIdsExist', allTagIdsExistStub);

      let errored = false;
      try {
        await ProjectTemplateModel.validateTags(inputTags);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputTags = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const errorText = 'something bad has happened';

      const allTagIdsExistStub = sandbox.stub();
      allTagIdsExistStub.rejects(errorText);
      sandbox.replace(TagModel, 'allTagIdsExist', allTagIdsExistStub);

      let errored = false;
      try {
        await ProjectTemplateModel.validateTags(inputTags);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('getProjectTemplateById', () => {
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

    const mockProjectTemplate: databaseTypes.IProjectTemplate = {
      _id: new mongooseTypes.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      name: 'testProjectTemplate',
      projects: [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProject,
      ],
      tags: [],
      shape: {
        X: {
          axis: webTypes.constants.AXIS.X,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column X', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        Y: {
          axis: webTypes.constants.AXIS.Y,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column Y', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        Z: {
          axis: webTypes.constants.AXIS.Z,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column Z', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        A: {
          axis: webTypes.constants.AXIS.A,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column 1', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        B: {
          axis: webTypes.constants.AXIS.B,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column 2', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
        C: {
          axis: webTypes.constants.AXIS.C,
          accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
          key: 'Column 3', // corresponds to column name
          dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
          interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
          direction: webTypes.constants.DIRECTION_TYPE.ASC,
          filter: {
            min: 0,
            max: 0,
          },
        },
      },
    } as databaseTypes.IProjectTemplate;
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a project document with the projects populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockProjectTemplate));
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const doc = await ProjectTemplateModel.getProjectTemplateById(mockProjectTemplate._id!.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      doc.projects.forEach((p) => assert.isUndefined((p as any).__v));

      assert.strictEqual(doc.id, mockProjectTemplate._id?.toString());
    });

    it('will throw a DataNotFoundError when the projectTemplate does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.getProjectTemplateById(mockProjectTemplate._id!.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.getProjectTemplateById(mockProjectTemplate._id!.toString());
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

    it('will add a project to a projectTemplate', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockProjType.projects = [];
      localMockProjType._id = projTypeId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(ProjectTemplateModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      const updatedProjectTemplate = await ProjectTemplateModel.addProjects(projTypeId.toString(), [
        projectId.toString(),
      ]);

      assert.strictEqual(updatedProjectTemplate._id, projTypeId);
      assert.strictEqual(updatedProjectTemplate.projects[0].toString(), projectId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateProjectsStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getProjectTemplateByIdStub.calledOnce);
    });

    it('will not save when a project is already attached to an project type', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockProjType.projects = [];
      localMockProjType._id = projectTemplateId;
      const projectId = new mongoose.Types.ObjectId();
      localMockProjType.projects.push(projectId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(ProjectTemplateModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      const updatedProjectTemplate = await ProjectTemplateModel.addProjects(projectTemplateId.toString(), [
        projectId.toString(),
      ]);

      assert.strictEqual(updatedProjectTemplate._id, projectTemplateId);
      assert.strictEqual(updatedProjectTemplate.projects[0].toString(), projectId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateProjectsStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getProjectTemplateByIdStub.calledOnce);
    });

    it('will throw a data not found error when the project type does not exist', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockProjType._id = projectTemplateId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(ProjectTemplateModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.addProjects(projectTemplateId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when project id does not exist', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockProjType._id = projTypeId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.rejects(
        new error.DataValidationError('The projects id does not exist', 'projectId', projectId)
      );
      sandbox.replace(ProjectTemplateModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.addProjects(projTypeId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockProjType._id = projectTemplateId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(ProjectTemplateModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockProjType.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.addProjects(projectTemplateId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the projects array is empty', async () => {
      const projectTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockProjType._id = projectTypeId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(ProjectTemplateModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.addProjects(projectTypeId.toString(), []);
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

    it('will remove a project from the projectTemplate', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockProjType._id = projTypeId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockProjType.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      const updatedProjectTemplate = await ProjectTemplateModel.removeProjects(projTypeId.toString(), [
        projectId.toString(),
      ]);

      assert.strictEqual(updatedProjectTemplate._id, projTypeId);
      assert.strictEqual(updatedProjectTemplate.projects.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getProjectTemplateByIdStub.calledOnce);
    });

    it('will not modify the projects if the projectid are not on the project type projects', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockProjType._id = projTypeId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockProjType.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      const updatedProjectTemplate = await ProjectTemplateModel.removeProjects(projTypeId.toString(), [
        new mongoose.Types.ObjectId().toString(),
      ]);

      assert.strictEqual(updatedProjectTemplate._id, projTypeId);
      assert.strictEqual(updatedProjectTemplate.projects.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getProjectTemplateByIdStub.calledOnce);
    });

    it('will throw a data not found error when the project type does not exist', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockProjType._id = projTypeId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockProjType.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.removeProjects(projTypeId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockProjType._id = projectTemplateId;
      localMockProjType.projects = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockProjType.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockProjType.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.removeProjects(projectTemplateId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the projects array is empty', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const localMockProjType = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockProjType._id = projectTemplateId;
      const projectId = new mongoose.Types.ObjectId();
      localMockProjType.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockProjType);
      localMockProjType.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockProjType);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.removeProjects(projectTemplateId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('addTags', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add a tag to a projectTemplate', async () => {
      const templateId = new mongoose.Types.ObjectId();
      const localMockTemplate = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockTemplate.projects = [];
      localMockTemplate._id = templateId;
      const tagId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const validateTagsStub = sandbox.stub();
      validateTagsStub.resolves([tagId]);
      sandbox.replace(ProjectTemplateModel, 'validateTags', validateTagsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTemplate);
      localMockTemplate.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      const updatedProjectTemplate = await ProjectTemplateModel.addTags(templateId.toString(), [tagId.toString()]);

      assert.strictEqual(updatedProjectTemplate._id, templateId);
      assert.strictEqual(updatedProjectTemplate.tags[0].toString(), tagId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateTagsStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getProjectTemplateByIdStub.calledOnce);
    });

    it('will not save when a tag is already attached to a template', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const localMockTemplate = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockTemplate.tags = [];
      localMockTemplate._id = projectTemplateId;
      const tagId = new mongoose.Types.ObjectId();
      localMockTemplate.tags.push(tagId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const validateTagsStub = sandbox.stub();
      validateTagsStub.resolves([tagId]);
      sandbox.replace(ProjectTemplateModel, 'validateTags', validateTagsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTemplate);
      localMockTemplate.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      const updatedProjectTemplate = await ProjectTemplateModel.addTags(projectTemplateId.toString(), [
        tagId.toString(),
      ]);

      assert.strictEqual(updatedProjectTemplate._id, projectTemplateId);
      assert.strictEqual(updatedProjectTemplate.tags[0].toString(), tagId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateTagsStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getProjectTemplateByIdStub.calledOnce);
    });

    it('will throw a data not found error when the template does not exist', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const localMockTemplate = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockTemplate._id = projectTemplateId;
      localMockTemplate.tags = [];
      const tagId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const validateTagsStub = sandbox.stub();
      validateTagsStub.resolves([tagId]);
      sandbox.replace(ProjectTemplateModel, 'validateTags', validateTagsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTemplate);
      localMockTemplate.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.addTags(projectTemplateId.toString(), [tagId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when tag id does not exist', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockTemplate = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockTemplate._id = projTypeId;
      localMockTemplate.tags = [];
      const tagId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const validateTagsStub = sandbox.stub();
      validateTagsStub.rejects(new error.DataValidationError('The tags id does not exist', 'tagId', tagId));
      sandbox.replace(ProjectTemplateModel, 'validateTags', validateTagsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTemplate);
      localMockTemplate.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.addTags(projTypeId.toString(), [tagId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const localMockTemplate = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockTemplate._id = projectTemplateId;
      localMockTemplate.tags = [];
      const tagId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const validateTagsStub = sandbox.stub();
      validateTagsStub.resolves([tagId]);
      sandbox.replace(ProjectTemplateModel, 'validateTags', validateTagsStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockTemplate.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.addTags(projectTemplateId.toString(), [tagId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the tags array is empty', async () => {
      const templateId = new mongoose.Types.ObjectId();
      const localMockTemplate = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockTemplate._id = templateId;
      localMockTemplate.tags = [];
      const tagId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const validateTagsStub = sandbox.stub();
      validateTagsStub.resolves([tagId]);
      sandbox.replace(ProjectTemplateModel, 'validateTags', validateTagsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTemplate);
      localMockTemplate.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.addTags(templateId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('removeTags', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove a tag from the template', async () => {
      const templateId = new mongoose.Types.ObjectId();
      const localMockTemplate = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockTemplate._id = templateId;
      localMockTemplate.tags = [];
      const tagId = new mongoose.Types.ObjectId();
      localMockTemplate.tags.push(tagId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTemplate);
      localMockTemplate.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      const updatedProjectTemplate = await ProjectTemplateModel.removeTags(templateId.toString(), [tagId.toString()]);

      assert.strictEqual(updatedProjectTemplate._id, templateId);
      assert.strictEqual(updatedProjectTemplate.tags.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getProjectTemplateByIdStub.calledOnce);
    });

    it('will not modify the tags if the projectid are not on the template tags', async () => {
      const templateId = new mongoose.Types.ObjectId();
      const localMockTemplate = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockTemplate._id = templateId;
      localMockTemplate.tags = [];
      const tagId = new mongoose.Types.ObjectId();
      localMockTemplate.tags.push(tagId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTemplate);
      localMockTemplate.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      const updatedProjectTemplate = await ProjectTemplateModel.removeTags(templateId.toString(), [
        new mongoose.Types.ObjectId().toString(),
      ]);

      assert.strictEqual(updatedProjectTemplate._id, templateId);
      assert.strictEqual(updatedProjectTemplate.tags.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getProjectTemplateByIdStub.calledOnce);
    });

    it('will throw a data not found error when the template does not exist', async () => {
      const templateId = new mongoose.Types.ObjectId();
      const localMockTemplate = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockTemplate._id = templateId;
      localMockTemplate.tags = [];
      const tagId = new mongoose.Types.ObjectId();
      localMockTemplate.tags.push(tagId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTemplate);
      localMockTemplate.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.removeTags(templateId.toString(), [tagId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const localMockTemplate = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockTemplate._id = projectTemplateId;
      localMockTemplate.tags = [];
      const tagId = new mongoose.Types.ObjectId();
      localMockTemplate.tags.push(tagId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockTemplate.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.removeTags(projectTemplateId.toString(), [tagId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the tags array is empty', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const localMockTemplate = JSON.parse(JSON.stringify(MOCK_PROJECT_TEMPLATE));
      localMockTemplate._id = projectTemplateId;
      const tagId = new mongoose.Types.ObjectId();
      localMockTemplate.tags.push(tagId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTemplate);
      localMockTemplate.save = saveStub;

      const getProjectTemplateByIdStub = sandbox.stub();
      getProjectTemplateByIdStub.resolves(localMockTemplate);
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', getProjectTemplateByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.removeTags(projectTemplateId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryProjectTemplates', () => {
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

    const mockProjectTemplates = [
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testProjectTemplate',
        projects: [
          {
            _id: new mongoose.Types.ObjectId(),
          } as unknown as databaseTypes.IProject,
        ],
        tags: [],
        shape: {
          X: {
            axis: webTypes.constants.AXIS.X,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: 'Column X', // corresponds to column name
            dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter: {
              min: 0,
              max: 0,
            },
          },
          Y: {
            axis: webTypes.constants.AXIS.Y,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: 'Column Y', // corresponds to column name
            dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter: {
              min: 0,
              max: 0,
            },
          },
          Z: {
            axis: webTypes.constants.AXIS.Z,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: 'Column Z', // corresponds to column name
            dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter: {
              min: 0,
              max: 0,
            },
          },
          A: {
            axis: webTypes.constants.AXIS.A,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: 'Column 1', // corresponds to column name
            dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter: {
              min: 0,
              max: 0,
            },
          },
          B: {
            axis: webTypes.constants.AXIS.B,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: 'Column 2', // corresponds to column name
            dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter: {
              min: 0,
              max: 0,
            },
          },
          C: {
            axis: webTypes.constants.AXIS.C,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: 'Column 3', // corresponds to column name
            dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter: {
              min: 0,
              max: 0,
            },
          },
        },
      } as databaseTypes.IProjectTemplate,
      {
        createdAt: new Date(),
        updatedAt: new Date(),
        name: 'testProjectTemplate',
        projects: [
          {
            _id: new mongoose.Types.ObjectId(),
          } as unknown as databaseTypes.IProject,
        ],
        tags: [],
        shape: {
          X: {
            axis: webTypes.constants.AXIS.X,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: 'Column X', // corresponds to column name
            dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter: {
              min: 0,
              max: 0,
            },
          },
          Y: {
            axis: webTypes.constants.AXIS.Y,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: 'Column Y', // corresponds to column name
            dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter: {
              min: 0,
              max: 0,
            },
          },
          Z: {
            axis: webTypes.constants.AXIS.Z,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: 'Column Z', // corresponds to column name
            dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter: {
              min: 0,
              max: 0,
            },
          },
          A: {
            axis: webTypes.constants.AXIS.A,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: 'Column 1', // corresponds to column name
            dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter: {
              min: 0,
              max: 0,
            },
          },
          B: {
            axis: webTypes.constants.AXIS.B,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: 'Column 2', // corresponds to column name
            dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter: {
              min: 0,
              max: 0,
            },
          },
          C: {
            axis: webTypes.constants.AXIS.C,
            accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
            key: 'Column 3', // corresponds to column name
            dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
            interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
            direction: webTypes.constants.DIRECTION_TYPE.ASC,
            filter: {
              min: 0,
              max: 0,
            },
          },
        },
      } as databaseTypes.IProjectTemplate,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered projectTemplates', async () => {
      sandbox.replace(ProjectTemplateModel, 'count', sandbox.stub().resolves(mockProjectTemplates.length));

      sandbox.replace(
        ProjectTemplateModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockProjectTemplates))
      );

      const results = await ProjectTemplateModel.queryProjectTemplates({});

      assert.strictEqual(results.numberOfItems, mockProjectTemplates.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockProjectTemplates.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc) => {
        assert.isUndefined((doc as any).__v);
        doc.projects.forEach((p: any) => {
          assert.isUndefined((p as any).__v);
        });
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(ProjectTemplateModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        ProjectTemplateModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockProjectTemplates))
      );

      let errored = false;
      try {
        await ProjectTemplateModel.queryProjectTemplates();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(ProjectTemplateModel, 'count', sandbox.stub().resolves(mockProjectTemplates.length));

      sandbox.replace(
        ProjectTemplateModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockProjectTemplates))
      );

      let errored = false;
      try {
        await ProjectTemplateModel.queryProjectTemplates({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(ProjectTemplateModel, 'count', sandbox.stub().resolves(mockProjectTemplates.length));

      sandbox.replace(
        ProjectTemplateModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await ProjectTemplateModel.queryProjectTemplates({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});

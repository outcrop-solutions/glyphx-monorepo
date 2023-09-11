// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {ProjectTemplateModel} from '../../../mongoose/models/projectTemplate';
import * as mocks from '../../../mongoose/mocks';
import {ProjectModel} from '../../../mongoose/models/project';
import {TagModel} from '../../../mongoose/models/tag';
import {IQueryResult, databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/projectTemplate', () => {
  context('projectTemplateIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the projectTemplateId exists', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: projectTemplateId});
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const result =
        await ProjectTemplateModel.projectTemplateIdExists(projectTemplateId);

      assert.isTrue(result);
    });

    it('should return false if the projectTemplateId does not exist', async () => {
      const projectTemplateId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const result =
        await ProjectTemplateModel.projectTemplateIdExists(projectTemplateId);

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

    it('should return true when all the projectTemplate ids exist', async () => {
      const projectTemplateIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedProjectTemplateIds = projectTemplateIds.map(
        projectTemplateId => {
          return {
            _id: projectTemplateId,
          };
        }
      );

      const findStub = sandbox.stub();
      findStub.resolves(returnedProjectTemplateIds);
      sandbox.replace(ProjectTemplateModel, 'find', findStub);

      assert.isTrue(
        await ProjectTemplateModel.allProjectTemplateIdsExist(
          projectTemplateIds
        )
      );
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const projectTemplateIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedProjectTemplateIds = [
        {
          _id: projectTemplateIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedProjectTemplateIds);
      sandbox.replace(ProjectTemplateModel, 'find', findStub);
      let errored = false;
      try {
        await ProjectTemplateModel.allProjectTemplateIdsExist(
          projectTemplateIds
        );
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          projectTemplateIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const projectTemplateIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(ProjectTemplateModel, 'find', findStub);
      let errored = false;
      try {
        await ProjectTemplateModel.allProjectTemplateIdsExist(
          projectTemplateIds
        );
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
      let errored = false;

      try {
        await ProjectTemplateModel.validateUpdateObject(
          mocks.MOCK_PROJECTTEMPLATE as unknown as Omit<
            Partial<databaseTypes.IProjectTemplate>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      let errored = false;

      try {
        await ProjectTemplateModel.validateUpdateObject(
          mocks.MOCK_PROJECTTEMPLATE as unknown as Omit<
            Partial<databaseTypes.IProjectTemplate>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will fail when trying to update the _id', async () => {
      let errored = false;

      try {
        await ProjectTemplateModel.validateUpdateObject({
          ...mocks.MOCK_PROJECTTEMPLATE,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      let errored = false;

      try {
        await ProjectTemplateModel.validateUpdateObject({
          ...mocks.MOCK_PROJECTTEMPLATE,
          createdAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      let errored = false;

      try {
        await ProjectTemplateModel.validateUpdateObject({
          ...mocks.MOCK_PROJECTTEMPLATE,
          updatedAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
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
        sandbox.stub().resolves(mocks.MOCK_PROJECTTEMPLATE.projects)
      );
      sandbox.replace(
        ProjectTemplateModel,
        'validateTags',
        sandbox.stub().resolves(mocks.MOCK_PROJECTTEMPLATE.tags)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProjectTemplateModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(
        ProjectTemplateModel,
        'validate',
        sandbox.stub().resolves(true)
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', stub);

      const projectTemplateDocument =
        await ProjectTemplateModel.createProjectTemplate(
          mocks.MOCK_PROJECTTEMPLATE
        );

      assert.strictEqual(projectTemplateDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        ProjectTemplateModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_PROJECTTEMPLATE.projects)
      );
      sandbox.replace(
        ProjectTemplateModel,
        'validateTags',
        sandbox.stub().resolves(mocks.MOCK_PROJECTTEMPLATE.tags)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProjectTemplateModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        ProjectTemplateModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', stub);
      let hasError = false;
      try {
        await ProjectTemplateModel.createProjectTemplate(
          mocks.MOCK_PROJECTTEMPLATE
        );
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
        sandbox.stub().resolves(mocks.MOCK_PROJECTTEMPLATE.projects)
      );
      sandbox.replace(
        ProjectTemplateModel,
        'validateTags',
        sandbox.stub().resolves(mocks.MOCK_PROJECTTEMPLATE.tags)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProjectTemplateModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        ProjectTemplateModel,
        'create',
        sandbox.stub().resolves([{}])
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', stub);

      let hasError = false;
      try {
        await ProjectTemplateModel.createProjectTemplate(
          mocks.MOCK_PROJECTTEMPLATE
        );
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
        sandbox.stub().resolves(mocks.MOCK_PROJECTTEMPLATE.projects)
      );
      sandbox.replace(
        ProjectTemplateModel,
        'validateTags',
        sandbox.stub().resolves(mocks.MOCK_PROJECTTEMPLATE.tags)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        ProjectTemplateModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        ProjectTemplateModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(ProjectTemplateModel, 'getProjectTemplateById', stub);
      let hasError = false;
      try {
        await ProjectTemplateModel.createProjectTemplate(
          mocks.MOCK_PROJECTTEMPLATE
        );
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
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

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a projectTemplate document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_PROJECTTEMPLATE));
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      const doc = await ProjectTemplateModel.getProjectTemplateById(
        mocks.MOCK_PROJECTTEMPLATE._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.projects[0] as any)?.__v);
      assert.isUndefined((doc.tags[0] as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_PROJECTTEMPLATE._id);
    });

    it('will throw a DataNotFoundError when the projectTemplate does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.getProjectTemplateById(
          mocks.MOCK_PROJECTTEMPLATE._id as mongoose.Types.ObjectId
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
      sandbox.replace(ProjectTemplateModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await ProjectTemplateModel.getProjectTemplateById(
          mocks.MOCK_PROJECTTEMPLATE._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
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
        ...mocks.MOCK_PROJECTTEMPLATE,
        _id: new mongoose.Types.ObjectId(),
        projects: [],
        tags: [],
      } as databaseTypes.IProjectTemplate,
      {
        ...mocks.MOCK_PROJECTTEMPLATE,
        _id: new mongoose.Types.ObjectId(),
        projects: [],
        tags: [],
      } as databaseTypes.IProjectTemplate,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered projectTemplates', async () => {
      sandbox.replace(
        ProjectTemplateModel,
        'count',
        sandbox.stub().resolves(mockProjectTemplates.length)
      );

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
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.projects[0] as any)?.__v);
        assert.isUndefined((doc.tags[0] as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(
        ProjectTemplateModel,
        'count',
        sandbox.stub().resolves(0)
      );

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
      sandbox.replace(
        ProjectTemplateModel,
        'count',
        sandbox.stub().resolves(mockProjectTemplates.length)
      );

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
      sandbox.replace(
        ProjectTemplateModel,
        'count',
        sandbox.stub().resolves(mockProjectTemplates.length)
      );

      sandbox.replace(
        ProjectTemplateModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
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

  context('updateProjectTemplateById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a projectTemplate', async () => {
      const updateProjectTemplate = {
        ...mocks.MOCK_PROJECTTEMPLATE,
        deletedAt: new Date(),
        projects: [],
        tags: [],
      } as unknown as databaseTypes.IProjectTemplate;

      const projectTemplateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProjectTemplateModel, 'updateOne', updateStub);

      const getProjectTemplateStub = sandbox.stub();
      getProjectTemplateStub.resolves({_id: projectTemplateId});
      sandbox.replace(
        ProjectTemplateModel,
        'getProjectTemplateById',
        getProjectTemplateStub
      );

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(
        ProjectTemplateModel,
        'validateUpdateObject',
        validateStub
      );

      const result = await ProjectTemplateModel.updateProjectTemplateById(
        projectTemplateId,
        updateProjectTemplate
      );

      assert.strictEqual(result._id, projectTemplateId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getProjectTemplateStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a projectTemplate with references as ObjectIds', async () => {
      const updateProjectTemplate = {
        ...mocks.MOCK_PROJECTTEMPLATE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProjectTemplate;

      const projectTemplateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProjectTemplateModel, 'updateOne', updateStub);

      const getProjectTemplateStub = sandbox.stub();
      getProjectTemplateStub.resolves({_id: projectTemplateId});
      sandbox.replace(
        ProjectTemplateModel,
        'getProjectTemplateById',
        getProjectTemplateStub
      );

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(
        ProjectTemplateModel,
        'validateUpdateObject',
        validateStub
      );

      const result = await ProjectTemplateModel.updateProjectTemplateById(
        projectTemplateId,
        updateProjectTemplate
      );

      assert.strictEqual(result._id, projectTemplateId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getProjectTemplateStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the projectTemplate does not exist', async () => {
      const updateProjectTemplate = {
        ...mocks.MOCK_PROJECTTEMPLATE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProjectTemplate;

      const projectTemplateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(ProjectTemplateModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(
        ProjectTemplateModel,
        'validateUpdateObject',
        validateStub
      );

      const getProjectTemplateStub = sandbox.stub();
      getProjectTemplateStub.resolves({_id: projectTemplateId});
      sandbox.replace(
        ProjectTemplateModel,
        'getProjectTemplateById',
        getProjectTemplateStub
      );

      let errorred = false;
      try {
        await ProjectTemplateModel.updateProjectTemplateById(
          projectTemplateId,
          updateProjectTemplate
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateProjectTemplate = {
        ...mocks.MOCK_PROJECTTEMPLATE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProjectTemplate;

      const projectTemplateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(ProjectTemplateModel, 'updateOne', updateStub);

      const getProjectTemplateStub = sandbox.stub();
      getProjectTemplateStub.resolves({_id: projectTemplateId});
      sandbox.replace(
        ProjectTemplateModel,
        'getProjectTemplateById',
        getProjectTemplateStub
      );

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(
        ProjectTemplateModel,
        'validateUpdateObject',
        validateStub
      );
      let errorred = false;
      try {
        await ProjectTemplateModel.updateProjectTemplateById(
          projectTemplateId,
          updateProjectTemplate
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateProjectTemplate = {
        ...mocks.MOCK_PROJECTTEMPLATE,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IProjectTemplate;

      const projectTemplateId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(ProjectTemplateModel, 'updateOne', updateStub);

      const getProjectTemplateStub = sandbox.stub();
      getProjectTemplateStub.resolves({_id: projectTemplateId});
      sandbox.replace(
        ProjectTemplateModel,
        'getProjectTemplateById',
        getProjectTemplateStub
      );

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(
        ProjectTemplateModel,
        'validateUpdateObject',
        validateStub
      );

      let errorred = false;
      try {
        await ProjectTemplateModel.updateProjectTemplateById(
          projectTemplateId,
          updateProjectTemplate
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a projectTemplate document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a projectTemplate', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(ProjectTemplateModel, 'deleteOne', deleteStub);

      const projectTemplateId = new mongoose.Types.ObjectId();

      await ProjectTemplateModel.deleteProjectTemplateById(projectTemplateId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the projectTemplate does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(ProjectTemplateModel, 'deleteOne', deleteStub);

      const projectTemplateId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await ProjectTemplateModel.deleteProjectTemplateById(projectTemplateId);
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
        await ProjectTemplateModel.deleteProjectTemplateById(projectTemplateId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});

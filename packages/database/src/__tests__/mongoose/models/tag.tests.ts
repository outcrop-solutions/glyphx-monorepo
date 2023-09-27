import {TagModel} from '../../../mongoose/models/tag';
import {ProjectModel} from '../../../mongoose/models/project';
import {databaseTypes} from 'types';
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';
import {assert} from 'chai';
import {ProjectTemplateModel, WorkspaceModel} from '../../../mongoose/models';

const MOCK_TAG: databaseTypes.ITag = {
  createdAt: new Date(),
  updatedAt: new Date(),
  value: 'testTag',
  workspaces: [{_id: new mongoose.Types.ObjectId()} as unknown as databaseTypes.IWorkspace],
  projects: [{_id: new mongoose.Types.ObjectId()} as unknown as databaseTypes.IProject],
  templates: [
    {
      _id: new mongoose.Types.ObjectId(),
    } as unknown as databaseTypes.IProjectTemplate,
  ],
};

describe('#mongoose/models/tag', () => {
  context('tagIdExists', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the tagId exists', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const result = await TagModel.tagIdExists(tagId);

      assert.isTrue(result);
    });

    it('should return false if the tagId does not exist', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const result = await TagModel.tagIdExists(tagId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(TagModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await TagModel.tagIdExists(tagId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allTagIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the template ids exist', async () => {
      const tagIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedTagIds = tagIds.map((projectId) => {
        return {
          _id: projectId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedTagIds);
      sandbox.replace(TagModel, 'find', findStub);

      assert.isTrue(await TagModel.allTagIdsExist(tagIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const tagIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const returnedTagIds = [
        {
          _id: tagIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedTagIds);
      sandbox.replace(TagModel, 'find', findStub);
      let errored = false;
      try {
        await TagModel.allTagIdsExist(tagIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(err.data.value[0].toString(), tagIds[1].toString());
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const tagIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(TagModel, 'find', findStub);
      let errored = false;
      try {
        await TagModel.allTagIdsExist(tagIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('createTag', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a tag document', async () => {
      sandbox.replace(TagModel, 'validateWorkspaces', sandbox.stub().resolves(MOCK_TAG.workspaces.map((p) => p._id)));

      sandbox.replace(TagModel, 'validateTemplates', sandbox.stub().resolves(MOCK_TAG.templates.map((p) => p._id)));

      sandbox.replace(TagModel, 'validateProjects', sandbox.stub().resolves(MOCK_TAG.projects.map((p) => p._id)));

      const tagId = new mongoose.Types.ObjectId();
      sandbox.replace(TagModel, 'create', sandbox.stub().resolves([{_id: tagId}]));
      sandbox.replace(TagModel, 'validate', sandbox.stub().resolves(true));
      const stub = sandbox.stub();
      stub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', stub);
      const tagDocument = await TagModel.createTag(MOCK_TAG);

      assert.strictEqual(tagDocument._id, tagId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when a validator throws one', async () => {
      sandbox.replace(
        TagModel,
        'validateProjects',
        sandbox.stub().rejects(new error.DataValidationError('This data is not valid', 'projects', {}))
      );
      sandbox.replace(TagModel, 'validateWorkspaces', sandbox.stub().resolves(MOCK_TAG.workspaces.map((p) => p._id)));

      sandbox.replace(TagModel, 'validateTemplates', sandbox.stub().resolves(MOCK_TAG.templates.map((p) => p._id)));

      const tagId = new mongoose.Types.ObjectId();
      sandbox.replace(TagModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(TagModel, 'create', sandbox.stub().resolves([{_id: tagId}]));
      const stub = sandbox.stub();
      stub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', stub);
      let hasError = false;
      try {
        await TagModel.createTag(MOCK_TAG);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(TagModel, 'validateProjects', sandbox.stub().resolves(MOCK_TAG.projects.map((p) => p._id)));
      sandbox.replace(TagModel, 'validateWorkspaces', sandbox.stub().resolves(MOCK_TAG.workspaces.map((p) => p._id)));

      sandbox.replace(TagModel, 'validateTemplates', sandbox.stub().resolves(MOCK_TAG.templates.map((p) => p._id)));

      const tagId = new mongoose.Types.ObjectId();
      sandbox.replace(TagModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(TagModel, 'create', sandbox.stub().rejects('oops, something bad has happened'));
      const stub = sandbox.stub();
      stub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', stub);
      let hasError = false;
      try {
        await TagModel.createTag(MOCK_TAG);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(TagModel, 'validateProjects', sandbox.stub().resolves(MOCK_TAG.projects.map((p) => p._id)));

      sandbox.replace(TagModel, 'validateWorkspaces', sandbox.stub().resolves(MOCK_TAG.workspaces.map((p) => p._id)));

      sandbox.replace(TagModel, 'validateTemplates', sandbox.stub().resolves(MOCK_TAG.templates.map((p) => p._id)));

      const tagId = new mongoose.Types.ObjectId();
      sandbox.replace(TagModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(TagModel, 'create', sandbox.stub().resolves([{}]));
      const stub = sandbox.stub();
      stub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', stub);
      let hasError = false;
      try {
        await TagModel.createTag(MOCK_TAG);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(TagModel, 'validateProjects', sandbox.stub().resolves(MOCK_TAG.projects.map((p) => p._id)));
      sandbox.replace(TagModel, 'validateWorkspaces', sandbox.stub().resolves(MOCK_TAG.workspaces.map((p) => p._id)));

      sandbox.replace(TagModel, 'validateTemplates', sandbox.stub().resolves(MOCK_TAG.templates.map((p) => p._id)));

      const tagId = new mongoose.Types.ObjectId();
      sandbox.replace(TagModel, 'validate', sandbox.stub().rejects('oops an error has occurred'));
      sandbox.replace(TagModel, 'create', sandbox.stub().resolves([{_id: tagId}]));
      const stub = sandbox.stub();
      stub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', stub);
      let hasError = false;
      try {
        await TagModel.createTag(MOCK_TAG);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('updateTagById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update an existing project type', async () => {
      const updateTag = {
        value: 'randomTag',
      };

      const tagId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(TagModel, 'updateOne', updateStub);

      const getTagStub = sandbox.stub();
      getTagStub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', getTagStub);

      const result = await TagModel.updateTagById(tagId.toString(), updateTag);

      assert.strictEqual(result._id, tagId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getTagStub.calledOnce);
    });

    it('Will fail when the tag does not exist', async () => {
      const updateTag = {
        value: 'randomTag',
      };

      const tagId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(TagModel, 'updateOne', updateStub);

      const getTagStub = sandbox.stub();
      getTagStub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', getTagStub);

      let errorred = false;
      try {
        await TagModel.updateTagById(tagId.toString(), updateTag);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateTag = {
        value: 'randomTag',
      };

      const tagId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(TagModel, 'updateOne', updateStub);

      const getTagStub = sandbox.stub();
      getTagStub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', getTagStub);

      sandbox.replace(
        TagModel,
        'validateUpdateObject',
        sandbox.stub().throws(new error.InvalidOperationError("You can't do this", {}))
      );
      let errorred = false;
      try {
        await TagModel.updateTagById(tagId.toString(), updateTag);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateTag = {
        value: 'randomTag',
      };

      const tagId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(TagModel, 'updateOne', updateStub);

      const getTagStub = sandbox.stub();
      getTagStub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', getTagStub);

      let errorred = false;
      try {
        await TagModel.updateTagById(tagId.toString(), updateTag);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('validateUpdateObject', () => {
    it('will succeed when no restricted fields are present', () => {
      const inputTag = {
        value: 'randomTag',
      } as unknown as Omit<Partial<databaseTypes.ITag>, '_id'>;

      TagModel.validateUpdateObject(inputTag);
    });

    it('will fail when trying to update workspaces', () => {
      const inputTag = {
        value: 'randomTag',
        workspaces: [
          {
            _id: new mongoose.Types.ObjectId(),
          } as unknown as databaseTypes.IWorkspace,
        ],
      } as unknown as Omit<Partial<databaseTypes.ITag>, '_id'>;

      assert.throws(() => {
        TagModel.validateUpdateObject(inputTag);
      }, error.InvalidOperationError);
    });

    it('will fail when trying to update projects', () => {
      const inputTag = {
        value: 'randomTag',
        projects: [
          {
            _id: new mongoose.Types.ObjectId(),
          } as unknown as databaseTypes.IProject,
        ],
      } as unknown as Omit<Partial<databaseTypes.ITag>, '_id'>;

      assert.throws(() => {
        TagModel.validateUpdateObject(inputTag);
      }, error.InvalidOperationError);
    });

    it('will fail when trying to update templates', () => {
      const inputTag = {
        value: 'randomTag',
        templates: [
          {
            _id: new mongoose.Types.ObjectId(),
          } as unknown as databaseTypes.IProjectTemplate,
        ],
      } as unknown as Omit<Partial<databaseTypes.ITag>, '_id'>;

      assert.throws(() => {
        TagModel.validateUpdateObject(inputTag);
      }, error.InvalidOperationError);
    });

    it('will fail when trying to update _id', () => {
      const inputTag = {
        _id: new mongoose.Types.ObjectId(),
      } as unknown as databaseTypes.ITag;

      assert.throws(() => {
        TagModel.validateUpdateObject(inputTag);
      }, error.InvalidOperationError);
    });

    it('will fail when trying to update createdAt', () => {
      const inputTag = {
        createdAt: new Date(),
      };

      assert.throws(() => {
        TagModel.validateUpdateObject(inputTag);
      }, error.InvalidOperationError);
    });

    it('will fail when trying to update updatedAt', () => {
      const inputTag = {
        updatedAt: new Date(),
      };

      assert.throws(() => {
        TagModel.validateUpdateObject(inputTag);
      }, error.InvalidOperationError);
    });
  });

  context('Delete a tag document', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a tag', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(TagModel, 'deleteOne', deleteStub);

      const tagId = new mongoose.Types.ObjectId();

      await TagModel.deleteTagById(tagId.toString());

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the tag does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(TagModel, 'deleteOne', deleteStub);

      const tagId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await TagModel.deleteTagById(tagId.toString());
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(TagModel, 'deleteOne', deleteStub);

      const tagId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await TagModel.deleteTagById(tagId.toString());
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
      sandbox.replace(ProjectModel, 'allProjectIdsExist', allProjectIdsExistStub);

      const results = await TagModel.validateProjects(inputProjects);

      assert.strictEqual(results.length, inputProjects.length);
      results.forEach((r) => {
        const foundId = inputProjects.find((p) => p._id?.toString() === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the projectIds can be validated ', async () => {
      const inputProjects = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const allProjectIdsExistStub = sandbox.stub();
      allProjectIdsExistStub.resolves(true);
      sandbox.replace(ProjectModel, 'allProjectIdsExist', allProjectIdsExistStub);

      const results = await TagModel.validateProjects(inputProjects);

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
        await TagModel.validateProjects(inputProjects);
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
        await TagModel.validateProjects(inputProjects);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validate workspaces', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the workspaces can be validated', async () => {
      const inputWorkspaces = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
      ];

      const allWorkspaceIdsExistStub = sandbox.stub();
      allWorkspaceIdsExistStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'allWorkspaceIdsExist', allWorkspaceIdsExistStub);

      const results = await TagModel.validateWorkspaces(inputWorkspaces);

      assert.strictEqual(results.length, inputWorkspaces.length);
      results.forEach((r) => {
        const foundId = inputWorkspaces.find((p) => p._id?.toString() === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the workspaceIds can be validated ', async () => {
      const inputWorkspaces = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
      ];

      const allWorkspaceIdsExistStub = sandbox.stub();
      allWorkspaceIdsExistStub.resolves(true);
      sandbox.replace(WorkspaceModel, 'allWorkspaceIdsExist', allWorkspaceIdsExistStub);

      const results = await TagModel.validateWorkspaces(inputWorkspaces);

      assert.strictEqual(results.length, inputWorkspaces.length);
      results.forEach((r) => {
        const foundId = inputWorkspaces.find((p) => p._id?.toString() === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputWorkspaces = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IWorkspace,
      ];

      const allWorkspaceIdsExistStub = sandbox.stub();
      allWorkspaceIdsExistStub.rejects(
        new error.DataNotFoundError('the workspace ids cannot be found', 'workspaceIds', inputWorkspaces)
      );
      sandbox.replace(WorkspaceModel, 'allWorkspaceIdsExist', allWorkspaceIdsExistStub);

      let errored = false;
      try {
        await TagModel.validateWorkspaces(inputWorkspaces);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputWorkspaces = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const errorText = 'something bad has happened';

      const allWorkspaceIdsExistStub = sandbox.stub();
      allWorkspaceIdsExistStub.rejects(errorText);
      sandbox.replace(WorkspaceModel, 'allWorkspaceIdsExist', allWorkspaceIdsExistStub);

      let errored = false;
      try {
        await TagModel.validateWorkspaces(inputWorkspaces);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('validate templates', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return an array of ids when the templates can be validated', async () => {
      const inputTemplates = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectTemplate,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectTemplate,
      ];

      const allTemplateIdsExistStub = sandbox.stub();
      allTemplateIdsExistStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'allProjectTemplateIdsExist', allTemplateIdsExistStub);

      const results = await TagModel.validateTemplates(inputTemplates);

      assert.strictEqual(results.length, inputTemplates.length);
      results.forEach((r) => {
        const foundId = inputTemplates.find((p) => p._id?.toString() === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should return an array of ids when the templateIds can be validated ', async () => {
      const inputTemplates = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectTemplate,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectTemplate,
      ];

      const allTemplateIdsExistStub = sandbox.stub();
      allTemplateIdsExistStub.resolves(true);
      sandbox.replace(ProjectTemplateModel, 'allProjectTemplateIdsExist', allTemplateIdsExistStub);

      const results = await TagModel.validateTemplates(inputTemplates);

      assert.strictEqual(results.length, inputTemplates.length);
      results.forEach((r) => {
        const foundId = inputTemplates.find((p) => p._id?.toString() === r.toString());
        assert.isOk(foundId);
      });
    });

    it('should throw a Data Validation Error when one of the ids cannot be found ', async () => {
      const inputTemplates = [
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectTemplate,
        {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IProjectTemplate,
      ];

      const allTemplateIdsExistStub = sandbox.stub();
      allTemplateIdsExistStub.rejects(
        new error.DataNotFoundError('the workspace ids cannot be found', 'workspaceIds', inputTemplates)
      );
      sandbox.replace(ProjectTemplateModel, 'allProjectTemplateIdsExist', allTemplateIdsExistStub);

      let errored = false;
      try {
        await TagModel.validateTemplates(inputTemplates);
      } catch (err: any) {
        assert.instanceOf(err, error.DataValidationError);
        assert.instanceOf(err.innerError, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('should rethrow an error from the underlying connection', async () => {
      const inputTemplates = [new mongoose.Types.ObjectId().toString(), new mongoose.Types.ObjectId().toString()];

      const errorText = 'something bad has happened';

      const allTemplateIdsExistStub = sandbox.stub();
      allTemplateIdsExistStub.rejects(errorText);
      sandbox.replace(ProjectTemplateModel, 'allProjectTemplateIdsExist', allTemplateIdsExistStub);

      let errored = false;
      try {
        await TagModel.validateTemplates(inputTemplates);
      } catch (err: any) {
        assert.strictEqual(err.name, errorText);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('getTagById', () => {
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

    const mockTag: databaseTypes.ITag = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      value: 'testTag',
      workspaces: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test workspace',
          __v: 1,
        } as unknown as databaseTypes.IWorkspace,
      ],
      projects: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test project',
          __v: 1,
        } as unknown as databaseTypes.IProject,
      ],
      templates: [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'test template',
          __v: 1,
        } as unknown as databaseTypes.IProjectTemplate,
      ],
    } as databaseTypes.ITag;
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a project document with the projects populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mockTag));
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const doc = await TagModel.getTagById(mockTag._id!.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      doc.projects.forEach((p) => assert.isUndefined((p as any).__v));

      assert.strictEqual(doc.id, mockTag._id?.toString());
    });

    it('will throw a DataNotFoundError when the tag does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(TagModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await TagModel.getTagById(mockTag._id!.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(TagModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await TagModel.getTagById(mockTag._id!.toString());
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

    it('will add a project to a tag', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag.projects = [];
      localMockTag._id = projTypeId;
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(TagModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      const updatedTag = await TagModel.addProjects(projTypeId.toString(), [projectId.toString()]);

      assert.strictEqual(updatedTag._id, projTypeId);
      assert.strictEqual(updatedTag.projects[0].toString(), projectId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateProjectsStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getTagByIdStub.calledOnce);
    });

    it('will not save when a project is already attached to an project type', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag.projects = [];
      localMockTag._id = tagId;
      const projectId = new mongoose.Types.ObjectId();
      localMockTag.projects.push(projectId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(TagModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      const updatedTag = await TagModel.addProjects(tagId.toString(), [projectId.toString()]);

      assert.strictEqual(updatedTag._id, tagId);
      assert.strictEqual(updatedTag.projects[0].toString(), projectId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateProjectsStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getTagByIdStub.calledOnce);
    });

    it('will throw a data not found error when the project type does not exist', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.projects = [];
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(TagModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.addProjects(tagId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when project id does not exist', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = projTypeId;
      localMockTag.projects = [];
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.rejects(
        new error.DataValidationError('The projects id does not exist', 'projectId', projectId)
      );
      sandbox.replace(TagModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.addProjects(projTypeId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.projects = [];
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(TagModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.addProjects(tagId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the projects array is empty', async () => {
      const projectTypeId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = projectTypeId;
      localMockTag.projects = [];
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateProjectsStub = sandbox.stub();
      validateProjectsStub.resolves([projectId]);
      sandbox.replace(TagModel, 'validateProjects', validateProjectsStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.addProjects(projectTypeId.toString(), []);
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

    it('will remove a project from the tag', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = projTypeId;
      localMockTag.projects = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockTag.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      const updatedTag = await TagModel.removeProjects(projTypeId.toString(), [projectId.toString()]);

      assert.strictEqual(updatedTag._id, projTypeId);
      assert.strictEqual(updatedTag.projects.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getTagByIdStub.calledOnce);
    });

    it('will not modify the projects if the projectid are not on the project type projects', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = projTypeId;
      localMockTag.projects = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockTag.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      const updatedTag = await TagModel.removeProjects(projTypeId.toString(), [
        new mongoose.Types.ObjectId().toString(),
      ]);

      assert.strictEqual(updatedTag._id, projTypeId);
      assert.strictEqual(updatedTag.projects.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getTagByIdStub.calledOnce);
    });

    it('will throw a data not found error when the project type does not exist', async () => {
      const projTypeId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = projTypeId;
      localMockTag.projects = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockTag.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.removeProjects(projTypeId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.projects = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockTag.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.removeProjects(tagId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the projects array is empty', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      const projectId = new mongoose.Types.ObjectId();
      localMockTag.projects.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.removeProjects(tagId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('addTemplates', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add a template to a tag', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag.templates = [];
      localMockTag._id = tagId;
      const templateId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateTemplatesStub = sandbox.stub();
      validateTemplatesStub.resolves([templateId]);
      sandbox.replace(TagModel, 'validateTemplates', validateTemplatesStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      const updatedTag = await TagModel.addTemplates(tagId.toString(), [templateId.toString()]);

      assert.strictEqual(updatedTag._id, tagId);
      assert.strictEqual(updatedTag.templates[0].toString(), templateId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateTemplatesStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getTagByIdStub.calledOnce);
    });

    it('will not save when a template is already attached to an tag', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag.templates = [];
      localMockTag._id = tagId;
      const templateId = new mongoose.Types.ObjectId();
      localMockTag.templates.push(templateId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateTemplatesStub = sandbox.stub();
      validateTemplatesStub.resolves([templateId]);
      sandbox.replace(TagModel, 'validateTemplates', validateTemplatesStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      const updatedTag = await TagModel.addTemplates(tagId.toString(), [templateId.toString()]);

      assert.strictEqual(updatedTag._id, tagId);
      assert.strictEqual(updatedTag.templates[0].toString(), templateId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateTemplatesStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getTagByIdStub.calledOnce);
    });

    it('will throw a data not found error when the tag does not exist', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.templates = [];
      const templateId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateTemplatesStub = sandbox.stub();
      validateTemplatesStub.resolves([templateId]);
      sandbox.replace(TagModel, 'validateTemplates', validateTemplatesStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.addTemplates(tagId.toString(), [templateId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when template id does not exist', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.templates = [];
      const templateId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateTemplatesStub = sandbox.stub();
      validateTemplatesStub.rejects(
        new error.DataValidationError('The projects id does not exist', 'projectId', templateId)
      );
      sandbox.replace(TagModel, 'validateTemplates', validateTemplatesStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.addTemplates(tagId.toString(), [templateId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.templates = [];
      const projectId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateTemplatesStub = sandbox.stub();
      validateTemplatesStub.resolves([projectId]);
      sandbox.replace(TagModel, 'validateTemplates', validateTemplatesStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.addTemplates(tagId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the templates array is empty', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.templates = [];
      const templateId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateTemplatesStub = sandbox.stub();
      validateTemplatesStub.resolves([templateId]);
      sandbox.replace(TagModel, 'validateTemplates', validateTemplatesStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.addTemplates(tagId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('removeTemplates', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove a template from the tag', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.templates = [];
      const templateId = new mongoose.Types.ObjectId();
      localMockTag.templates.push(templateId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      const updatedTag = await TagModel.removeTemplates(tagId.toString(), [templateId.toString()]);

      assert.strictEqual(updatedTag._id, tagId);
      assert.strictEqual(updatedTag.templates.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getTagByIdStub.calledOnce);
    });

    it('will not modify the template if the templateId is not on the tag templates', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.templates = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockTag.templates.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      const updatedTag = await TagModel.removeTemplates(tagId.toString(), [new mongoose.Types.ObjectId().toString()]);

      assert.strictEqual(updatedTag._id, tagId);
      assert.strictEqual(updatedTag.projects.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getTagByIdStub.calledOnce);
    });

    it('will throw a data not found error when the tag does not exist', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.templates = [];
      const templateId = new mongoose.Types.ObjectId();
      localMockTag.templates.push(templateId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.removeTemplates(tagId.toString(), [templateId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.templates = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockTag.templates.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.removeTemplates(tagId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the templates array is empty', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      const templateId = new mongoose.Types.ObjectId();
      localMockTag.templates.push(templateId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.removeTemplates(tagId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('addWorkspaces', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will add a workspace to a tag', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag.workspaces = [];
      localMockTag._id = tagId;
      const templateId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateWorkspacesStub = sandbox.stub();
      validateWorkspacesStub.resolves([templateId]);
      sandbox.replace(TagModel, 'validateWorkspaces', validateWorkspacesStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      const updatedTag = await TagModel.addWorkspaces(tagId.toString(), [templateId.toString()]);

      assert.strictEqual(updatedTag._id, tagId);
      assert.strictEqual(updatedTag.workspaces[0].toString(), templateId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateWorkspacesStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getTagByIdStub.calledOnce);
    });

    it('will not save when a workspace is already attached to an tag', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag.workspaces = [];
      localMockTag._id = tagId;
      const workspaceId = new mongoose.Types.ObjectId();
      localMockTag.workspaces.push(workspaceId);
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateWorkspacesStub = sandbox.stub();
      validateWorkspacesStub.resolves([workspaceId]);
      sandbox.replace(TagModel, 'validateWorkspaces', validateWorkspacesStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      const updatedTag = await TagModel.addWorkspaces(tagId.toString(), [workspaceId.toString()]);

      assert.strictEqual(updatedTag._id, tagId);
      assert.strictEqual(updatedTag.workspaces[0].toString(), workspaceId.toString());

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(validateWorkspacesStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getTagByIdStub.calledOnce);
    });

    it('will throw a data not found error when the tag does not exist', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.workspaces = [];
      const workspaceId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateWorkspacesStub = sandbox.stub();
      validateWorkspacesStub.resolves([workspaceId]);
      sandbox.replace(TagModel, 'validateWorkspaces', validateWorkspacesStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.addWorkspaces(tagId.toString(), [workspaceId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data validation error when template id does not exist', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.workspaces = [];
      const workspaceId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateWorkspacesStub = sandbox.stub();
      validateWorkspacesStub.rejects(
        new error.DataValidationError('The projects id does not exist', 'projectId', workspaceId)
      );
      sandbox.replace(TagModel, 'validateWorkspaces', validateWorkspacesStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.addWorkspaces(tagId.toString(), [workspaceId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.workspaces = [];
      const workspaceId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateWorkspacesStub = sandbox.stub();
      validateWorkspacesStub.resolves([workspaceId]);
      sandbox.replace(TagModel, 'validateWorkspaces', validateWorkspacesStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.addWorkspaces(tagId.toString(), [workspaceId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the templates array is empty', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.workspaces = [];
      const workspaceId = new mongoose.Types.ObjectId();

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const validateWorkspacesStub = sandbox.stub();
      validateWorkspacesStub.resolves([workspaceId]);
      sandbox.replace(TagModel, 'validateWorkspaces', validateWorkspacesStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.addWorkspaces(tagId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('removeWorkspaces', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will remove a workspace from the tag', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.workspaces = [];
      const workspaceId = new mongoose.Types.ObjectId();
      localMockTag.workspaces.push(workspaceId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      const updatedTag = await TagModel.removeWorkspaces(tagId.toString(), [workspaceId.toString()]);

      assert.strictEqual(updatedTag._id, tagId);
      assert.strictEqual(updatedTag.workspaces.length, 0);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isTrue(saveStub.calledOnce);
      assert.isTrue(getTagByIdStub.calledOnce);
    });

    it('will not modify the workspace if the workspaceId is not on the tag templates', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.workspaces = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockTag.workspaces.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      const updatedTag = await TagModel.removeWorkspaces(tagId.toString(), [new mongoose.Types.ObjectId().toString()]);

      assert.strictEqual(updatedTag._id, tagId);
      assert.strictEqual(updatedTag.projects.length, 1);

      assert.isTrue(findByIdStub.calledOnce);
      assert.isFalse(saveStub.calledOnce);
      assert.isTrue(getTagByIdStub.calledOnce);
    });

    it('will throw a data not found error when the tag does not exist', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.workspaces = [];
      const workspaceId = new mongoose.Types.ObjectId();
      localMockTag.workspaces.push(workspaceId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.removeWorkspaces(tagId.toString(), [workspaceId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a data operation error when the underlying connection fails', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      localMockTag.workspaces = [];
      const projectId = new mongoose.Types.ObjectId();
      localMockTag.workspaces.push(projectId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.rejects('Something bad has happened');
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.removeWorkspaces(tagId.toString(), [projectId.toString()]);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an invalid argument error when the templates array is empty', async () => {
      const tagId = new mongoose.Types.ObjectId();
      const localMockTag = JSON.parse(JSON.stringify(MOCK_TAG));
      localMockTag._id = tagId;
      const templateId = new mongoose.Types.ObjectId();
      localMockTag.workspaces.push(templateId);

      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const saveStub = sandbox.stub();
      saveStub.resolves(localMockTag);
      localMockTag.save = saveStub;

      const getTagByIdStub = sandbox.stub();
      getTagByIdStub.resolves(localMockTag);
      sandbox.replace(TagModel, 'getTagById', getTagByIdStub);

      let errored = false;
      try {
        await TagModel.removeWorkspaces(tagId.toString(), []);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryTags', () => {
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

    const mockTags = [
      {
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        value: 'testTag',
        __v: 1,
        workspaces: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'test workspace',
            __v: 1,
          } as unknown as databaseTypes.IWorkspace,
        ],
        projects: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'test project',
            __v: 1,
          } as unknown as databaseTypes.IProject,
        ],
        templates: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'test template',
            __v: 1,
          } as unknown as databaseTypes.IProjectTemplate,
        ],
      } as databaseTypes.ITag,
      {
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        value: 'testTag2',
        __v: 1,
        workspaces: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'test workspace',
            __v: 1,
          } as unknown as databaseTypes.IWorkspace,
        ],
        projects: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'test project',
            __v: 1,
          } as unknown as databaseTypes.IProject,
        ],
        templates: [
          {
            _id: new mongoose.Types.ObjectId(),
            name: 'test template',
            __v: 1,
          } as unknown as databaseTypes.IProjectTemplate,
        ],
      } as databaseTypes.ITag,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered tags', async () => {
      sandbox.replace(TagModel, 'count', sandbox.stub().resolves(mockTags.length));

      sandbox.replace(TagModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockTags)));

      const results = await TagModel.queryTags({});

      assert.strictEqual(results.numberOfItems, mockTags.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockTags.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc) => {
        assert.isUndefined((doc as any).__v);
        doc.projects.forEach((p: any) => {
          assert.isUndefined((p as any).__v);
        });
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(TagModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(TagModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockTags)));

      let errored = false;
      try {
        await TagModel.queryTags();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(TagModel, 'count', sandbox.stub().resolves(mockTags.length));

      sandbox.replace(TagModel, 'find', sandbox.stub().returns(new MockMongooseQuery(mockTags)));

      let errored = false;
      try {
        await TagModel.queryTags({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(TagModel, 'count', sandbox.stub().resolves(mockTags.length));

      sandbox.replace(
        TagModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await TagModel.queryTags({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });
});

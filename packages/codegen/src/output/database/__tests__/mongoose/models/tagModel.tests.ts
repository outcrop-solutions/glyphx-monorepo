// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {TagModel} from '../../../mongoose/models/tag';
import * as mocks from '../../../mongoose/mocks';
import {WorkspaceModel} from '../../../mongoose/models/workspace';
import {ProjectTemplateModel} from '../../../mongoose/models/projectTemplate';
import {ProjectModel} from '../../../mongoose/models/project';
import {IQueryResult} from '@glyphx/types';
import {databaseTypes} from '../../../../../../database';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

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

    it('should return true when all the tag ids exist', async () => {
      const tagIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedTagIds = tagIds.map(tagId => {
        return {
          _id: tagId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedTagIds);
      sandbox.replace(TagModel, 'find', findStub);

      assert.isTrue(await TagModel.allTagIdsExist(tagIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const tagIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

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
      const tagIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

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

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will not throw an error when no unsafe fields are present', async () => {
      let errored = false;

      try {
        await TagModel.validateUpdateObject(
          mocks.MOCK_TAG as unknown as Omit<Partial<databaseTypes.ITag>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      let errored = false;

      try {
        await TagModel.validateUpdateObject(
          mocks.MOCK_TAG as unknown as Omit<Partial<databaseTypes.ITag>, '_id'>
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will fail when trying to update the _id', async () => {
      let errored = false;

      try {
        await TagModel.validateUpdateObject({
          ...mocks.MOCK_TAG,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.ITag>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      let errored = false;

      try {
        await TagModel.validateUpdateObject({
          ...mocks.MOCK_TAG,
          createdAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.ITag>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      let errored = false;

      try {
        await TagModel.validateUpdateObject({
          ...mocks.MOCK_TAG,
          updatedAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.ITag>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createTag', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a tag document', async () => {
      sandbox.replace(
        TagModel,
        'validateWorkspaces',
        sandbox.stub().resolves(mocks.MOCK_TAG.workspaces)
      );
      sandbox.replace(
        TagModel,
        'validateTemplates',
        sandbox.stub().resolves(mocks.MOCK_TAG.templates)
      );
      sandbox.replace(
        TagModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_TAG.projects)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        TagModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(TagModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(TagModel, 'getTagById', stub);

      const tagDocument = await TagModel.createTag(mocks.MOCK_TAG);

      assert.strictEqual(tagDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        TagModel,
        'validateWorkspaces',
        sandbox.stub().resolves(mocks.MOCK_TAG.workspaces)
      );
      sandbox.replace(
        TagModel,
        'validateTemplates',
        sandbox.stub().resolves(mocks.MOCK_TAG.templates)
      );
      sandbox.replace(
        TagModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_TAG.projects)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(TagModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        TagModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(TagModel, 'getTagById', stub);
      let hasError = false;
      try {
        await TagModel.createTag(mocks.MOCK_TAG);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        TagModel,
        'validateWorkspaces',
        sandbox.stub().resolves(mocks.MOCK_TAG.workspaces)
      );
      sandbox.replace(
        TagModel,
        'validateTemplates',
        sandbox.stub().resolves(mocks.MOCK_TAG.templates)
      );
      sandbox.replace(
        TagModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_TAG.projects)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(TagModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(TagModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(TagModel, 'getTagById', stub);

      let hasError = false;
      try {
        await TagModel.createTag(mocks.MOCK_TAG);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        TagModel,
        'validateWorkspaces',
        sandbox.stub().resolves(mocks.MOCK_TAG.workspaces)
      );
      sandbox.replace(
        TagModel,
        'validateTemplates',
        sandbox.stub().resolves(mocks.MOCK_TAG.templates)
      );
      sandbox.replace(
        TagModel,
        'validateProjects',
        sandbox.stub().resolves(mocks.MOCK_TAG.projects)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        TagModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        TagModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(TagModel, 'getTagById', stub);
      let hasError = false;
      try {
        await TagModel.createTag(mocks.MOCK_TAG);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
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

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a tag document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_TAG));
      sandbox.replace(TagModel, 'findById', findByIdStub);

      const doc = await TagModel.getTagById(
        mocks.MOCK_TAG._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.workspaces[0] as any).__v);
      assert.isUndefined((doc.templates[0] as any).__v);
      assert.isUndefined((doc.projects[0] as any).__v);

      assert.strictEqual(doc._id, mocks.MOCK_TAG._id);
    });

    it('will throw a DataNotFoundError when the tag does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(TagModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await TagModel.getTagById(
          mocks.MOCK_TAG._id as mongoose.Types.ObjectId
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
      sandbox.replace(TagModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await TagModel.getTagById(
          mocks.MOCK_TAG._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
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
        ...mocks.MOCK_TAG,
        _id: new mongoose.Types.ObjectId(),
        workspaces: [],
        templates: [],
        projects: [],
      } as databaseTypes.ITag,
      {
        ...mocks.MOCK_TAG,
        _id: new mongoose.Types.ObjectId(),
        workspaces: [],
        templates: [],
        projects: [],
      } as databaseTypes.ITag,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered tags', async () => {
      sandbox.replace(
        TagModel,
        'count',
        sandbox.stub().resolves(mockTags.length)
      );

      sandbox.replace(
        TagModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockTags))
      );

      const results = await TagModel.queryTags({});

      assert.strictEqual(results.numberOfItems, mockTags.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockTags.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any).__v);
        assert.isUndefined((doc.workspaces[0] as any).__v);
        assert.isUndefined((doc.templates[0] as any).__v);
        assert.isUndefined((doc.projects[0] as any).__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(TagModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        TagModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockTags))
      );

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
      sandbox.replace(
        TagModel,
        'count',
        sandbox.stub().resolves(mockTags.length)
      );

      sandbox.replace(
        TagModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockTags))
      );

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
      sandbox.replace(
        TagModel,
        'count',
        sandbox.stub().resolves(mockTags.length)
      );

      sandbox.replace(
        TagModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
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

  context('updateTagById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a tag', async () => {
      const updateTag = {
        ...mocks.MOCK_TAG,
        deletedAt: new Date(),
        workspaces: [],
        templates: [],
        projects: [],
      } as unknown as databaseTypes.ITag;

      const tagId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(TagModel, 'updateOne', updateStub);

      const getTagStub = sandbox.stub();
      getTagStub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', getTagStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(TagModel, 'validateUpdateObject', validateStub);

      const result = await TagModel.updateTagById(tagId, updateTag);

      assert.strictEqual(result._id, tagId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getTagStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a tag with refrences as ObjectIds', async () => {
      const updateTag = {
        ...mocks.MOCK_TAG,
        deletedAt: new Date(),
      } as unknown as databaseTypes.ITag;

      const tagId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(TagModel, 'updateOne', updateStub);

      const getTagStub = sandbox.stub();
      getTagStub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', getTagStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(TagModel, 'validateUpdateObject', validateStub);

      const result = await TagModel.updateTagById(tagId, updateTag);

      assert.strictEqual(result._id, tagId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getTagStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the tag does not exist', async () => {
      const updateTag = {
        ...mocks.MOCK_TAG,
        deletedAt: new Date(),
      } as unknown as databaseTypes.ITag;

      const tagId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(TagModel, 'updateOne', updateStub);

      const getTagStub = sandbox.stub();
      getTagStub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', getTagStub);

      let errorred = false;
      try {
        await TagModel.updateTagById(tagId, updateTag);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateTag = {
        ...mocks.MOCK_TAG,
        deletedAt: new Date(),
      } as unknown as databaseTypes.ITag;

      const tagId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(TagModel, 'updateOne', updateStub);

      const getTagStub = sandbox.stub();
      getTagStub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', getTagStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(TagModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await TagModel.updateTagById(tagId, updateTag);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateTag = {
        ...mocks.MOCK_TAG,
        deletedAt: new Date(),
      } as unknown as databaseTypes.ITag;

      const tagId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(TagModel, 'updateOne', updateStub);

      const getTagStub = sandbox.stub();
      getTagStub.resolves({_id: tagId});
      sandbox.replace(TagModel, 'getTagById', getTagStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(TagModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await TagModel.updateTagById(tagId, updateTag);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
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

      await TagModel.deleteTagById(tagId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the tag does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(TagModel, 'deleteOne', deleteStub);

      const tagId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await TagModel.deleteTagById(tagId);
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
        await TagModel.deleteTagById(tagId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});

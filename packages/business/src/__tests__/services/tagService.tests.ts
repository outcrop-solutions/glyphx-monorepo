// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import { tagService} from '../../services';
import * as mocks from 'database/src/mongoose/mocks'

describe('#services/tag', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createTag', () => {
    it('will create a Tag', async () => {
      const tagId = new mongooseTypes.ObjectId();
      const idId = new mongooseTypes.ObjectId();
      const workspacesId = new mongooseTypes.ObjectId();
      const templatesId = new mongooseTypes.ObjectId();
      const projectsId = new mongooseTypes.ObjectId();

      // createTag
      const createTagFromModelStub = sandbox.stub();
      createTagFromModelStub.resolves({
         ...mocks.MOCK_TAG,
        _id: new mongooseTypes.ObjectId(),
        workspaces: [],
                templates: [],
                projects: [],
              } as unknown as databaseTypes.ITag);

      sandbox.replace(
        dbConnection.models.TagModel,
        'createTag',
        createTagFromModelStub
      );

      const doc = await tagService.createTag(
       {
         ...mocks.MOCK_TAG,
        _id: new mongooseTypes.ObjectId(),
        workspaces: [],
                templates: [],
                projects: [],
              } as unknown as databaseTypes.ITag
      );

      assert.isTrue(createTagFromModelStub.calledOnce);
    });
    // tag model fails
    it('will publish and rethrow an InvalidArgumentError when tag model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createTag
      const createTagFromModelStub = sandbox.stub();
      createTagFromModelStub.rejects(err)

      sandbox.replace(
        dbConnection.models.TagModel,
        'createTag',
        createTagFromModelStub
      );


      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await tagService.createTag(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createTagFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when tag model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createTag
      const createTagFromModelStub = sandbox.stub();
      createTagFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.TagModel,
        'createTag',
        createTagFromModelStub
      );
      
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await tagService.createTag(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createTagFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when tag model throws it', async () => {
      const createTagFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createTagFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.TagModel,
        'createTag',
        createTagFromModelStub
      );

      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DataValidationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await tagService.createTag(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createTagFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when tag model throws a DataOperationError', async () => {
      const createTagFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createTagFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.TagModel,
        'createTag',
        createTagFromModelStub
      );

      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await tagService.createTag(
         {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createTagFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when tag model throws a UnexpectedError', async () => {
      const createTagFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(
        errMessage,
        'mongodDb',
      );

      createTagFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.TagModel,
        'createTag',
        createTagFromModelStub
      );

      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.UnexpectedError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await tagService.createTag(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createTagFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getTag', () => {
    it('should get a tag by id', async () => {
      const tagId = new mongooseTypes.ObjectId().toString();

      const getTagFromModelStub = sandbox.stub();
      getTagFromModelStub.resolves({
        _id: tagId,
      } as unknown as databaseTypes.ITag);
      sandbox.replace(
        dbConnection.models.TagModel,
        'getTagById',
        getTagFromModelStub
      );

      const tag = await tagService.getTag(tagId);
      assert.isOk(tag);
      assert.strictEqual(tag?._id?.toString(), tagId.toString());

      assert.isTrue(getTagFromModelStub.calledOnce);
    });
    it('should get a tag by id when id is a string', async () => {
      const tagId = new mongooseTypes.ObjectId();

      const getTagFromModelStub = sandbox.stub();
      getTagFromModelStub.resolves({
        _id: tagId,
      } as unknown as databaseTypes.ITag);
      sandbox.replace(
        dbConnection.models.TagModel,
        'getTagById',
        getTagFromModelStub
      );

      const tag = await tagService.getTag(tagId.toString());
      assert.isOk(tag);
      assert.strictEqual(tag?._id?.toString(), tagId.toString());

      assert.isTrue(getTagFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the tag cannot be found', async () => {
      const tagId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'tagId',
        tagId
      );
      const getTagFromModelStub = sandbox.stub();
      getTagFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.TagModel,
        'getTagById',
        getTagFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const tag = await tagService.getTag(tagId);
      assert.notOk(tag);

      assert.isTrue(getTagFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const tagId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getTagById'
      );
      const getTagFromModelStub = sandbox.stub();
      getTagFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.TagModel,
        'getTagById',
        getTagFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await tagService.getTag(tagId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getTagFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getTags', () => {
    it('should get tags by filter', async () => {
      const tagId = new mongooseTypes.ObjectId();
      const tagId2 = new mongooseTypes.ObjectId();
      const tagFilter = {_id: tagId};

      const queryTagsFromModelStub = sandbox.stub();
      queryTagsFromModelStub.resolves({
        results: [
          {
         ...mocks.MOCK_TAG,
        _id: tagId,
        workspaces: [],
                templates: [],
                projects: [],
                } as unknown as databaseTypes.ITag,
        {
         ...mocks.MOCK_TAG,
        _id: tagId2,
        workspaces: [],
                templates: [],
                projects: [],
                } as unknown as databaseTypes.ITag
        ],
      } as unknown as databaseTypes.ITag[]);

      sandbox.replace(
        dbConnection.models.TagModel,
        'queryTags',
        queryTagsFromModelStub
      );

      const tags = await tagService.getTags(tagFilter);
      assert.isOk(tags![0]);
      assert.strictEqual(tags![0]._id?.toString(), tagId.toString());
      assert.isTrue(queryTagsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the tags cannot be found', async () => {
      const tagName = 'tagName1';
      const tagFilter = {name: tagName};
      const errMessage = 'Cannot find the tag';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        tagFilter
      );
      const getTagFromModelStub = sandbox.stub();
      getTagFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.TagModel,
        'queryTags',
        getTagFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const tag = await tagService.getTags(tagFilter);
      assert.notOk(tag);

      assert.isTrue(getTagFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const tagName = 'tagName1';
      const tagFilter = {name: tagName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getTagByEmail'
      );
      const getTagFromModelStub = sandbox.stub();
      getTagFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.TagModel,
        'queryTags',
        getTagFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await tagService.getTags(tagFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getTagFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateTag', () => {
    it('will update a tag', async () => {
      const tagId = new mongooseTypes.ObjectId().toString();
      const updateTagFromModelStub = sandbox.stub();
      updateTagFromModelStub.resolves({
         ...mocks.MOCK_TAG,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        workspaces: [],
                templates: [],
                projects: [],
              } as unknown as databaseTypes.ITag);
      sandbox.replace(
        dbConnection.models.TagModel,
        'updateTagById',
        updateTagFromModelStub
      );

      const tag = await tagService.updateTag(tagId, {
        deletedAt: new Date(),
      });
      assert.isOk(tag);
      assert.strictEqual(tag.id, 'id');
      assert.isOk(tag.deletedAt);
      assert.isTrue(updateTagFromModelStub.calledOnce);
    });
    it('will update a tag when the id is a string', async () => {
     const tagId = new mongooseTypes.ObjectId();
      const updateTagFromModelStub = sandbox.stub();
      updateTagFromModelStub.resolves({
         ...mocks.MOCK_TAG,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        workspaces: [],
                templates: [],
                projects: [],
              } as unknown as databaseTypes.ITag);
      sandbox.replace(
        dbConnection.models.TagModel,
        'updateTagById',
        updateTagFromModelStub
      );

      const tag = await tagService.updateTag(tagId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(tag);
      assert.strictEqual(tag.id, 'id');
      assert.isOk(tag.deletedAt);
      assert.isTrue(updateTagFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when tag model throws it', async () => {
      const tagId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateTagFromModelStub = sandbox.stub();
      updateTagFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.TagModel,
        'updateTagById',
        updateTagFromModelStub
      );

      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await tagService.updateTag(tagId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateTagFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when tag model throws it ', async () => {
      const tagId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateTagFromModelStub = sandbox.stub();
      updateTagFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.TagModel,
        'updateTagById',
        updateTagFromModelStub
      );

      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await tagService.updateTag(tagId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateTagFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when tag model throws a DataOperationError ', async () => {
      const tagId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateTagById'
      );
      const updateTagFromModelStub = sandbox.stub();
      updateTagFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.TagModel,
        'updateTagById',
        updateTagFromModelStub
      );

      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await tagService.updateTag(tagId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateTagFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});

import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import {tagService} from '../../services';

describe('#services/tag', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('getTag', () => {
    it('should get a tag by id', async () => {
      const tagId = new mongooseTypes.ObjectId();

      const getTagFromModelStub = sandbox.stub();
      getTagFromModelStub.resolves({
        _id: tagId,
      } as unknown as databaseTypes.IUser);
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
      } as unknown as databaseTypes.IUser);
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
      const tagId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the tag';
      const err = new error.DataNotFoundError(errMessage, 'tagId', tagId);
      const getTagFromModelStub = sandbox.stub();
      getTagFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.TagModel,
        'getTagById',
        getTagFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
      const tagId = new mongooseTypes.ObjectId();
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
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
});

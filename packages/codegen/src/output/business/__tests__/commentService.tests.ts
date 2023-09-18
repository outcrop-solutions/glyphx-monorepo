// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from '../../../../database';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from '@glyphx/database';
import {error} from '@glyphx/core';
import {commentService} from '../services';
import * as mocks from '../../database/mongoose/mocks';

describe('#services/comment', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createComment', () => {
    it('will create a Comment', async () => {
      const commentId = new mongooseTypes.ObjectId();
      const createdAtId = new mongooseTypes.ObjectId();
      const authorId = new mongooseTypes.ObjectId();
      const stateId = new mongooseTypes.ObjectId();

      // createComment
      const createCommentFromModelStub = sandbox.stub();
      createCommentFromModelStub.resolves({
        ...mocks.MOCK_COMMENT,
        _id: new mongooseTypes.ObjectId(),
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as unknown as databaseTypes.IComment);

      sandbox.replace(
        dbConnection.models.CommentModel,
        'createComment',
        createCommentFromModelStub
      );

      const doc = await commentService.createComment({
        ...mocks.MOCK_COMMENT,
        _id: new mongooseTypes.ObjectId(),
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as unknown as databaseTypes.IComment);

      assert.isTrue(createCommentFromModelStub.calledOnce);
    });
    // comment model fails
    it('will publish and rethrow an InvalidArgumentError when comment model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createComment
      const createCommentFromModelStub = sandbox.stub();
      createCommentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.CommentModel,
        'createComment',
        createCommentFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
        await commentService.createComment({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createCommentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when comment model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createComment
      const createCommentFromModelStub = sandbox.stub();
      createCommentFromModelStub.rejects(err);

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
        await commentService.createComment({});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createCommentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when comment model throws it', async () => {
      const createCommentFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createCommentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.CommentModel,
        'createComment',
        createCommentFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
        await commentService.createComment({});
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createCommentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when comment model throws a DataOperationError', async () => {
      const createCommentFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createCommentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.CommentModel,
        'createComment',
        createCommentFromModelStub
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
        await commentService.createComment({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createCommentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when comment model throws a UnexpectedError', async () => {
      const createCommentFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(errMessage, 'mongodDb');

      createCommentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.CommentModel,
        'createComment',
        createCommentFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
        await commentService.createComment({});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createCommentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getComment', () => {
    it('should get a comment by id', async () => {
      const commentId = new mongooseTypes.ObjectId();

      const getCommentFromModelStub = sandbox.stub();
      getCommentFromModelStub.resolves({
        _id: commentId,
      } as unknown as databaseTypes.IComment);
      sandbox.replace(
        dbConnection.models.CommentModel,
        'getCommentById',
        getCommentFromModelStub
      );

      const comment = await commentService.getComment(commentId);
      assert.isOk(comment);
      assert.strictEqual(comment?._id?.toString(), commentId.toString());

      assert.isTrue(getCommentFromModelStub.calledOnce);
    });
    it('should get a comment by id when id is a string', async () => {
      const commentId = new mongooseTypes.ObjectId();

      const getCommentFromModelStub = sandbox.stub();
      getCommentFromModelStub.resolves({
        _id: commentId,
      } as unknown as databaseTypes.IComment);
      sandbox.replace(
        dbConnection.models.CommentModel,
        'getCommentById',
        getCommentFromModelStub
      );

      const comment = await commentService.getComment(commentId.toString());
      assert.isOk(comment);
      assert.strictEqual(comment?._id?.toString(), commentId.toString());

      assert.isTrue(getCommentFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the comment cannot be found', async () => {
      const commentId = new mongooseTypes.ObjectId();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'commentId',
        commentId
      );
      const getCommentFromModelStub = sandbox.stub();
      getCommentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CommentModel,
        'getCommentById',
        getCommentFromModelStub
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

      const comment = await commentService.getComment(commentId);
      assert.notOk(comment);

      assert.isTrue(getCommentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const commentId = new mongooseTypes.ObjectId();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getCommentById'
      );
      const getCommentFromModelStub = sandbox.stub();
      getCommentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CommentModel,
        'getCommentById',
        getCommentFromModelStub
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
        await commentService.getComment(commentId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getCommentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getComments', () => {
    it('should get comments by filter', async () => {
      const commentId = new mongooseTypes.ObjectId();
      const commentId2 = new mongooseTypes.ObjectId();
      const commentFilter = {_id: commentId};

      const queryCommentsFromModelStub = sandbox.stub();
      queryCommentsFromModelStub.resolves({
        results: [
          {
            ...mocks.MOCK_COMMENT,
            _id: commentId,
            author: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
            state: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IState,
          } as unknown as databaseTypes.IComment,
          {
            ...mocks.MOCK_COMMENT,
            _id: commentId2,
            author: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IUser,
            state: {
              _id: new mongooseTypes.ObjectId(),
              __v: 1,
            } as unknown as databaseTypes.IState,
          } as unknown as databaseTypes.IComment,
        ],
      } as unknown as databaseTypes.IComment[]);

      sandbox.replace(
        dbConnection.models.CommentModel,
        'queryComments',
        queryCommentsFromModelStub
      );

      const comments = await commentService.getComments(commentFilter);
      assert.isOk(comments![0]);
      assert.strictEqual(comments![0]._id?.toString(), commentId.toString());
      assert.isTrue(queryCommentsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the comments cannot be found', async () => {
      const commentName = 'commentName1';
      const commentFilter = {name: commentName};
      const errMessage = 'Cannot find the comment';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        commentFilter
      );
      const getCommentFromModelStub = sandbox.stub();
      getCommentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CommentModel,
        'queryComments',
        getCommentFromModelStub
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

      const comment = await commentService.getComments(commentFilter);
      assert.notOk(comment);

      assert.isTrue(getCommentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const commentName = 'commentName1';
      const commentFilter = {name: commentName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getCommentByEmail'
      );
      const getCommentFromModelStub = sandbox.stub();
      getCommentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CommentModel,
        'queryComments',
        getCommentFromModelStub
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
        await commentService.getComments(commentFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getCommentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateComment', () => {
    it('will update a comment', async () => {
      const commentId = new mongooseTypes.ObjectId();
      const updateCommentFromModelStub = sandbox.stub();
      updateCommentFromModelStub.resolves({
        ...mocks.MOCK_COMMENT,
        _id: new mongooseTypes.ObjectId(),
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as unknown as databaseTypes.IComment);
      sandbox.replace(
        dbConnection.models.CommentModel,
        'updateCommentById',
        updateCommentFromModelStub
      );

      const comment = await commentService.updateComment(commentId, {
        deletedAt: new Date(),
      });
      assert.isOk(comment);
      assert.strictEqual(comment._id, commentId);
      assert.isOk(comment.deletedAt);
      assert.isTrue(updateCommentFromModelStub.calledOnce);
    });
    it('will update a comment when the id is a string', async () => {
      const commentId = new mongooseTypes.ObjectId();
      const updateCommentFromModelStub = sandbox.stub();
      updateCommentFromModelStub.resolves({
        ...mocks.MOCK_COMMENT,
        _id: new mongooseTypes.ObjectId(),
        author: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as unknown as databaseTypes.IComment);
      sandbox.replace(
        dbConnection.models.CommentModel,
        'updateCommentById',
        updateCommentFromModelStub
      );

      const comment = await commentService.updateComment(commentId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(comment);
      assert.strictEqual(comment._id, commentId);
      assert.isOk(comment.deletedAt);
      assert.isTrue(updateCommentFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when comment model throws it ', async () => {
      const commentId = new mongooseTypes.ObjectId();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateCommentFromModelStub = sandbox.stub();
      updateCommentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CommentModel,
        'updateCommentById',
        updateCommentFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
        await commentService.updateComment(commentId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateCommentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when comment model throws it ', async () => {
      const commentId = new mongooseTypes.ObjectId();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateCommentFromModelStub = sandbox.stub();
      updateCommentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CommentModel,
        'updateCommentById',
        updateCommentFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
        await commentService.updateComment(commentId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateCommentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when comment model throws a DataOperationError ', async () => {
      const commentId = new mongooseTypes.ObjectId();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCommentById'
      );
      const updateCommentFromModelStub = sandbox.stub();
      updateCommentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CommentModel,
        'updateCommentById',
        updateCommentFromModelStub
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
        await commentService.updateComment(commentId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateCommentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});

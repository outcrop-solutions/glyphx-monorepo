// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import {CommentModel} from '../../../mongoose/models/comment';
import * as mocks from '../../../mongoose/mocks';
import {UserModel} from '../../../mongoose/models/user';
import {StateModel} from '../../../mongoose/models/state';
import {IQueryResult} from '@glyphx/types';
import {databaseTypes} from '../../../../../../database';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/comment', () => {
  context('commentIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the commentId exists', async () => {
      const commentId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: commentId});
      sandbox.replace(CommentModel, 'findById', findByIdStub);

      const result = await CommentModel.commentIdExists(commentId);

      assert.isTrue(result);
    });

    it('should return false if the commentId does not exist', async () => {
      const commentId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(CommentModel, 'findById', findByIdStub);

      const result = await CommentModel.commentIdExists(commentId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const commentId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(CommentModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await CommentModel.commentIdExists(commentId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allCommentIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the comment ids exist', async () => {
      const commentIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedCommentIds = commentIds.map(commentId => {
        return {
          _id: commentId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedCommentIds);
      sandbox.replace(CommentModel, 'find', findStub);

      assert.isTrue(await CommentModel.allCommentIdsExist(commentIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const commentIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedCommentIds = [
        {
          _id: commentIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedCommentIds);
      sandbox.replace(CommentModel, 'find', findStub);
      let errored = false;
      try {
        await CommentModel.allCommentIdsExist(commentIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          commentIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const commentIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(CommentModel, 'find', findStub);
      let errored = false;
      try {
        await CommentModel.allCommentIdsExist(commentIds);
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
        await CommentModel.validateUpdateObject(
          mocks.MOCK_COMMENT as unknown as Omit<
            Partial<databaseTypes.IComment>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', authorStub);
      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateStub);

      let errored = false;

      try {
        await CommentModel.validateUpdateObject(
          mocks.MOCK_COMMENT as unknown as Omit<
            Partial<databaseTypes.IComment>,
            '_id'
          >
        );
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(authorStub.calledOnce);
      assert.isTrue(stateStub.calledOnce);
    });

    it('will fail when the author does not exist.', async () => {
      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateStub);

      let errored = false;

      try {
        await CommentModel.validateUpdateObject(
          mocks.MOCK_COMMENT as unknown as Omit<
            Partial<databaseTypes.IComment>,
            '_id'
          >
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
    it('will fail when the state does not exist.', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', authorStub);

      let errored = false;

      try {
        await CommentModel.validateUpdateObject(
          mocks.MOCK_COMMENT as unknown as Omit<
            Partial<databaseTypes.IComment>,
            '_id'
          >
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the _id', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', authorStub);
      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateStub);

      let errored = false;

      try {
        await CommentModel.validateUpdateObject({
          ...mocks.MOCK_COMMENT,
          _id: new mongoose.Types.ObjectId(),
        } as unknown as Omit<Partial<databaseTypes.IComment>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', authorStub);
      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateStub);

      let errored = false;

      try {
        await CommentModel.validateUpdateObject({
          ...mocks.MOCK_COMMENT,
          createdAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IComment>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const authorStub = sandbox.stub();
      authorStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', authorStub);
      const stateStub = sandbox.stub();
      stateStub.resolves(true);
      sandbox.replace(StateModel, 'stateIdExists', stateStub);

      let errored = false;

      try {
        await CommentModel.validateUpdateObject({
          ...mocks.MOCK_COMMENT,
          updatedAt: new Date(),
        } as unknown as Omit<Partial<databaseTypes.IComment>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createComment', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a comment document', async () => {
      sandbox.replace(
        CommentModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_COMMENT.author)
      );
      sandbox.replace(
        CommentModel,
        'validateState',
        sandbox.stub().resolves(mocks.MOCK_COMMENT.state)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        CommentModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(CommentModel, 'validate', sandbox.stub().resolves(true));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(CommentModel, 'getCommentById', stub);

      const commentDocument = await CommentModel.createComment(
        mocks.MOCK_COMMENT
      );

      assert.strictEqual(commentDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });

    it('will rethrow a DataValidationError when the author validator throws one', async () => {
      sandbox.replace(
        CommentModel,
        'validateAuthor',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The author does not exist',
              'author ',
              {}
            )
          )
      );
      sandbox.replace(
        CommentModel,
        'validateState',
        sandbox.stub().resolves(mocks.MOCK_COMMENT.state)
      );

      let errored = false;

      try {
        await CommentModel.validateUpdateObject(
          mocks.MOCK_COMMENT as unknown as Omit<
            Partial<databaseTypes.IComment>,
            '_id'
          >
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will rethrow a DataValidationError when the state validator throws one', async () => {
      sandbox.replace(
        CommentModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_COMMENT.author)
      );
      sandbox.replace(
        CommentModel,
        'validateState',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The state does not exist',
              'state ',
              {}
            )
          )
      );

      let errored = false;

      try {
        await CommentModel.validateUpdateObject(
          mocks.MOCK_COMMENT as unknown as Omit<
            Partial<databaseTypes.IComment>,
            '_id'
          >
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        CommentModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_COMMENT.author)
      );
      sandbox.replace(
        CommentModel,
        'validateState',
        sandbox.stub().resolves(mocks.MOCK_COMMENT.state)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(CommentModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        CommentModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(CommentModel, 'getCommentById', stub);
      let hasError = false;
      try {
        await CommentModel.createComment(mocks.MOCK_COMMENT);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        CommentModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_COMMENT.author)
      );
      sandbox.replace(
        CommentModel,
        'validateState',
        sandbox.stub().resolves(mocks.MOCK_COMMENT.state)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(CommentModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(CommentModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(CommentModel, 'getCommentById', stub);

      let hasError = false;
      try {
        await CommentModel.createComment(mocks.MOCK_COMMENT);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        CommentModel,
        'validateAuthor',
        sandbox.stub().resolves(mocks.MOCK_COMMENT.author)
      );
      sandbox.replace(
        CommentModel,
        'validateState',
        sandbox.stub().resolves(mocks.MOCK_COMMENT.state)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        CommentModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        CommentModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(CommentModel, 'getCommentById', stub);
      let hasError = false;
      try {
        await CommentModel.createComment(mocks.MOCK_COMMENT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getCommentById', () => {
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

    it('will retreive a comment document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_COMMENT));
      sandbox.replace(CommentModel, 'findById', findByIdStub);

      const doc = await CommentModel.getCommentById(
        mocks.MOCK_COMMENT._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.author as any).__v);
      assert.isUndefined((doc.state as any).__v);

      assert.strictEqual(doc._id, mocks.MOCK_COMMENT._id);
    });

    it('will throw a DataNotFoundError when the comment does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(CommentModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await CommentModel.getCommentById(
          mocks.MOCK_COMMENT._id as mongoose.Types.ObjectId
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
      sandbox.replace(CommentModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await CommentModel.getCommentById(
          mocks.MOCK_COMMENT._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryComments', () => {
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

    const mockComments = [
      {
        ...mocks.MOCK_COMMENT,
        _id: new mongoose.Types.ObjectId(),
        author: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as databaseTypes.IComment,
      {
        ...mocks.MOCK_COMMENT,
        _id: new mongoose.Types.ObjectId(),
        author: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as databaseTypes.IComment,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered comments', async () => {
      sandbox.replace(
        CommentModel,
        'count',
        sandbox.stub().resolves(mockComments.length)
      );

      sandbox.replace(
        CommentModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockComments))
      );

      const results = await CommentModel.queryComments({});

      assert.strictEqual(results.numberOfItems, mockComments.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockComments.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any).__v);
        assert.isUndefined((doc.author as any).__v);
        assert.isUndefined((doc.state as any).__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(CommentModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        CommentModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockComments))
      );

      let errored = false;
      try {
        await CommentModel.queryComments();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        CommentModel,
        'count',
        sandbox.stub().resolves(mockComments.length)
      );

      sandbox.replace(
        CommentModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockComments))
      );

      let errored = false;
      try {
        await CommentModel.queryComments({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        CommentModel,
        'count',
        sandbox.stub().resolves(mockComments.length)
      );

      sandbox.replace(
        CommentModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await CommentModel.queryComments({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateCommentById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a comment', async () => {
      const updateComment = {
        ...mocks.MOCK_COMMENT,
        deletedAt: new Date(),
        author: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        state: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IState,
      } as unknown as databaseTypes.IComment;

      const commentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(CommentModel, 'updateOne', updateStub);

      const getCommentStub = sandbox.stub();
      getCommentStub.resolves({_id: commentId});
      sandbox.replace(CommentModel, 'getCommentById', getCommentStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(CommentModel, 'validateUpdateObject', validateStub);

      const result = await CommentModel.updateCommentById(
        commentId,
        updateComment
      );

      assert.strictEqual(result._id, commentId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getCommentStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a comment with refrences as ObjectIds', async () => {
      const updateComment = {
        ...mocks.MOCK_COMMENT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IComment;

      const commentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(CommentModel, 'updateOne', updateStub);

      const getCommentStub = sandbox.stub();
      getCommentStub.resolves({_id: commentId});
      sandbox.replace(CommentModel, 'getCommentById', getCommentStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(CommentModel, 'validateUpdateObject', validateStub);

      const result = await CommentModel.updateCommentById(
        commentId,
        updateComment
      );

      assert.strictEqual(result._id, commentId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getCommentStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the comment does not exist', async () => {
      const updateComment = {
        ...mocks.MOCK_COMMENT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IComment;

      const commentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(CommentModel, 'updateOne', updateStub);

      const getCommentStub = sandbox.stub();
      getCommentStub.resolves({_id: commentId});
      sandbox.replace(CommentModel, 'getCommentById', getCommentStub);

      let errorred = false;
      try {
        await CommentModel.updateCommentById(commentId, updateComment);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateComment = {
        ...mocks.MOCK_COMMENT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IComment;

      const commentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(CommentModel, 'updateOne', updateStub);

      const getCommentStub = sandbox.stub();
      getCommentStub.resolves({_id: commentId});
      sandbox.replace(CommentModel, 'getCommentById', getCommentStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(CommentModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await CommentModel.updateCommentById(commentId, updateComment);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateComment = {
        ...mocks.MOCK_COMMENT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.IComment;

      const commentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(CommentModel, 'updateOne', updateStub);

      const getCommentStub = sandbox.stub();
      getCommentStub.resolves({_id: commentId});
      sandbox.replace(CommentModel, 'getCommentById', getCommentStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(CommentModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await CommentModel.updateCommentById(commentId, updateComment);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a comment document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a comment', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(CommentModel, 'deleteOne', deleteStub);

      const commentId = new mongoose.Types.ObjectId();

      await CommentModel.deleteCommentById(commentId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the comment does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(CommentModel, 'deleteOne', deleteStub);

      const commentId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await CommentModel.deleteCommentById(commentId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(CommentModel, 'deleteOne', deleteStub);

      const commentId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await CommentModel.deleteCommentById(commentId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });
});

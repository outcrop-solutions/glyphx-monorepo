// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#CommentModel', () => {
  context('test the crud functions of the comment model', () => {
    const mongoConnection = new MongoDbConnection();
    const commentModel = mongoConnection.models.CommentModel;
    let commentDocId: ObjectId;
    let commentDocId2: ObjectId;
    let authorId: ObjectId;
    let authorDocument: any;
    let stateId: ObjectId;
    let stateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const authorModel = mongoConnection.models.UserModel;
      const savedAuthorDocument = await authorModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      authorId = savedAuthorDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(authorId);
      const stateModel = mongoConnection.models.StateModel;
      const savedStateDocument = await stateModel.create([mocks.MOCK_STATE], {
        validateBeforeSave: false,
      });
      stateId = savedStateDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(stateId);
    });

    after(async () => {
      if (commentDocId) {
        await commentModel.findByIdAndDelete(commentDocId);
      }

      if (commentDocId2) {
        await commentModel.findByIdAndDelete(commentDocId2);
      }
      const authorModel = mongoConnection.models.UserModel;
      await authorModel.findByIdAndDelete(authorId);
      const stateModel = mongoConnection.models.StateModel;
      await stateModel.findByIdAndDelete(stateId);
    });

    it('add a new comment ', async () => {
      const commentInput = JSON.parse(JSON.stringify(mocks.MOCK_COMMENT));

      commentInput.author = authorDocument;
      commentInput.state = stateDocument;

      const commentDocument = await commentModel.createComment(commentInput);

      assert.isOk(commentDocument);
      assert.strictEqual(
        Object.keys(commentDocument)[1],
        Object.keys(commentInput)[1]
      );

      commentDocId = commentDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a comment', async () => {
      assert.isOk(commentDocId);
      const comment = await commentModel.getCommentById(commentDocId);

      assert.isOk(comment);
      assert.strictEqual(comment._id?.toString(), commentDocId.toString());
    });

    it('modify a comment', async () => {
      assert.isOk(commentDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await commentModel.updateCommentById(
        commentDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple comments without a filter', async () => {
      assert.isOk(commentDocId);
      const commentInput = JSON.parse(JSON.stringify(mocks.MOCK_COMMENT));

      const commentDocument = await commentModel.createComment(commentInput);

      assert.isOk(commentDocument);

      commentDocId2 = commentDocument._id as mongooseTypes.ObjectId;

      const comments = await commentModel.queryComments();
      assert.isArray(comments.results);
      assert.isAtLeast(comments.numberOfItems, 2);
      const expectedDocumentCount =
        comments.numberOfItems <= comments.itemsPerPage
          ? comments.numberOfItems
          : comments.itemsPerPage;
      assert.strictEqual(comments.results.length, expectedDocumentCount);
    });

    it('Get multiple comments with a filter', async () => {
      assert.isOk(commentDocId2);
      const results = await commentModel.queryComments({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(commentDocId2);
      const results = await commentModel.queryComments({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await commentModel.queryComments({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a comment', async () => {
      assert.isOk(commentDocId);
      await commentModel.deleteCommentById(commentDocId);
      let errored = false;
      try {
        await commentModel.getCommentById(commentDocId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      commentDocId = null as unknown as ObjectId;
    });
  });
});

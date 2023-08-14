// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_COMMENT} from '../mocks';
import {commentService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_COMMENT);

describe('#CommentService', () => {
  context('test the functions of the comment service', () => {
    const mongoConnection = new MongoDbConnection();
    const commentModel = mongoConnection.models.CommentModel;
    let commentId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const commentDocument = await commentModel.createComment(
        MOCK_COMMENT as unknown as databaseTypes.IComment
      );

      commentId = commentDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (commentId) {
        await commentModel.findByIdAndDelete(commentId);
      }
    });

    it('will retreive our comment from the database', async () => {
      const comment = await commentService.getComment(commentId);
      assert.isOk(comment);

      assert.strictEqual(comment?.name, MOCK_COMMENT.name);
    });

    it('will update our comment', async () => {
      assert.isOk(commentId);
      const updatedComment = await commentService.updateComment(commentId, {
        [propKeys]: generateDataFromType(MOCK),
      });
      assert.strictEqual(updatedComment.name, INPUT_PROJECT_NAME);

      const savedComment = await commentService.getComment(commentId);

      assert.strictEqual(savedComment?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our comment', async () => {
      assert.isOk(commentId);
      const updatedComment = await commentService.deleteComment(commentId);
      assert.strictEqual(updatedComment[propKeys[0]], propKeys[0]);

      const savedComment = await commentService.getComment(commentId);

      assert.isOk(savedComment?.deletedAt);
    });
  });
});

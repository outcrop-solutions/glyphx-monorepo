// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks';
import {commentService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_COMMENT);

describe('#CommentService', () => {
  context('test the functions of the comment service', () => {
    const mongoConnection = new MongoDbConnection();
    const commentModel = mongoConnection.models.CommentModel;
    let commentId: ObjectId;

    const authorModel = mongoConnection.models.UserModel;
    let authorId: ObjectId;
    const stateModel = mongoConnection.models.StateModel;
    let stateId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const commentDocument = await commentModel.createComment(
        // @ts-ignore
        mocks.MOCK_COMMENT as unknown as databaseTypes.IComment
      );
      commentId = commentDocument._id as unknown as mongooseTypes.ObjectId;

      const savedAuthorDocument = await authorModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      authorId = savedAuthorDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(authorId);

      const savedStateDocument = await stateModel.create([mocks.MOCK_STATE], {
        validateBeforeSave: false,
      });
      stateId = savedStateDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(stateId);
    });

    after(async () => {
      if (commentId) {
        await commentModel.findByIdAndDelete(commentId);
      }
      if (authorId) {
        await authorModel.findByIdAndDelete(authorId);
      }
      if (stateId) {
        await stateModel.findByIdAndDelete(stateId);
      }
    });

    it('will retreive our comment from the database', async () => {
      const comment = await commentService.getComment(commentId);
      assert.isOk(comment);
    });

    // updates and deletes
    it('will update our comment', async () => {
      assert.isOk(commentId);
      const updatedComment = await commentService.updateComment(commentId, {
        deletedAt: new Date(),
      });
      assert.isOk(updatedComment.deletedAt);

      const savedComment = await commentService.getComment(commentId);

      assert.isOk(savedComment!.deletedAt);
    });
  });
});

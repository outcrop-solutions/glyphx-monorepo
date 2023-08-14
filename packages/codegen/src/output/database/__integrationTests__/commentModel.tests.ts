// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#CommentModel', () => {
  context('test the crud functions of the comment model', () => {
    const mongoConnection = new MongoDbConnection();
    const commentModel = mongoConnection.models.CommentModel;
    let commentId: ObjectId;
    let memberId: ObjectId;
    let commentId2: ObjectId;
    let workspaceId: ObjectId;
    let commentTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let commentTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const commentTemplateModel = mongoConnection.models.CommentTemplateModel;

      await workspaceModel.create([INPUT_WORKSPACE], {
        validateBeforeSave: false,
      });
      const savedWorkspaceDocument = await workspaceModel
        .findOne({name: INPUT_WORKSPACE.name})
        .lean();
      workspaceId = savedWorkspaceDocument?._id as mongooseTypes.ObjectId;
      workspaceDocument = savedWorkspaceDocument;
      assert.isOk(workspaceId);

      await memberModel.create([INPUT_MEMBER], {
        validateBeforeSave: false,
      });
      const savedMemberDocument = await memberModel
        .findOne({email: INPUT_MEMBER.email})
        .lean();
      memberId = savedMemberDocument?._id as mongooseTypes.ObjectId;
      memberDocument = savedMemberDocument;
      assert.isOk(memberId);

      await commentTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedCommentTemplateDocument = await commentTemplateModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      commentTemplateId =
        savedCommentTemplateDocument?._id as mongooseTypes.ObjectId;

      commentTemplateDocument = savedCommentTemplateDocument;

      assert.isOk(commentTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const commentTemplateModel = mongoConnection.models.CommentTemplateModel;
      await commentTemplateModel.findByIdAndDelete(commentTemplateId);

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (commentId) {
        await commentModel.findByIdAndDelete(commentId);
      }

      if (commentId2) {
        await commentModel.findByIdAndDelete(commentId2);
      }
    });

    it('add a new comment ', async () => {
      const commentInput = JSON.parse(JSON.stringify(INPUT_DATA));
      commentInput.workspace = workspaceDocument;
      commentInput.template = commentTemplateDocument;

      const commentDocument = await commentModel.createComment(commentInput);

      assert.isOk(commentDocument);
      assert.strictEqual(commentDocument.name, commentInput.name);
      assert.strictEqual(
        commentDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      commentId = commentDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a comment', async () => {
      assert.isOk(commentId);
      const comment = await commentModel.getCommentById(commentId);

      assert.isOk(comment);
      assert.strictEqual(comment._id?.toString(), commentId.toString());
    });

    it('modify a comment', async () => {
      assert.isOk(commentId);
      const input = {description: 'a modified description'};
      const updatedDocument = await commentModel.updateCommentById(
        commentId,
        input
      );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple comments without a filter', async () => {
      assert.isOk(commentId);
      const commentInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      commentInput.workspace = workspaceDocument;
      commentInput.type = commentTemplateDocument;

      const commentDocument = await commentModel.createComment(commentInput);

      assert.isOk(commentDocument);

      commentId2 = commentDocument._id as mongooseTypes.ObjectId;

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
      assert.isOk(commentId2);
      const results = await commentModel.queryComments({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
      assert.isOk(commentId2);
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
      assert.isOk(commentId);
      await commentModel.deleteCommentById(commentId);
      let errored = false;
      try {
        await commentModel.getCommentById(commentId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      commentId = null as unknown as ObjectId;
    });
  });
});

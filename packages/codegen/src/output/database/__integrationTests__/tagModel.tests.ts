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

describe('#TagModel', () => {
  context('test the crud functions of the tag model', () => {
    const mongoConnection = new MongoDbConnection();
    const tagModel = mongoConnection.models.TagModel;
    let tagId: ObjectId;
    let memberId: ObjectId;
    let tagId2: ObjectId;
    let workspaceId: ObjectId;
    let tagTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let tagTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const tagTemplateModel = mongoConnection.models.TagTemplateModel;

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

      await tagTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedTagTemplateDocument = await tagTemplateModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      tagTemplateId = savedTagTemplateDocument?._id as mongooseTypes.ObjectId;

      tagTemplateDocument = savedTagTemplateDocument;

      assert.isOk(tagTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const tagTemplateModel = mongoConnection.models.TagTemplateModel;
      await tagTemplateModel.findByIdAndDelete(tagTemplateId);

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (tagId) {
        await tagModel.findByIdAndDelete(tagId);
      }

      if (tagId2) {
        await tagModel.findByIdAndDelete(tagId2);
      }
    });

    it('add a new tag ', async () => {
      const tagInput = JSON.parse(JSON.stringify(INPUT_DATA));
      tagInput.workspace = workspaceDocument;
      tagInput.template = tagTemplateDocument;

      const tagDocument = await tagModel.createTag(tagInput);

      assert.isOk(tagDocument);
      assert.strictEqual(tagDocument.name, tagInput.name);
      assert.strictEqual(
        tagDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      tagId = tagDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a tag', async () => {
      assert.isOk(tagId);
      const tag = await tagModel.getTagById(tagId);

      assert.isOk(tag);
      assert.strictEqual(tag._id?.toString(), tagId.toString());
    });

    it('modify a tag', async () => {
      assert.isOk(tagId);
      const input = {description: 'a modified description'};
      const updatedDocument = await tagModel.updateTagById(tagId, input);
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple tags without a filter', async () => {
      assert.isOk(tagId);
      const tagInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      tagInput.workspace = workspaceDocument;
      tagInput.type = tagTemplateDocument;

      const tagDocument = await tagModel.createTag(tagInput);

      assert.isOk(tagDocument);

      tagId2 = tagDocument._id as mongooseTypes.ObjectId;

      const tags = await tagModel.queryTags();
      assert.isArray(tags.results);
      assert.isAtLeast(tags.numberOfItems, 2);
      const expectedDocumentCount =
        tags.numberOfItems <= tags.itemsPerPage
          ? tags.numberOfItems
          : tags.itemsPerPage;
      assert.strictEqual(tags.results.length, expectedDocumentCount);
    });

    it('Get multiple tags with a filter', async () => {
      assert.isOk(tagId2);
      const results = await tagModel.queryTags({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
      assert.isOk(tagId2);
      const results = await tagModel.queryTags({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await tagModel.queryTags({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a tag', async () => {
      assert.isOk(tagId);
      await tagModel.deleteTagById(tagId);
      let errored = false;
      try {
        await tagModel.getTagById(tagId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      tagId = null as unknown as ObjectId;
    });
  });
});

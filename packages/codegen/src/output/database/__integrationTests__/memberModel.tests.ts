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

describe('#MemberModel', () => {
  context('test the crud functions of the member model', () => {
    const mongoConnection = new MongoDbConnection();
    const memberModel = mongoConnection.models.MemberModel;
    let memberId: ObjectId;
    let memberId: ObjectId;
    let memberId2: ObjectId;
    let workspaceId: ObjectId;
    let memberTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let memberTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const memberTemplateModel = mongoConnection.models.MemberTemplateModel;

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

      await memberTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedMemberTemplateDocument = await memberTemplateModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      memberTemplateId =
        savedMemberTemplateDocument?._id as mongooseTypes.ObjectId;

      memberTemplateDocument = savedMemberTemplateDocument;

      assert.isOk(memberTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const memberTemplateModel = mongoConnection.models.MemberTemplateModel;
      await memberTemplateModel.findByIdAndDelete(memberTemplateId);

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (memberId) {
        await memberModel.findByIdAndDelete(memberId);
      }

      if (memberId2) {
        await memberModel.findByIdAndDelete(memberId2);
      }
    });

    it('add a new member ', async () => {
      const memberInput = JSON.parse(JSON.stringify(INPUT_DATA));
      memberInput.workspace = workspaceDocument;
      memberInput.template = memberTemplateDocument;

      const memberDocument = await memberModel.createMember(memberInput);

      assert.isOk(memberDocument);
      assert.strictEqual(memberDocument.name, memberInput.name);
      assert.strictEqual(
        memberDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      memberId = memberDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a member', async () => {
      assert.isOk(memberId);
      const member = await memberModel.getMemberById(memberId);

      assert.isOk(member);
      assert.strictEqual(member._id?.toString(), memberId.toString());
    });

    it('modify a member', async () => {
      assert.isOk(memberId);
      const input = {description: 'a modified description'};
      const updatedDocument = await memberModel.updateMemberById(
        memberId,
        input
      );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple members without a filter', async () => {
      assert.isOk(memberId);
      const memberInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      memberInput.workspace = workspaceDocument;
      memberInput.type = memberTemplateDocument;

      const memberDocument = await memberModel.createMember(memberInput);

      assert.isOk(memberDocument);

      memberId2 = memberDocument._id as mongooseTypes.ObjectId;

      const members = await memberModel.queryMembers();
      assert.isArray(members.results);
      assert.isAtLeast(members.numberOfItems, 2);
      const expectedDocumentCount =
        members.numberOfItems <= members.itemsPerPage
          ? members.numberOfItems
          : members.itemsPerPage;
      assert.strictEqual(members.results.length, expectedDocumentCount);
    });

    it('Get multiple members with a filter', async () => {
      assert.isOk(memberId2);
      const results = await memberModel.queryMembers({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
      assert.isOk(memberId2);
      const results = await memberModel.queryMembers({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await memberModel.queryMembers({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a member', async () => {
      assert.isOk(memberId);
      await memberModel.deleteMemberById(memberId);
      let errored = false;
      try {
        await memberModel.getMemberById(memberId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      memberId = null as unknown as ObjectId;
    });
  });
});

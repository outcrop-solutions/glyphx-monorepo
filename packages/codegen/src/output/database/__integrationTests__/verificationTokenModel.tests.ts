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

describe('#VerificationTokenModel', () => {
  context('test the crud functions of the verificationToken model', () => {
    const mongoConnection = new MongoDbConnection();
    const verificationTokenModel =
      mongoConnection.models.VerificationTokenModel;
    let verificationTokenId: ObjectId;
    let memberId: ObjectId;
    let verificationTokenId2: ObjectId;
    let workspaceId: ObjectId;
    let verificationTokenTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let verificationTokenTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const verificationTokenTemplateModel =
        mongoConnection.models.VerificationTokenTemplateModel;

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

      await verificationTokenTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedVerificationTokenTemplateDocument =
        await verificationTokenTemplateModel
          .findOne({name: INPUT_PROJECT_TYPE.name})
          .lean();
      verificationTokenTemplateId =
        savedVerificationTokenTemplateDocument?._id as mongooseTypes.ObjectId;

      verificationTokenTemplateDocument =
        savedVerificationTokenTemplateDocument;

      assert.isOk(verificationTokenTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const verificationTokenTemplateModel =
        mongoConnection.models.VerificationTokenTemplateModel;
      await verificationTokenTemplateModel.findByIdAndDelete(
        verificationTokenTemplateId
      );

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (verificationTokenId) {
        await verificationTokenModel.findByIdAndDelete(verificationTokenId);
      }

      if (verificationTokenId2) {
        await verificationTokenModel.findByIdAndDelete(verificationTokenId2);
      }
    });

    it('add a new verificationToken ', async () => {
      const verificationTokenInput = JSON.parse(JSON.stringify(INPUT_DATA));
      verificationTokenInput.workspace = workspaceDocument;
      verificationTokenInput.template = verificationTokenTemplateDocument;

      const verificationTokenDocument =
        await verificationTokenModel.createVerificationToken(
          verificationTokenInput
        );

      assert.isOk(verificationTokenDocument);
      assert.strictEqual(
        verificationTokenDocument.name,
        verificationTokenInput.name
      );
      assert.strictEqual(
        verificationTokenDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      verificationTokenId =
        verificationTokenDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a verificationToken', async () => {
      assert.isOk(verificationTokenId);
      const verificationToken =
        await verificationTokenModel.getVerificationTokenById(
          verificationTokenId
        );

      assert.isOk(verificationToken);
      assert.strictEqual(
        verificationToken._id?.toString(),
        verificationTokenId.toString()
      );
    });

    it('modify a verificationToken', async () => {
      assert.isOk(verificationTokenId);
      const input = {description: 'a modified description'};
      const updatedDocument =
        await verificationTokenModel.updateVerificationTokenById(
          verificationTokenId,
          input
        );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple verificationTokens without a filter', async () => {
      assert.isOk(verificationTokenId);
      const verificationTokenInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      verificationTokenInput.workspace = workspaceDocument;
      verificationTokenInput.type = verificationTokenTemplateDocument;

      const verificationTokenDocument =
        await verificationTokenModel.createVerificationToken(
          verificationTokenInput
        );

      assert.isOk(verificationTokenDocument);

      verificationTokenId2 =
        verificationTokenDocument._id as mongooseTypes.ObjectId;

      const verificationTokens =
        await verificationTokenModel.queryVerificationTokens();
      assert.isArray(verificationTokens.results);
      assert.isAtLeast(verificationTokens.numberOfItems, 2);
      const expectedDocumentCount =
        verificationTokens.numberOfItems <= verificationTokens.itemsPerPage
          ? verificationTokens.numberOfItems
          : verificationTokens.itemsPerPage;
      assert.strictEqual(
        verificationTokens.results.length,
        expectedDocumentCount
      );
    });

    it('Get multiple verificationTokens with a filter', async () => {
      assert.isOk(verificationTokenId2);
      const results = await verificationTokenModel.queryVerificationTokens({
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
      assert.isOk(verificationTokenId2);
      const results = await verificationTokenModel.queryVerificationTokens(
        {},
        0,
        1
      );
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await verificationTokenModel.queryVerificationTokens(
        {},
        1,
        1
      );
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a verificationToken', async () => {
      assert.isOk(verificationTokenId);
      await verificationTokenModel.deleteVerificationTokenById(
        verificationTokenId
      );
      let errored = false;
      try {
        await verificationTokenModel.getVerificationTokenById(
          verificationTokenId
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      verificationTokenId = null as unknown as ObjectId;
    });
  });
});

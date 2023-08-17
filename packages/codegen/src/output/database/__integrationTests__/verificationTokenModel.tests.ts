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

describe('#VerificationTokenModel', () => {
  context('test the crud functions of the verificationToken model', () => {
    const mongoConnection = new MongoDbConnection();
    const verificationTokenModel =
      mongoConnection.models.VerificationTokenModel;
    let verificationTokenDocId: ObjectId;
    let verificationTokenDocId2: ObjectId;

    before(async () => {
      await mongoConnection.init();
    });

    after(async () => {
      if (verificationTokenDocId) {
        await verificationTokenModel.findByIdAndDelete(verificationTokenDocId);
      }

      if (verificationTokenDocId2) {
        await verificationTokenModel.findByIdAndDelete(verificationTokenDocId2);
      }
    });

    it('add a new verificationToken ', async () => {
      const verificationTokenInput = JSON.parse(
        JSON.stringify(mocks.MOCK_VERIFICATIONTOKEN)
      );

      const verificationTokenDocument =
        await verificationTokenModel.createVerificationToken(
          verificationTokenInput
        );

      assert.isOk(verificationTokenDocument);
      assert.strictEqual(
        Object.keys(verificationTokenDocument)[1],
        Object.keys(verificationTokenInput)[1]
      );

      verificationTokenDocId =
        verificationTokenDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a verificationToken', async () => {
      assert.isOk(verificationTokenDocId);
      const verificationToken =
        await verificationTokenModel.getVerificationTokenById(
          verificationTokenDocId
        );

      assert.isOk(verificationToken);
      assert.strictEqual(
        verificationToken._id?.toString(),
        verificationTokenDocId.toString()
      );
    });

    it('modify a verificationToken', async () => {
      assert.isOk(verificationTokenDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument =
        await verificationTokenModel.updateVerificationTokenById(
          verificationTokenDocId,
          input
        );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple verificationTokens without a filter', async () => {
      assert.isOk(verificationTokenDocId);
      const verificationTokenInput = JSON.parse(
        JSON.stringify(mocks.MOCK_VERIFICATIONTOKEN)
      );

      const verificationTokenDocument =
        await verificationTokenModel.createVerificationToken(
          verificationTokenInput
        );

      assert.isOk(verificationTokenDocument);

      verificationTokenDocId2 =
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
      assert.isOk(verificationTokenDocId2);
      const results = await verificationTokenModel.queryVerificationTokens({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(verificationTokenDocId2);
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
      assert.isOk(verificationTokenDocId);
      await verificationTokenModel.deleteVerificationTokenById(
        verificationTokenDocId
      );
      let errored = false;
      try {
        await verificationTokenModel.getVerificationTokenById(
          verificationTokenDocId
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      verificationTokenDocId = null as unknown as ObjectId;
    });
  });
});

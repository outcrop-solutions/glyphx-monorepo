import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

const INPUT_DATA = {
  identifier: 'testVerificationToken' + UNIQUE_KEY,
  token: 'testVerificationToken' + UNIQUE_KEY,
  expires: new Date(),
};

const INPUT_DATA2 = {
  identifier: 'testVerificationToken2' + UNIQUE_KEY,
  token: 'testVerificationToken2' + UNIQUE_KEY,
  expires: new Date(),
};
describe('#verificationTokenModel', () => {
  context('test the crud functions of the verificationToken model', () => {
    const mongoConnection = new MongoDbConnection();
    const verificationTokenModel =
      mongoConnection.models.VerificationTokenModel;
    let verificationTokenId: ObjectId;
    let verificationTokenId2: ObjectId;
    before(async () => {
      await mongoConnection.init();
    });

    after(async () => {
      if (verificationTokenId) {
        await verificationTokenModel.findByIdAndDelete(verificationTokenId);
      }

      if (verificationTokenId2) {
        await verificationTokenModel.findByIdAndDelete(verificationTokenId2);
      }
    });

    it('add a new verificationToken', async () => {
      const verificationTokenInput = JSON.parse(JSON.stringify(INPUT_DATA));
      const verificationTokenDocument =
        await verificationTokenModel.createVerificationToken(
          verificationTokenInput
        );

      assert.isOk(verificationTokenDocument);
      assert.strictEqual(
        verificationTokenDocument.identifier,
        verificationTokenInput.identifier
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

    it('Get multiple verification tokens without a filter', async () => {
      assert.isOk(verificationTokenId);
      const verificationTokenInput = JSON.parse(JSON.stringify(INPUT_DATA2));
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

    it('Get multiple verification tokens with a filter', async () => {
      assert.isOk(verificationTokenId2);
      const results = await verificationTokenModel.queryVerificationTokens({
        identifier: INPUT_DATA.identifier,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.identifier, INPUT_DATA.identifier);
    });

    it('page verifciation tokens', async () => {
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
    it('modify a VerificationToken', async () => {
      assert.isOk(verificationTokenId);
      const input = {identifier: 'a modified VerificationToken Token'};
      const updatedDocument =
        await verificationTokenModel.updateVerificationTokenById(
          verificationTokenId,
          input
        );
      assert.strictEqual(updatedDocument.identifier, input.identifier);
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

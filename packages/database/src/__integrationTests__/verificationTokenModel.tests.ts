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

describe('#verificationTokenModel', () => {
  context('test the crud functions of the verificationToken model', () => {
    const mongoConnection = new MongoDbConnection();
    const verificationTokenModel =
      mongoConnection.models.VerificationTokenModel;
    let verificationTokenId: ObjectId;
    before(async () => {
      await mongoConnection.init();
    });

    after(async () => {
      if (verificationTokenId) {
        await verificationTokenModel.findByIdAndDelete(verificationTokenId);
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

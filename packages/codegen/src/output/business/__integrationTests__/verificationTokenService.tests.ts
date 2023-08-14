// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_VERIFICATIONTOKEN} from '../mocks';
import {verificationTokenService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_VERIFICATIONTOKEN);

describe('#VerificationTokenService', () => {
  context('test the functions of the verificationToken service', () => {
    const mongoConnection = new MongoDbConnection();
    const verificationTokenModel =
      mongoConnection.models.VerificationTokenModel;
    let verificationTokenId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const verificationTokenDocument =
        await verificationTokenModel.createVerificationToken(
          MOCK_VERIFICATIONTOKEN as unknown as databaseTypes.IVerificationToken
        );

      verificationTokenId =
        verificationTokenDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (verificationTokenId) {
        await verificationTokenModel.findByIdAndDelete(verificationTokenId);
      }
    });

    it('will retreive our verificationToken from the database', async () => {
      const verificationToken =
        await verificationTokenService.getVerificationToken(
          verificationTokenId
        );
      assert.isOk(verificationToken);

      assert.strictEqual(verificationToken?.name, MOCK_VERIFICATIONTOKEN.name);
    });

    it('will update our verificationToken', async () => {
      assert.isOk(verificationTokenId);
      const updatedVerificationToken =
        await verificationTokenService.updateVerificationToken(
          verificationTokenId,
          {
            [propKeys]: generateDataFromType(MOCK),
          }
        );
      assert.strictEqual(updatedVerificationToken.name, INPUT_PROJECT_NAME);

      const savedVerificationToken =
        await verificationTokenService.getVerificationToken(
          verificationTokenId
        );

      assert.strictEqual(savedVerificationToken?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our verificationToken', async () => {
      assert.isOk(verificationTokenId);
      const updatedVerificationToken =
        await verificationTokenService.deleteVerificationToken(
          verificationTokenId
        );
      assert.strictEqual(updatedVerificationToken[propKeys[0]], propKeys[0]);

      const savedVerificationToken =
        await verificationTokenService.getVerificationToken(
          verificationTokenId
        );

      assert.isOk(savedVerificationToken?.deletedAt);
    });
  });
});

// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks'
import { verificationTokenService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_VERIFICATIONTOKEN)

describe('#VerificationTokenService', () => {
  context('test the functions of the verificationToken service', () => {
    const mongoConnection = new MongoDbConnection();
    const verificationTokenModel = mongoConnection.models.VerificationTokenModel;
    let verificationTokenId: ObjectId;


    before(async () => {
      await mongoConnection.init();

      const verificationTokenDocument = await verificationTokenModel.createVerificationToken(
        // @ts-ignore
        mocks.MOCK_VERIFICATIONTOKEN as unknown as databaseTypes.IVerificationToken
      );
      verificationTokenId = verificationTokenDocument._id as unknown as mongooseTypes.ObjectId;


    });

    after(async () => {
      if (verificationTokenId) {
        await verificationTokenModel.findByIdAndDelete(verificationTokenId);
      }
    });

    it('will retreive our verificationToken from the database', async () => {
      const verificationToken = await verificationTokenService.getVerificationToken(verificationTokenId);
      assert.isOk(verificationToken);
    });

    // updates and deletes
    it('will update our verificationToken', async () => {
      assert.isOk(verificationTokenId);
      const updatedVerificationToken = await verificationTokenService.updateVerificationToken(verificationTokenId, {
        deletedAt: new Date()
      });
      assert.isOk(updatedVerificationToken.deletedAt);

      const savedVerificationToken = await verificationTokenService.getVerificationToken(verificationTokenId);

      assert.isOk(savedVerificationToken!.deletedAt);
    });
  });
});

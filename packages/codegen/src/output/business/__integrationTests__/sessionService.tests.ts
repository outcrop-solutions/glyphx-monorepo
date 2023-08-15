// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from '../../../../database';
import * as mocks from '../../database/mongoose/mocks';
import {sessionService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_SESSION);

describe('#SessionService', () => {
  context('test the functions of the session service', () => {
    const mongoConnection = new MongoDbConnection();
    const sessionModel = mongoConnection.models.SessionModel;
    let sessionId: ObjectId;

    const userModel = mongoConnection.models.UserModel;
    let userId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const sessionDocument = await sessionModel.createSession(
        mocks.MOCK_SESSION as unknown as databaseTypes.ISession
      );
      sessionId = sessionDocument._id as unknown as mongooseTypes.ObjectId;

      const savedUserDocument = await userModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      userId = savedUserDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(userId);
    });

    after(async () => {
      if (sessionId) {
        await sessionModel.findByIdAndDelete(sessionId);
      }
      if (userId) {
        await userModel.findByIdAndDelete(userId);
      }
    });

    it('will retreive our session from the database', async () => {
      const session = await sessionService.getSession(sessionId);
      assert.isOk(session);
    });

    // updates and deletes
    it('will update our session', async () => {
      assert.isOk(sessionId);
      const updatedSession = await sessionService.updateSession(sessionId, {
        deletedAt: new Date(),
      });
      assert.isOk(updatedSession.deletedAt);

      const savedSession = await sessionService.getSession(sessionId);

      assert.isOk(savedSession!.deletedAt);
    });
  });
});

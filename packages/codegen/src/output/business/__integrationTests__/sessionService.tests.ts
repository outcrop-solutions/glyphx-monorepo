// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_SESSION} from '../mocks';
import {sessionService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_SESSION);

describe('#SessionService', () => {
  context('test the functions of the session service', () => {
    const mongoConnection = new MongoDbConnection();
    const sessionModel = mongoConnection.models.SessionModel;
    let sessionId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const sessionDocument = await sessionModel.createSession(
        MOCK_SESSION as unknown as databaseTypes.ISession
      );

      sessionId = sessionDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (sessionId) {
        await sessionModel.findByIdAndDelete(sessionId);
      }
    });

    it('will retreive our session from the database', async () => {
      const session = await sessionService.getSession(sessionId);
      assert.isOk(session);

      assert.strictEqual(session?.name, MOCK_SESSION.name);
    });

    it('will update our session', async () => {
      assert.isOk(sessionId);
      const updatedSession = await sessionService.updateSession(sessionId, {
        [propKeys]: generateDataFromType(MOCK),
      });
      assert.strictEqual(updatedSession.name, INPUT_PROJECT_NAME);

      const savedSession = await sessionService.getSession(sessionId);

      assert.strictEqual(savedSession?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our session', async () => {
      assert.isOk(sessionId);
      const updatedSession = await sessionService.deleteSession(sessionId);
      assert.strictEqual(updatedSession[propKeys[0]], propKeys[0]);

      const savedSession = await sessionService.getSession(sessionId);

      assert.isOk(savedSession?.deletedAt);
    });
  });
});

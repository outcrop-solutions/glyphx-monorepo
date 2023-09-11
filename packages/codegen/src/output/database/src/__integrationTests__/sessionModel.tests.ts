// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#SessionModel', () => {
  context('test the crud functions of the session model', () => {
    const mongoConnection = new MongoDbConnection();
    const sessionModel = mongoConnection.models.SessionModel;
    let sessionDocId: ObjectId;
    let sessionDocId2: ObjectId;
    let userId: ObjectId;
    let userDocument: any;

    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const savedUserDocument = await userModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      userId = savedUserDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(userId);
    });

    after(async () => {
      if (sessionDocId) {
        await sessionModel.findByIdAndDelete(sessionDocId);
      }

      if (sessionDocId2) {
        await sessionModel.findByIdAndDelete(sessionDocId2);
      }
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);
    });

    it('add a new session ', async () => {
      const sessionInput = JSON.parse(JSON.stringify(mocks.MOCK_SESSION));

      sessionInput.user = userDocument;

      const sessionDocument = await sessionModel.createSession(sessionInput);

      assert.isOk(sessionDocument);
      assert.strictEqual(
        Object.keys(sessionDocument)[1],
        Object.keys(sessionInput)[1]
      );

      sessionDocId = sessionDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a session', async () => {
      assert.isOk(sessionDocId);
      const session = await sessionModel.getSessionById(sessionDocId);

      assert.isOk(session);
      assert.strictEqual(session._id?.toString(), sessionDocId.toString());
    });

    it('modify a session', async () => {
      assert.isOk(sessionDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await sessionModel.updateSessionById(
        sessionDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple sessions without a filter', async () => {
      assert.isOk(sessionDocId);
      const sessionInput = JSON.parse(JSON.stringify(mocks.MOCK_SESSION));

      const sessionDocument = await sessionModel.createSession(sessionInput);

      assert.isOk(sessionDocument);

      sessionDocId2 = sessionDocument._id as mongooseTypes.ObjectId;

      const sessions = await sessionModel.querySessions();
      assert.isArray(sessions.results);
      assert.isAtLeast(sessions.numberOfItems, 2);
      const expectedDocumentCount =
        sessions.numberOfItems <= sessions.itemsPerPage
          ? sessions.numberOfItems
          : sessions.itemsPerPage;
      assert.strictEqual(sessions.results.length, expectedDocumentCount);
    });

    it('Get multiple sessions with a filter', async () => {
      assert.isOk(sessionDocId2);
      const results = await sessionModel.querySessions({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(sessionDocId2);
      const results = await sessionModel.querySessions({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await sessionModel.querySessions({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a session', async () => {
      assert.isOk(sessionDocId);
      await sessionModel.deleteSessionById(sessionDocId);
      let errored = false;
      try {
        await sessionModel.getSessionById(sessionDocId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      sessionDocId = null as unknown as ObjectId;
    });
  });
});

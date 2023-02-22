import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

const INPUT_USER = {
  userCode: 'testUserCode' + UNIQUE_KEY,
  name: 'testUser' + UNIQUE_KEY,
  username: 'testUserName' + UNIQUE_KEY,
  email: 'testEmail' + UNIQUE_KEY + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  accounts: [],
  sessions: [],
  membership: [],
  invitedMembers: [],
  createdWorkspaces: [],
  projects: [],
  webhooks: [],
};

const INPUT_DATA = {
  sessionToken: 'testSessionToken' + UNIQUE_KEY,
  expires: new Date(),
  user: {},
};

const INPUT_DATA2 = {
  sessionToken: 'testSessionToken2' + UNIQUE_KEY,
  expires: new Date(),
  user: {},
};

describe.only('#sessionModel', () => {
  context('test the crud functions of the session model', () => {
    const mongoConnection = new MongoDbConnection();
    const sessionModel = mongoConnection.models.SessionModel;
    let sessionId: ObjectId;
    let sessionId2: ObjectId;
    let userId: ObjectId;
    let userDocument: any;
    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      await userModel.createUser(INPUT_USER as databaseTypes.IUser);

      const savedUserDocument = await userModel
        .findOne({name: INPUT_USER.name})
        .lean();
      userId = savedUserDocument?._id as mongooseTypes.ObjectId;

      userDocument = savedUserDocument;

      assert.isOk(userId);
    });

    after(async () => {
      const userModel = mongoConnection.models.UserModel;
      await userModel.findByIdAndDelete(userId);

      if (sessionId) {
        await sessionModel.findByIdAndDelete(sessionId);
      }

      if (sessionId2) {
        await sessionModel.findByIdAndDelete(sessionId2);
      }
    });

    it('add a new session', async () => {
      const sessionInput = JSON.parse(JSON.stringify(INPUT_DATA));
      sessionInput.user = userDocument;
      const sessionDocument = await sessionModel.createSession(sessionInput);

      assert.isOk(sessionDocument);
      assert.strictEqual(
        sessionDocument.sessionToken,
        sessionInput.sessionToken
      );
      assert.strictEqual(
        sessionDocument.user._id?.toString(),
        userId.toString()
      );

      sessionId = sessionDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a session', async () => {
      assert.isOk(sessionId);
      const session = await sessionModel.getSessionById(sessionId);

      assert.isOk(session);
      assert.strictEqual(session._id?.toString(), sessionId.toString());
    });

    it('Get multiple sessions without a filter', async () => {
      assert.isOk(sessionId);
      const sessionInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      sessionInput.user = userDocument;
      const sessionDocument = await sessionModel.createSession(sessionInput);

      assert.isOk(sessionDocument);
      sessionId2 = sessionDocument._id as mongooseTypes.ObjectId;

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
      assert.isOk(sessionId2);
      const results = await sessionModel.querySessions({
        sessionToken: INPUT_DATA.sessionToken,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(
        results.results[0]?.sessionToken,
        INPUT_DATA.sessionToken
      );
    });

    it('pagesessions', async () => {
      assert.isOk(sessionId2);
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

    it('modify a Session', async () => {
      assert.isOk(sessionId);
      const input = {sessionToken: 'a modified Session Token'};
      const updatedDocument = await sessionModel.updateSessionById(
        sessionId,
        input
      );
      assert.strictEqual(updatedDocument.sessionToken, input.sessionToken);
    });

    it('remove a session', async () => {
      assert.isOk(sessionId);
      await sessionModel.deleteSessionById(sessionId);
      let errored = false;
      try {
        await sessionModel.getSessionById(sessionId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      sessionId = null as unknown as ObjectId;
    });
  });
});

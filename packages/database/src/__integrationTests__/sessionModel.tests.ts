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
  name: 'testUser' + UNIQUE_KEY,
  username: 'testUserName' + UNIQUE_KEY,
  gh_username: 'testGhUserName' + UNIQUE_KEY,
  email: 'testEmail' + UNIQUE_KEY + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  apiKey: 'testApiKey' + UNIQUE_KEY,
  role: databaseTypes.constants.ROLE.MEMBER,
};
const INPUT_DATA = {
  sessionToken: 'testSessionToken' + UNIQUE_KEY,
  expires: new Date(),
  user: {},
};

describe('#sessionModel', () => {
  context('test the crud functions of the session model', () => {
    const mongoConnection = new MongoDbConnection();
    const sessionModel = mongoConnection.models.SessionModel;
    let sessionId: ObjectId;
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

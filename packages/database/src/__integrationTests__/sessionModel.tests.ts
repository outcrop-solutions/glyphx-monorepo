import 'mocha';
import {assert} from 'chai';
import {mongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const uniqueKey = v4().replaceAll('-', '');

const inputUser = {
  name: 'testUser' + uniqueKey,
  username: 'testUserName' + uniqueKey,
  gh_username: 'testGhUserName' + uniqueKey,
  email: 'testEmail' + uniqueKey + '@email.com',
  emailVerified: new Date(),
  isVerified: true,
  apiKey: 'testApiKey' + uniqueKey,
  role: databaseTypes.constants.ROLE.USER,
};
const inputData = {
  sessionToken: 'testSessionToken' + uniqueKey,
  expires: new Date(),
  user: {},
};

describe('#sessionModel', () => {
  context('test the crud functions of the session model', () => {
    const mongoConnection = new mongoDbConnection();
    const sessionModel = mongoConnection.models.SessionModel;
    let sessionId: ObjectId;
    let userId: ObjectId;
    let userDocument: any;
    before(async () => {
      await mongoConnection.init();
      const userModel = mongoConnection.models.UserModel;
      const foo = await userModel.createUser(inputUser as databaseTypes.IUser);

      const savedUserDocument = await userModel
        .findOne({name: inputUser.name})
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
      const sessionInput = JSON.parse(JSON.stringify(inputData));
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
        const document = await sessionModel.getSessionById(sessionId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      sessionId = null as unknown as ObjectId;
    });
  });
});

// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#SessionModel', () => {
  context('test the crud functions of the session model', () => {
    const mongoConnection = new MongoDbConnection();
    const sessionModel = mongoConnection.models.SessionModel;
    let sessionId: ObjectId;
    let memberId: ObjectId;
    let sessionId2: ObjectId;
    let workspaceId: ObjectId;
    let sessionTemplateId: ObjectId;
    let workspaceDocument: any;
    let memberDocument: any;
    let sessionTemplateDocument: any;

    before(async () => {
      await mongoConnection.init();
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      const memberModel = mongoConnection.models.MemberModel;
      const sessionTemplateModel = mongoConnection.models.SessionTemplateModel;

      await workspaceModel.create([INPUT_WORKSPACE], {
        validateBeforeSave: false,
      });
      const savedWorkspaceDocument = await workspaceModel
        .findOne({name: INPUT_WORKSPACE.name})
        .lean();
      workspaceId = savedWorkspaceDocument?._id as mongooseTypes.ObjectId;
      workspaceDocument = savedWorkspaceDocument;
      assert.isOk(workspaceId);

      await memberModel.create([INPUT_MEMBER], {
        validateBeforeSave: false,
      });
      const savedMemberDocument = await memberModel
        .findOne({email: INPUT_MEMBER.email})
        .lean();
      memberId = savedMemberDocument?._id as mongooseTypes.ObjectId;
      memberDocument = savedMemberDocument;
      assert.isOk(memberId);

      await sessionTemplateModel.create([INPUT_PROJECT_TYPE], {
        validateBeforeSave: false,
      });
      const savedSessionTemplateDocument = await sessionTemplateModel
        .findOne({name: INPUT_PROJECT_TYPE.name})
        .lean();
      sessionTemplateId =
        savedSessionTemplateDocument?._id as mongooseTypes.ObjectId;

      sessionTemplateDocument = savedSessionTemplateDocument;

      assert.isOk(sessionTemplateId);
    });

    after(async () => {
      const workspaceModel = mongoConnection.models.WorkspaceModel;
      await workspaceModel.findByIdAndDelete(workspaceId);

      const sessionTemplateModel = mongoConnection.models.SessionTemplateModel;
      await sessionTemplateModel.findByIdAndDelete(sessionTemplateId);

      const memberModel = mongoConnection.models.MemberModel;
      if (memberId) await memberModel.findByIdAndDelete(memberId);

      if (sessionId) {
        await sessionModel.findByIdAndDelete(sessionId);
      }

      if (sessionId2) {
        await sessionModel.findByIdAndDelete(sessionId2);
      }
    });

    it('add a new session ', async () => {
      const sessionInput = JSON.parse(JSON.stringify(INPUT_DATA));
      sessionInput.workspace = workspaceDocument;
      sessionInput.template = sessionTemplateDocument;

      const sessionDocument = await sessionModel.createSession(sessionInput);

      assert.isOk(sessionDocument);
      assert.strictEqual(sessionDocument.name, sessionInput.name);
      assert.strictEqual(
        sessionDocument.workspace._id?.toString(),
        workspaceId.toString()
      );

      sessionId = sessionDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a session', async () => {
      assert.isOk(sessionId);
      const session = await sessionModel.getSessionById(sessionId);

      assert.isOk(session);
      assert.strictEqual(session._id?.toString(), sessionId.toString());
    });

    it('modify a session', async () => {
      assert.isOk(sessionId);
      const input = {description: 'a modified description'};
      const updatedDocument = await sessionModel.updateSessionById(
        sessionId,
        input
      );
      assert.strictEqual(updatedDocument.description, input.description);
    });

    it('Get multiple sessions without a filter', async () => {
      assert.isOk(sessionId);
      const sessionInput = JSON.parse(JSON.stringify(INPUT_DATA2));
      sessionInput.workspace = workspaceDocument;
      sessionInput.type = sessionTemplateDocument;

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
        name: INPUT_DATA.name,
      });
      assert.strictEqual(results.results.length, 1);
      assert.strictEqual(results.results[0]?.name, INPUT_DATA.name);
    });

    it('page accounts', async () => {
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

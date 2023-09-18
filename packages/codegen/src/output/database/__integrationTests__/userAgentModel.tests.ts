// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from '@glyphx/core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#UserAgentModel', () => {
  context('test the crud functions of the userAgent model', () => {
    const mongoConnection = new MongoDbConnection();
    const userAgentModel = mongoConnection.models.UserAgentModel;
    let userAgentDocId: ObjectId;
    let userAgentDocId2: ObjectId;

    before(async () => {
      await mongoConnection.init();
    });

    after(async () => {
      if (userAgentDocId) {
        await userAgentModel.findByIdAndDelete(userAgentDocId);
      }

      if (userAgentDocId2) {
        await userAgentModel.findByIdAndDelete(userAgentDocId2);
      }
    });

    it('add a new userAgent ', async () => {
      const userAgentInput = JSON.parse(JSON.stringify(mocks.MOCK_USERAGENT));

      const userAgentDocument = await userAgentModel.createUserAgent(
        userAgentInput
      );

      assert.isOk(userAgentDocument);
      assert.strictEqual(
        Object.keys(userAgentDocument)[1],
        Object.keys(userAgentInput)[1]
      );

      userAgentDocId = userAgentDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a userAgent', async () => {
      assert.isOk(userAgentDocId);
      const userAgent = await userAgentModel.getUserAgentById(userAgentDocId);

      assert.isOk(userAgent);
      assert.strictEqual(userAgent._id?.toString(), userAgentDocId.toString());
    });

    it('modify a userAgent', async () => {
      assert.isOk(userAgentDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await userAgentModel.updateUserAgentById(
        userAgentDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple userAgents without a filter', async () => {
      assert.isOk(userAgentDocId);
      const userAgentInput = JSON.parse(JSON.stringify(mocks.MOCK_USERAGENT));

      const userAgentDocument = await userAgentModel.createUserAgent(
        userAgentInput
      );

      assert.isOk(userAgentDocument);

      userAgentDocId2 = userAgentDocument._id as mongooseTypes.ObjectId;

      const userAgents = await userAgentModel.queryUserAgents();
      assert.isArray(userAgents.results);
      assert.isAtLeast(userAgents.numberOfItems, 2);
      const expectedDocumentCount =
        userAgents.numberOfItems <= userAgents.itemsPerPage
          ? userAgents.numberOfItems
          : userAgents.itemsPerPage;
      assert.strictEqual(userAgents.results.length, expectedDocumentCount);
    });

    it('Get multiple userAgents with a filter', async () => {
      assert.isOk(userAgentDocId2);
      const results = await userAgentModel.queryUserAgents({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(userAgentDocId2);
      const results = await userAgentModel.queryUserAgents({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await userAgentModel.queryUserAgents({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a userAgent', async () => {
      assert.isOk(userAgentDocId);
      await userAgentModel.deleteUserAgentById(userAgentDocId);
      let errored = false;
      try {
        await userAgentModel.getUserAgentById(userAgentDocId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      userAgentDocId = null as unknown as ObjectId;
    });
  });
});

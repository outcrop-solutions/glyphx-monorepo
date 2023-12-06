// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks'
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#PresenceModel', () => {
  context('test the crud functions of the presence model', () => {
    const mongoConnection = new MongoDbConnection();
    const presenceModel = mongoConnection.models.PresenceModel;
    let presenceDocId: string;
    let presenceDocId2: string;
    let configId: string;
    let configDocument: any;

    before(async () => {
      await mongoConnection.init();
      const configModel = mongoConnection.models.ModelConfigModel;
      const savedConfigDocument = await configModel.create([mocks.MOCK_MODELCONFIG], {
        validateBeforeSave: false,
      });
      configId =  savedConfigDocument[0]!._id.toString();
      assert.isOk(configId)
    });

    after(async () => {
      if (presenceDocId) {
        await presenceModel.findByIdAndDelete(presenceDocId);
      }

      if (presenceDocId2) {
        await presenceModel.findByIdAndDelete(presenceDocId2);
      }
      const configModel = mongoConnection.models.ModelConfigModel;
      await configModel.findByIdAndDelete(configId);

    });

    it('add a new presence ', async () => {
      const presenceInput = JSON.parse(JSON.stringify(mocks.MOCK_PRESENCE));

      presenceInput.config = configDocument;

      const presenceDocument = await presenceModel.createPresence(presenceInput);

      assert.isOk(presenceDocument);
      assert.strictEqual(Object.keys(presenceDocument)[1], Object.keys(presenceInput)[1]);


      presenceDocId = presenceDocument._id!.toString();
    });

    it('retreive a presence', async () => {
      assert.isOk(presenceDocId);
      const presence = await presenceModel.getPresenceById(presenceDocId);

      assert.isOk(presence);
      assert.strictEqual(presence._id?.toString(), presenceDocId.toString());
    });

    it('modify a presence', async () => {
      assert.isOk(presenceDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await presenceModel.updatePresenceById(
        presenceDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple presences without a filter', async () => {
      assert.isOk(presenceDocId);
      const presenceInput = JSON.parse(JSON.stringify(mocks.MOCK_PRESENCE));



      const presenceDocument = await presenceModel.createPresence(presenceInput);

      assert.isOk(presenceDocument);

      presenceDocId2 = presenceDocument._id!.toString();

      const presences = await presenceModel.queryPresences();
      assert.isArray(presences.results);
      assert.isAtLeast(presences.numberOfItems, 2);
      const expectedDocumentCount =
        presences.numberOfItems <= presences.itemsPerPage
          ? presences.numberOfItems
          : presences.itemsPerPage;
      assert.strictEqual(presences.results.length, expectedDocumentCount);
    });

    it('Get multiple presences with a filter', async () => {
      assert.isOk(presenceDocId2);
      const results = await presenceModel.queryPresences({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(presenceDocId2);
      const results = await presenceModel.queryPresences({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await presenceModel.queryPresences({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a presence', async () => {
      assert.isOk(presenceDocId);
      await presenceModel.deletePresenceById(presenceDocId.toString());
      let errored = false;
      try {
        await presenceModel.getPresenceById(presenceDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      presenceDocId = null as unknown as string;
    });
  });
});

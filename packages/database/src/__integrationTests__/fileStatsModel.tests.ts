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

describe('#FileStatsModel', () => {
  context('test the crud functions of the fileStats model', () => {
    const mongoConnection = new MongoDbConnection();
    const fileStatsModel = mongoConnection.models.FileStatModel;
    let fileStatsDocId: ObjectId;
    let fileStatsDocId2: ObjectId;

    before(async () => {
      await mongoConnection.init();
    });

    after(async () => {
      if (fileStatsDocId) {
        await fileStatsModel.findByIdAndDelete(fileStatsDocId);
      }

      if (fileStatsDocId2) {
        await fileStatsModel.findByIdAndDelete(fileStatsDocId2);
      }

    });

    it('add a new fileStats ', async () => {
      const fileStatsInput = JSON.parse(JSON.stringify(mocks.MOCK_FILESTATS));


      const fileStatsDocument = await fileStatsModel.createFileStats(fileStatsInput);

      assert.isOk(fileStatsDocument);
      assert.strictEqual(Object.keys(fileStatsDocument)[1], Object.keys(fileStatsInput)[1]);


      fileStatsDocId = fileStatsDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a fileStats', async () => {
      assert.isOk(fileStatsDocId);
      const fileStats = await fileStatsModel.getFileStatsById(fileStatsDocId);

      assert.isOk(fileStats);
      assert.strictEqual(fileStats._id?.toString(), fileStatsDocId.toString());
    });

    it('modify a fileStats', async () => {
      assert.isOk(fileStatsDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await fileStatsModel.updateFileStatsById(
        fileStatsDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple fileStats without a filter', async () => {
      assert.isOk(fileStatsDocId);
      const fileStatsInput = JSON.parse(JSON.stringify(mocks.MOCK_FILESTATS));



      const fileStatsDocument = await fileStatsModel.createFileStats(fileStatsInput);

      assert.isOk(fileStatsDocument);

      fileStatsDocId2 = fileStatsDocument._id as mongooseTypes.ObjectId;

      const fileStats = await fileStatsModel.queryFileStats();
      assert.isArray(fileStats.results);
      assert.isAtLeast(fileStats.numberOfItems, 2);
      const expectedDocumentCount =
        fileStats.numberOfItems <= fileStats.itemsPerPage
          ? fileStats.numberOfItems
          : fileStats.itemsPerPage;
      assert.strictEqual(fileStats.results.length, expectedDocumentCount);
    });

    it('Get multiple fileStatss with a filter', async () => {
      assert.isOk(fileStatsDocId2);
      const results = await fileStatsModel.queryFileStats({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(fileStatsDocId2);
      const results = await fileStatsModel.queryFileStats({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await fileStatsModel.queryFileStats({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a fileStats', async () => {
      assert.isOk(fileStatsDocId);
      await fileStatsModel.deleteFileStatsById(fileStatsDocId.toString());
      let errored = false;
      try {
        await fileStatsModel.getFileStatsById(fileStatsDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      fileStatsDocId = null as unknown as ObjectId;
    });
  });
});

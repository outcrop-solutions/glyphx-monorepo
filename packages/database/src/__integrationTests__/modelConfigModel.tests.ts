// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

describe('#ModelConfigModel', () => {
  context('test the crud functions of the modelConfig model', () => {
    const mongoConnection = new MongoDbConnection();
    const modelConfigModel = mongoConnection.models.ModelConfigModel;
    let modelConfigDocId: ObjectId;
    let modelConfigDocId2: ObjectId;

    before(async () => {
      await mongoConnection.init();
    });

    after(async () => {
      if (modelConfigDocId) {
        await modelConfigModel.findByIdAndDelete(modelConfigDocId);
      }

      if (modelConfigDocId2) {
        await modelConfigModel.findByIdAndDelete(modelConfigDocId2);
      }
    });

    it('add a new modelConfig ', async () => {
      const modelConfigInput = JSON.parse(
        JSON.stringify(mocks.MOCK_MODELCONFIG)
      );

      const modelConfigDocument = await modelConfigModel.createModelConfig(
        modelConfigInput
      );

      assert.isOk(modelConfigDocument);
      assert.strictEqual(
        Object.keys(modelConfigDocument)[1],
        Object.keys(modelConfigInput)[1]
      );

      modelConfigDocId = modelConfigDocument._id as mongooseTypes.ObjectId;
    });

    it('retreive a modelConfig', async () => {
      assert.isOk(modelConfigDocId);
      const modelConfig = await modelConfigModel.getModelConfigById(
        modelConfigDocId
      );

      assert.isOk(modelConfig);
      assert.strictEqual(
        modelConfig._id?.toString(),
        modelConfigDocId.toString()
      );
    });

    it('modify a modelConfig', async () => {
      assert.isOk(modelConfigDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await modelConfigModel.updateModelConfigById(
        modelConfigDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple modelConfigs without a filter', async () => {
      assert.isOk(modelConfigDocId);
      const modelConfigInput = JSON.parse(
        JSON.stringify(mocks.MOCK_MODELCONFIG)
      );

      const modelConfigDocument = await modelConfigModel.createModelConfig(
        modelConfigInput
      );

      assert.isOk(modelConfigDocument);

      modelConfigDocId2 = modelConfigDocument._id as mongooseTypes.ObjectId;

      const modelConfigs = await modelConfigModel.queryModelConfigs();
      assert.isArray(modelConfigs.results);
      assert.isAtLeast(modelConfigs.numberOfItems, 2);
      const expectedDocumentCount =
        modelConfigs.numberOfItems <= modelConfigs.itemsPerPage
          ? modelConfigs.numberOfItems
          : modelConfigs.itemsPerPage;
      assert.strictEqual(modelConfigs.results.length, expectedDocumentCount);
    });

    it('Get multiple modelConfigs with a filter', async () => {
      assert.isOk(modelConfigDocId2);
      const results = await modelConfigModel.queryModelConfigs({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(modelConfigDocId2);
      const results = await modelConfigModel.queryModelConfigs({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await modelConfigModel.queryModelConfigs({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a modelConfig', async () => {
      assert.isOk(modelConfigDocId);
      await modelConfigModel.deleteModelConfigById(modelConfigDocId);
      let errored = false;
      try {
        await modelConfigModel.getModelConfigById(modelConfigDocId);
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      modelConfigDocId = null as unknown as ObjectId;
    });
  });
});

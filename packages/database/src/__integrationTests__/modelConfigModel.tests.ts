// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks';
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose/mongooseConnection';
import {error} from 'core';
import {DBFormatter} from '../lib/format';

describe('#ModelConfigModel', () => {
  context('test the crud functions of the modelConfig model', () => {
    const mongoConnection = new MongoDbConnection();
    const format = new DBFormatter();
    const modelConfigModel = mongoConnection.models.ModelConfigModel;
    let modelConfigDocId: string;
    let modelConfigDocId2: string;

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
      const modelConfigInput = JSON.parse(JSON.stringify(mocks.MOCK_MODELCONFIG));

      const modelConfigDocument = await modelConfigModel.createModelConfig(format.toJS(modelConfigInput));

      assert.isOk(modelConfigDocument);
      modelConfigDocId = modelConfigDocument.id!;
    });

    it('retreive a modelConfig', async () => {
      assert.isOk(modelConfigDocId);
      const modelConfig = await modelConfigModel.getModelConfigById(modelConfigDocId);

      assert.isOk(modelConfig);
      assert.strictEqual(modelConfig.id, modelConfigDocId.toString());
    });

    it('modify a modelConfig', async () => {
      assert.isOk(modelConfigDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await modelConfigModel.updateModelConfigById(modelConfigDocId.toString(), input);
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple modelConfigs without a filter', async () => {
      assert.isOk(modelConfigDocId);
      const modelConfigInput = JSON.parse(JSON.stringify(mocks.MOCK_MODELCONFIG));

      const modelConfigDocument = await modelConfigModel.createModelConfig(modelConfigInput);

      assert.isOk(modelConfigDocument);
      modelConfigDocId2 = modelConfigDocument.id!;

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
        name: mocks.MOCK_MODELCONFIG.name,
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(modelConfigDocId2);
      const results = await modelConfigModel.queryModelConfigs({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?.id;

      const results2 = await modelConfigModel.queryModelConfigs({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(results2.results[0]?.id, lastId?.toString());
    });

    it('remove a modelConfig', async () => {
      assert.isOk(modelConfigDocId);
      await modelConfigModel.deleteModelConfigById(modelConfigDocId.toString());
      let errored = false;
      try {
        await modelConfigModel.getModelConfigById(modelConfigDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      modelConfigDocId = null as unknown as string;
    });
  });
});

// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {databaseTypes} from 'types';
import * as mocks from 'database';
import {modelConfigService} from '../services';

describe('#ModelConfigService', () => {
  context('test the functions of the modelConfig service', () => {
    const mongoConnection = new MongoDbConnection();
    const modelConfigModel = mongoConnection.models.ModelConfigModel;
    let modelConfigId: string;

    before(async () => {
      await mongoConnection.init();

      const modelConfigDocument = await modelConfigModel.createModelConfig(
        mocks.MOCK_MODELCONFIG as unknown as databaseTypes.IModelConfig
      );
      modelConfigId = modelConfigDocument.id!;
    });

    after(async () => {
      if (modelConfigId) {
        await modelConfigModel.findByIdAndDelete(modelConfigId);
      }
    });

    // retreives
    it('will retreive our modelConfig from the database', async () => {
      const modelConfig = await modelConfigService.getModelConfig(modelConfigId);
      assert.isOk(modelConfig);
    });

    // updates and deletes
    it('will update our modelConfig', async () => {
      assert.isOk(modelConfigId);
      const updatedModelConfig = await modelConfigService.updateModelConfig(modelConfigId, {
        deletedAt: new Date(),
      });
      assert.isOk(updatedModelConfig.deletedAt);

      const savedModelConfig = await modelConfigService.getModelConfig(modelConfigId);

      assert.isOk(savedModelConfig!.deletedAt);
    });
  });
});

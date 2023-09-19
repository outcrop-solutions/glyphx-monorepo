// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks'
import { modelConfigService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_MODELCONFIG)

describe('#ModelConfigService', () => {
  context('test the functions of the modelConfig service', () => {
    const mongoConnection = new MongoDbConnection();
    const modelConfigModel = mongoConnection.models.ModelConfigModel;
    let modelConfigId: ObjectId;


    before(async () => {
      await mongoConnection.init();

      const modelConfigDocument = await modelConfigModel.createModelConfig(
        // @ts-ignore
        mocks.MOCK_MODELCONFIG as unknown as databaseTypes.IModelConfig
      );
      modelConfigId = modelConfigDocument._id as unknown as mongooseTypes.ObjectId;



    });

    after(async () => {
      if (modelConfigId) {
        await modelConfigModel.findByIdAndDelete(modelConfigId);
      }
    });

    it('will retreive our modelConfig from the database', async () => {
      const modelConfig = await modelConfigService.getModelConfig(modelConfigId);
      assert.isOk(modelConfig);
    });

    // updates and deletes
    it('will update our modelConfig', async () => {
      assert.isOk(modelConfigId);
      const updatedModelConfig = await modelConfigService.updateModelConfig(modelConfigId, {
        deletedAt: new Date()
      });
      assert.isOk(updatedModelConfig.deletedAt);

      const savedModelConfig = await modelConfigService.getModelConfig(modelConfigId);

      assert.isOk(savedModelConfig!.deletedAt);
    });
  });
});

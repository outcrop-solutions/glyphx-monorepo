// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_STATE} from '../mocks';
import {stateService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_STATE);

describe('#StateService', () => {
  context('test the functions of the state service', () => {
    const mongoConnection = new MongoDbConnection();
    const stateModel = mongoConnection.models.StateModel;
    let stateId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const stateDocument = await stateModel.createState(
        MOCK_STATE as unknown as databaseTypes.IState
      );

      stateId = stateDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (stateId) {
        await stateModel.findByIdAndDelete(stateId);
      }
    });

    it('will retreive our state from the database', async () => {
      const state = await stateService.getState(stateId);
      assert.isOk(state);

      assert.strictEqual(state?.name, MOCK_STATE.name);
    });

    it('will update our state', async () => {
      assert.isOk(stateId);
      const updatedState = await stateService.updateState(stateId, {
        [propKeys]: generateDataFromType(MOCK),
      });
      assert.strictEqual(updatedState.name, INPUT_PROJECT_NAME);

      const savedState = await stateService.getState(stateId);

      assert.strictEqual(savedState?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our state', async () => {
      assert.isOk(stateId);
      const updatedState = await stateService.deleteState(stateId);
      assert.strictEqual(updatedState[propKeys[0]], propKeys[0]);

      const savedState = await stateService.getState(stateId);

      assert.isOk(savedState?.deletedAt);
    });
  });
});

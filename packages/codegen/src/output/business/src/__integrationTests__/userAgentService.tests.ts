// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks'
import { userAgentService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_USERAGENT)

describe('#UserAgentService', () => {
  context('test the functions of the userAgent service', () => {
    const mongoConnection = new MongoDbConnection();
    const userAgentModel = mongoConnection.models.UserAgentModel;
    let userAgentId: ObjectId;


    before(async () => {
      await mongoConnection.init();

      const userAgentDocument = await userAgentModel.createUserAgent(
        // @ts-ignore
        mocks.MOCK_USERAGENT as unknown as databaseTypes.IUserAgent
      );
      userAgentId = userAgentDocument._id as unknown as mongooseTypes.ObjectId;


    });

    after(async () => {
      if (userAgentId) {
        await userAgentModel.findByIdAndDelete(userAgentId);
      }
    });

    it('will retreive our userAgent from the database', async () => {
      const userAgent = await userAgentService.getUserAgent(userAgentId);
      assert.isOk(userAgent);
    });

    // updates and deletes
    it('will update our userAgent', async () => {
      assert.isOk(userAgentId);
      const updatedUserAgent = await userAgentService.updateUserAgent(userAgentId, {
        deletedAt: new Date()
      });
      assert.isOk(updatedUserAgent.deletedAt);

      const savedUserAgent = await userAgentService.getUserAgent(userAgentId);

      assert.isOk(savedUserAgent!.deletedAt);
    });
  });
});

// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_USERAGENT} from '../mocks';
import {userAgentService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_USERAGENT);

describe('#UserAgentService', () => {
  context('test the functions of the userAgent service', () => {
    const mongoConnection = new MongoDbConnection();
    const userAgentModel = mongoConnection.models.UserAgentModel;
    let userAgentId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const userAgentDocument = await userAgentModel.createUserAgent(
        MOCK_USERAGENT as unknown as databaseTypes.IUserAgent
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

      assert.strictEqual(userAgent?.name, MOCK_USERAGENT.name);
    });

    it('will update our userAgent', async () => {
      assert.isOk(userAgentId);
      const updatedUserAgent = await userAgentService.updateUserAgent(
        userAgentId,
        {
          [propKeys]: generateDataFromType(MOCK),
        }
      );
      assert.strictEqual(updatedUserAgent.name, INPUT_PROJECT_NAME);

      const savedUserAgent = await userAgentService.getUserAgent(userAgentId);

      assert.strictEqual(savedUserAgent?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our userAgent', async () => {
      assert.isOk(userAgentId);
      const updatedUserAgent = await userAgentService.deleteUserAgent(
        userAgentId
      );
      assert.strictEqual(updatedUserAgent[propKeys[0]], propKeys[0]);

      const savedUserAgent = await userAgentService.getUserAgent(userAgentId);

      assert.isOk(savedUserAgent?.deletedAt);
    });
  });
});

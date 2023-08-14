// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_USER} from '../mocks';
import {userService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_USER);

describe('#UserService', () => {
  context('test the functions of the user service', () => {
    const mongoConnection = new MongoDbConnection();
    const userModel = mongoConnection.models.UserModel;
    let userId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const userDocument = await userModel.createUser(
        MOCK_USER as unknown as databaseTypes.IUser
      );

      userId = userDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (userId) {
        await userModel.findByIdAndDelete(userId);
      }
    });

    it('will retreive our user from the database', async () => {
      const user = await userService.getUser(userId);
      assert.isOk(user);

      assert.strictEqual(user?.name, MOCK_USER.name);
    });

    it('will update our user', async () => {
      assert.isOk(userId);
      const updatedUser = await userService.updateUser(userId, {
        [propKeys]: generateDataFromType(MOCK),
      });
      assert.strictEqual(updatedUser.name, INPUT_PROJECT_NAME);

      const savedUser = await userService.getUser(userId);

      assert.strictEqual(savedUser?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our user', async () => {
      assert.isOk(userId);
      const updatedUser = await userService.deleteUser(userId);
      assert.strictEqual(updatedUser[propKeys[0]], propKeys[0]);

      const savedUser = await userService.getUser(userId);

      assert.isOk(savedUser?.deletedAt);
    });
  });
});

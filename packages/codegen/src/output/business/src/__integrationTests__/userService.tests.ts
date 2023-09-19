// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks'
import { userService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_USER)

describe('#UserService', () => {
  context('test the functions of the user service', () => {
    const mongoConnection = new MongoDbConnection();
    const userModel = mongoConnection.models.UserModel;
    let userId: ObjectId;

    const customerPaymentModel = mongoConnection.models.CustomerPaymentModel;
    let customerPaymentId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const userDocument = await userModel.createUser(
        // @ts-ignore
        mocks.MOCK_USER as unknown as databaseTypes.IUser
      );
      userId = userDocument._id as unknown as mongooseTypes.ObjectId;



      const savedCustomerPaymentDocument = await customerPaymentModel.create([mocks.MOCK_CUSTOMERPAYMENT], {
        validateBeforeSave: false,
      });
      customerPaymentId =  savedCustomerPaymentDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(customerPaymentId)

    });

    after(async () => {
      if (userId) {
        await userModel.findByIdAndDelete(userId);
      }
       if (customerPaymentId) {
        await customerPaymentModel.findByIdAndDelete(customerPaymentId);
      }
    });

    it('will retreive our user from the database', async () => {
      const user = await userService.getUser(userId);
      assert.isOk(user);
    });

    // updates and deletes
    it('will update our user', async () => {
      assert.isOk(userId);
      const updatedUser = await userService.updateUser(userId, {
        deletedAt: new Date()
      });
      assert.isOk(updatedUser.deletedAt);

      const savedUser = await userService.getUser(userId);

      assert.isOk(savedUser!.deletedAt);
    });
  });
});

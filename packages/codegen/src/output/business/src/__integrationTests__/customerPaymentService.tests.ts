// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from 'database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import * as mocks from 'database/src/mongoose/mocks'
import { customerPaymentService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(mocks.MOCK_CUSTOMERPAYMENT)

describe('#CustomerPaymentService', () => {
  context('test the functions of the customerPayment service', () => {
    const mongoConnection = new MongoDbConnection();
    const customerPaymentModel = mongoConnection.models.CustomerPaymentModel;
    let customerPaymentId: ObjectId;

    const customerModel = mongoConnection.models.UserModel;
    let customerId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const customerPaymentDocument = await customerPaymentModel.createCustomerPayment(
        // @ts-ignore
        mocks.MOCK_CUSTOMERPAYMENT as unknown as databaseTypes.ICustomerPayment
      );
      customerPaymentId = customerPaymentDocument._id as unknown as mongooseTypes.ObjectId;




      const savedCustomerDocument = await customerModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      customerId =  savedCustomerDocument[0]?._id as mongooseTypes.ObjectId;
      assert.isOk(customerId)

    });

    after(async () => {
      if (customerPaymentId) {
        await customerPaymentModel.findByIdAndDelete(customerPaymentId);
      }
       if (customerId) {
        await customerModel.findByIdAndDelete(customerId);
      }
    });

    it('will retreive our customerPayment from the database', async () => {
      const customerPayment = await customerPaymentService.getCustomerPayment(customerPaymentId);
      assert.isOk(customerPayment);
    });

    // updates and deletes
    it('will update our customerPayment', async () => {
      assert.isOk(customerPaymentId);
      const updatedCustomerPayment = await customerPaymentService.updateCustomerPayment(customerPaymentId, {
        deletedAt: new Date()
      });
      assert.isOk(updatedCustomerPayment.deletedAt);

      const savedCustomerPayment = await customerPaymentService.getCustomerPayment(customerPaymentId);

      assert.isOk(savedCustomerPayment!.deletedAt);
    });
  });
});

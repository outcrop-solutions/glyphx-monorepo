// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {MongoDbConnection} from '@glyphx/database';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {database as databaseTypes} from '@glyphx/types';
import {MOCK_CUSTOMERPAYMENT} from '../mocks';
import {customerPaymentService} from '../services';

type ObjectId = mongooseTypes.ObjectId;

const propKeys = Object.keys(MOCK_CUSTOMERPAYMENT);

describe('#CustomerPaymentService', () => {
  context('test the functions of the customerPayment service', () => {
    const mongoConnection = new MongoDbConnection();
    const customerPaymentModel = mongoConnection.models.CustomerPaymentModel;
    let customerPaymentId: ObjectId;

    before(async () => {
      await mongoConnection.init();

      const customerPaymentDocument =
        await customerPaymentModel.createCustomerPayment(
          MOCK_CUSTOMERPAYMENT as unknown as databaseTypes.ICustomerPayment
        );

      customerPaymentId =
        customerPaymentDocument._id as unknown as mongooseTypes.ObjectId;
    });

    after(async () => {
      if (customerPaymentId) {
        await customerPaymentModel.findByIdAndDelete(customerPaymentId);
      }
    });

    it('will retreive our customerPayment from the database', async () => {
      const customerPayment = await customerPaymentService.getCustomerPayment(
        customerPaymentId
      );
      assert.isOk(customerPayment);

      assert.strictEqual(customerPayment?.name, MOCK_CUSTOMERPAYMENT.name);
    });

    it('will update our customerPayment', async () => {
      assert.isOk(customerPaymentId);
      const updatedCustomerPayment =
        await customerPaymentService.updateCustomerPayment(customerPaymentId, {
          [propKeys]: generateDataFromType(MOCK),
        });
      assert.strictEqual(updatedCustomerPayment.name, INPUT_PROJECT_NAME);

      const savedCustomerPayment =
        await customerPaymentService.getCustomerPayment(customerPaymentId);

      assert.strictEqual(savedCustomerPayment?.name, INPUT_PROJECT_NAME);
    });

    it('will delete our customerPayment', async () => {
      assert.isOk(customerPaymentId);
      const updatedCustomerPayment =
        await customerPaymentService.deleteCustomerPayment(customerPaymentId);
      assert.strictEqual(updatedCustomerPayment[propKeys[0]], propKeys[0]);

      const savedCustomerPayment =
        await customerPaymentService.getCustomerPayment(customerPaymentId);

      assert.isOk(savedCustomerPayment?.deletedAt);
    });
  });
});

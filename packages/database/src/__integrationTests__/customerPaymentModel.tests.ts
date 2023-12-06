// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import * as mocks from '../mongoose/mocks'
import {assert} from 'chai';
import {MongoDbConnection} from '../mongoose';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {error} from 'core';

type ObjectId = mongooseTypes.ObjectId;

const UNIQUE_KEY = v4().replaceAll('-', '');

describe('#CustomerPaymentModel', () => {
  context('test the crud functions of the customerPayment model', () => {
    const mongoConnection = new MongoDbConnection();
    const customerPaymentModel = mongoConnection.models.CustomerPaymentModel;
    let customerPaymentDocId: string;
    let customerPaymentDocId2: string;
    let customerId: string;
    let customerDocument: any;

    before(async () => {
      await mongoConnection.init();
      const customerModel = mongoConnection.models.UserModel;
      const savedCustomerDocument = await customerModel.create([mocks.MOCK_USER], {
        validateBeforeSave: false,
      });
      customerId =  savedCustomerDocument[0]!._id.toString();
      assert.isOk(customerId)
    });

    after(async () => {
      if (customerPaymentDocId) {
        await customerPaymentModel.findByIdAndDelete(customerPaymentDocId);
      }

      if (customerPaymentDocId2) {
        await customerPaymentModel.findByIdAndDelete(customerPaymentDocId2);
      }
      const customerModel = mongoConnection.models.UserModel;
      await customerModel.findByIdAndDelete(customerId);

    });

    it('add a new customerPayment ', async () => {
      const customerPaymentInput = JSON.parse(JSON.stringify(mocks.MOCK_CUSTOMERPAYMENT));

      customerPaymentInput.customer = customerDocument;

      const customerPaymentDocument = await customerPaymentModel.createCustomerPayment(customerPaymentInput);

      assert.isOk(customerPaymentDocument);
      assert.strictEqual(Object.keys(customerPaymentDocument)[1], Object.keys(customerPaymentInput)[1]);


      customerPaymentDocId = customerPaymentDocument._id!.toString();
    });

    it('retreive a customerPayment', async () => {
      assert.isOk(customerPaymentDocId);
      const customerPayment = await customerPaymentModel.getCustomerPaymentById(customerPaymentDocId);

      assert.isOk(customerPayment);
      assert.strictEqual(customerPayment._id?.toString(), customerPaymentDocId.toString());
    });

    it('modify a customerPayment', async () => {
      assert.isOk(customerPaymentDocId);
      const input = {deletedAt: new Date()};
      const updatedDocument = await customerPaymentModel.updateCustomerPaymentById(
        customerPaymentDocId,
        input
      );
      assert.isOk(updatedDocument.deletedAt);
    });

    it('Get multiple customerPayments without a filter', async () => {
      assert.isOk(customerPaymentDocId);
      const customerPaymentInput = JSON.parse(JSON.stringify(mocks.MOCK_CUSTOMERPAYMENT));



      const customerPaymentDocument = await customerPaymentModel.createCustomerPayment(customerPaymentInput);

      assert.isOk(customerPaymentDocument);

      customerPaymentDocId2 = customerPaymentDocument._id!.toString();

      const customerPayments = await customerPaymentModel.queryCustomerPayments();
      assert.isArray(customerPayments.results);
      assert.isAtLeast(customerPayments.numberOfItems, 2);
      const expectedDocumentCount =
        customerPayments.numberOfItems <= customerPayments.itemsPerPage
          ? customerPayments.numberOfItems
          : customerPayments.itemsPerPage;
      assert.strictEqual(customerPayments.results.length, expectedDocumentCount);
    });

    it('Get multiple customerPayments with a filter', async () => {
      assert.isOk(customerPaymentDocId2);
      const results = await customerPaymentModel.queryCustomerPayments({
        deletedAt: undefined,
      });
      assert.strictEqual(results.results.length, 1);
      assert.isUndefined(results.results[0]?.deletedAt);
    });

    it('page accounts', async () => {
      assert.isOk(customerPaymentDocId2);
      const results = await customerPaymentModel.queryCustomerPayments({}, 0, 1);
      assert.strictEqual(results.results.length, 1);

      const lastId = results.results[0]?._id;

      const results2 = await customerPaymentModel.queryCustomerPayments({}, 1, 1);
      assert.strictEqual(results2.results.length, 1);

      assert.notStrictEqual(
        results2.results[0]?._id?.toString(),
        lastId?.toString()
      );
    });

    it('remove a customerPayment', async () => {
      assert.isOk(customerPaymentDocId);
      await customerPaymentModel.deleteCustomerPaymentById(customerPaymentDocId.toString());
      let errored = false;
      try {
        await customerPaymentModel.getCustomerPaymentById(customerPaymentDocId.toString());
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
      customerPaymentDocId = null as unknown as string;
    });
  });
});

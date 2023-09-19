// THIS CODE WAS AUTOMATICALLY GENERATED
import {assert} from 'chai';
import { CustomerPaymentModel} from '../../../mongoose/models/customerPayment'
import * as mocks from '../../../mongoose/mocks';
import { UserModel} from '../../../mongoose/models/user'
import {IQueryResult, databaseTypes} from 'types'
import {error} from 'core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

describe('#mongoose/models/customerPayment', () => {
  context('customerPaymentIdExists', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true if the customerPaymentId exists', async () => {
      const customerPaymentId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves({_id: customerPaymentId});
      sandbox.replace(CustomerPaymentModel, 'findById', findByIdStub);

      const result = await CustomerPaymentModel.customerPaymentIdExists(customerPaymentId);

      assert.isTrue(result);
    });

    it('should return false if the customerPaymentId does not exist', async () => {
      const customerPaymentId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(CustomerPaymentModel, 'findById', findByIdStub);

      const result = await CustomerPaymentModel.customerPaymentIdExists(customerPaymentId);

      assert.isFalse(result);
    });

    it('will throw a DatabaseOperationError when the underlying database connection errors', async () => {
      const customerPaymentId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.rejects('something unexpected has happend');
      sandbox.replace(CustomerPaymentModel, 'findById', findByIdStub);

      let errorred = false;
      try {
        await CustomerPaymentModel.customerPaymentIdExists(customerPaymentId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('allCustomerPaymentIdsExist', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should return true when all the customerPayment ids exist', async () => {
      const customerPaymentIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedCustomerPaymentIds = customerPaymentIds.map(customerPaymentId => {
        return {
          _id: customerPaymentId,
        };
      });

      const findStub = sandbox.stub();
      findStub.resolves(returnedCustomerPaymentIds);
      sandbox.replace(CustomerPaymentModel, 'find', findStub);

      assert.isTrue(await CustomerPaymentModel.allCustomerPaymentIdsExist(customerPaymentIds));
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DataNotFoundError when one of the ids does not exist', async () => {
      const customerPaymentIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const returnedCustomerPaymentIds = [
        {
          _id: customerPaymentIds[0],
        },
      ];

      const findStub = sandbox.stub();
      findStub.resolves(returnedCustomerPaymentIds);
      sandbox.replace(CustomerPaymentModel, 'find', findStub);
      let errored = false;
      try {
        await CustomerPaymentModel.allCustomerPaymentIdsExist(customerPaymentIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DataNotFoundError);
        assert.strictEqual(
          err.data.value[0].toString(),
          customerPaymentIds[1].toString()
        );
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });

    it('should throw a DatabaseOperationError when the undelying connection errors', async () => {
      const customerPaymentIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const findStub = sandbox.stub();
      findStub.rejects('something bad has happened');
      sandbox.replace(CustomerPaymentModel, 'find', findStub);
      let errored = false;
      try {
        await CustomerPaymentModel.allCustomerPaymentIdsExist(customerPaymentIds);
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will not throw an error when no unsafe fields are present', async () => {
      const customerStub = sandbox.stub();
      customerStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        customerStub
      );

      let errored = false;

      try {
        await CustomerPaymentModel.validateUpdateObject(mocks.MOCK_CUSTOMERPAYMENT as unknown as Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });

    it('will not throw an error when the related fields exist in the database', async () => {
      const customerStub = sandbox.stub();
      customerStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        customerStub
      );

      let errored = false;

      try {
        await CustomerPaymentModel.validateUpdateObject(mocks.MOCK_CUSTOMERPAYMENT as unknown as Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>);
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
      assert.isTrue(customerStub.calledOnce);
    });

    it('will fail when the customer does not exist.', async () => {
      
      const customerStub = sandbox.stub();
      customerStub.resolves(false);
      sandbox.replace(
        UserModel,
        'userIdExists',
        customerStub
      );

      let errored = false;

      try {
        await CustomerPaymentModel.validateUpdateObject(mocks.MOCK_CUSTOMERPAYMENT as unknown as Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });


    it('will fail when trying to update the _id', async () => {
      const customerStub = sandbox.stub();
      customerStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        customerStub
      );

      let errored = false;

      try {
        await CustomerPaymentModel.validateUpdateObject({...mocks.MOCK_CUSTOMERPAYMENT, _id: new mongoose.Types.ObjectId() } as unknown as Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the createdAt', async () => {
      const customerStub = sandbox.stub();
      customerStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        customerStub
      );

      let errored = false;

      try {
        await CustomerPaymentModel.validateUpdateObject({...mocks.MOCK_CUSTOMERPAYMENT, createdAt: new Date() } as unknown as Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });

    it('will fail when trying to update the updatedAt', async () => {
      const customerStub = sandbox.stub();
      customerStub.resolves(true);
      sandbox.replace(
        UserModel,
        'userIdExists',
        customerStub
      );

      let errored = false;

      try {
        await CustomerPaymentModel.validateUpdateObject({...mocks.MOCK_CUSTOMERPAYMENT, updatedAt: new Date() }  as unknown as Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('createCustomerPayment', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create a customerPayment document', async () => {
      sandbox.replace(
        CustomerPaymentModel,
        'validateCustomer',
        sandbox.stub().resolves(mocks.MOCK_CUSTOMERPAYMENT.customer)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        CustomerPaymentModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(CustomerPaymentModel, 'validate', sandbox.stub().resolves(true));
      
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(CustomerPaymentModel, 'getCustomerPaymentById', stub);

      const customerPaymentDocument = await CustomerPaymentModel.createCustomerPayment(mocks.MOCK_CUSTOMERPAYMENT);

      assert.strictEqual(customerPaymentDocument._id, objectId);
      assert.isTrue(stub.calledOnce);
    });



    it('will rethrow a DataValidationError when the customer validator throws one', async () => {
       sandbox.replace(
        CustomerPaymentModel,
        'validateCustomer',
        sandbox
          .stub()
          .rejects(
            new error.DataValidationError(
              'The customer does not exist',
              'customer ',
              {}
            )
          )
      );
      
      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        CustomerPaymentModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );

      sandbox.replace(CustomerPaymentModel, 'validate', sandbox.stub().resolves(true));
      
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});

      sandbox.replace(CustomerPaymentModel, 'getCustomerPaymentById', stub);

      let errored = false;

      try {
        await CustomerPaymentModel.createCustomerPayment(mocks.MOCK_CUSTOMERPAYMENT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
    });


    it('will throw a DatabaseOperationError when an underlying model function errors', async () => {
      sandbox.replace(
        CustomerPaymentModel,
        'validateCustomer',
        sandbox.stub().resolves(mocks.MOCK_CUSTOMERPAYMENT.customer)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(CustomerPaymentModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(
        CustomerPaymentModel,
        'create',
        sandbox.stub().rejects('oops, something bad has happened')
      );

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(CustomerPaymentModel, 'getCustomerPaymentById', stub);
      let hasError = false;
      try {
        await CustomerPaymentModel.createCustomerPayment(mocks.MOCK_CUSTOMERPAYMENT);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will throw an Unexpected Error when create does not return an object with an _id', async () => {
      sandbox.replace(
        CustomerPaymentModel,
        'validateCustomer',
        sandbox.stub().resolves(mocks.MOCK_CUSTOMERPAYMENT.customer)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(CustomerPaymentModel, 'validate', sandbox.stub().resolves(true));
      sandbox.replace(CustomerPaymentModel, 'create', sandbox.stub().resolves([{}]));

      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(CustomerPaymentModel, 'getCustomerPaymentById', stub);

      let hasError = false;
      try {
        await CustomerPaymentModel.createCustomerPayment(mocks.MOCK_CUSTOMERPAYMENT);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });

    it('will rethrow a DataValidationError when the validate method on the model errors', async () => {
      sandbox.replace(
        CustomerPaymentModel,
        'validateCustomer',
        sandbox.stub().resolves(mocks.MOCK_CUSTOMERPAYMENT.customer)
      );

      const objectId = new mongoose.Types.ObjectId();
      sandbox.replace(
        CustomerPaymentModel,
        'validate',
        sandbox.stub().rejects('oops an error has occurred')
      );
      sandbox.replace(
        CustomerPaymentModel,
        'create',
        sandbox.stub().resolves([{_id: objectId}])
      );
      const stub = sandbox.stub();
      stub.resolves({_id: objectId});
      sandbox.replace(CustomerPaymentModel, 'getCustomerPaymentById', stub);
      let hasError = false;
      try {
        await CustomerPaymentModel.createCustomerPayment(mocks.MOCK_CUSTOMERPAYMENT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getCustomerPaymentById', () => {
    class MockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError = false) {
        this.mockData = input;
        this.throwError = throwError;
      }
      populate() {
        return this;
      }

      async lean(): Promise<any> {
        if (this.throwError) throw this.mockData;

        return this.mockData;
      }
    }

    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a customerPayment document with the related fields populated', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(mocks.MOCK_CUSTOMERPAYMENT));
      sandbox.replace(CustomerPaymentModel, 'findById', findByIdStub);

      const doc = await CustomerPaymentModel.getCustomerPaymentById(
        mocks.MOCK_CUSTOMERPAYMENT._id as mongoose.Types.ObjectId
      );

      assert.isTrue(findByIdStub.calledOnce);
      assert.isUndefined((doc as any)?.__v);
      assert.isUndefined((doc.customer as any)?.__v);

      assert.strictEqual(doc._id, mocks.MOCK_CUSTOMERPAYMENT._id);
    });

    it('will throw a DataNotFoundError when the customerPayment does not exist', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(new MockMongooseQuery(null));
      sandbox.replace(CustomerPaymentModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await CustomerPaymentModel.getCustomerPaymentById(
          mocks.MOCK_CUSTOMERPAYMENT._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findByIdStub = sandbox.stub();
      findByIdStub.returns(
        new MockMongooseQuery('something bad happened', true)
      );
      sandbox.replace(CustomerPaymentModel, 'findById', findByIdStub);

      let errored = false;
      try {
        await CustomerPaymentModel.getCustomerPaymentById(
          mocks.MOCK_CUSTOMERPAYMENT._id as mongoose.Types.ObjectId
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('queryCustomerPayments', () => {
    class MockMongooseQuery {
      mockData?: any;
      throwError?: boolean;
      constructor(input: any, throwError = false) {
        this.mockData = input;
        this.throwError = throwError;
      }

      populate() {
        return this;
      }

      async lean(): Promise<any> {
        if (this.throwError) throw this.mockData;

        return this.mockData;
      }
    }

    const mockCustomerPayments = [
      {
       ...mocks.MOCK_CUSTOMERPAYMENT,
        _id: new mongoose.Types.ObjectId(),
        customer: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as databaseTypes.ICustomerPayment,
      {
        ...mocks.MOCK_CUSTOMERPAYMENT,
        _id: new mongoose.Types.ObjectId(),
        customer: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as databaseTypes.ICustomerPayment,
    ];
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the filtered customerPayments', async () => {
      sandbox.replace(
        CustomerPaymentModel,
        'count',
        sandbox.stub().resolves(mockCustomerPayments.length)
      );

      sandbox.replace(
        CustomerPaymentModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockCustomerPayments))
      );

      const results = await CustomerPaymentModel.queryCustomerPayments({});

      assert.strictEqual(results.numberOfItems, mockCustomerPayments.length);
      assert.strictEqual(results.page, 0);
      assert.strictEqual(results.results.length, mockCustomerPayments.length);
      assert.isNumber(results.itemsPerPage);
      results.results.forEach((doc: any) => {
        assert.isUndefined((doc as any)?.__v);
        assert.isUndefined((doc.customer as any)?.__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(CustomerPaymentModel, 'count', sandbox.stub().resolves(0));

      sandbox.replace(
        CustomerPaymentModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockCustomerPayments))
      );

      let errored = false;
      try {
        await CustomerPaymentModel.queryCustomerPayments();
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw an InvalidArgumentError when the page number exceeds the number of available pages', async () => {
      sandbox.replace(
        CustomerPaymentModel,
        'count',
        sandbox.stub().resolves(mockCustomerPayments.length)
      );

      sandbox.replace(
        CustomerPaymentModel,
        'find',
        sandbox.stub().returns(new MockMongooseQuery(mockCustomerPayments))
      );

      let errored = false;
      try {
        await CustomerPaymentModel.queryCustomerPayments({}, 1, 10);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when the underlying database connection fails', async () => {
      sandbox.replace(
        CustomerPaymentModel,
        'count',
        sandbox.stub().resolves(mockCustomerPayments.length)
      );

      sandbox.replace(
        CustomerPaymentModel,
        'find',
        sandbox
          .stub()
          .returns(new MockMongooseQuery('something bad has happened', true))
      );

      let errored = false;
      try {
        await CustomerPaymentModel.queryCustomerPayments({});
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }

      assert.isTrue(errored);
    });
  });

  context('updateCustomerPaymentById', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('Should update a customerPayment', async () => {
      const updateCustomerPayment = {
        ...mocks.MOCK_CUSTOMERPAYMENT,
        deletedAt: new Date(),
        customer: {
          _id: new mongoose.Types.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ICustomerPayment;

      const customerPaymentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(CustomerPaymentModel, 'updateOne', updateStub);

      const getCustomerPaymentStub = sandbox.stub();
      getCustomerPaymentStub.resolves({_id: customerPaymentId});
      sandbox.replace(CustomerPaymentModel, 'getCustomerPaymentById', getCustomerPaymentStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(CustomerPaymentModel, 'validateUpdateObject', validateStub);

      const result = await CustomerPaymentModel.updateCustomerPaymentById(
        customerPaymentId,
        updateCustomerPayment
      );

      assert.strictEqual(result._id, customerPaymentId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getCustomerPaymentStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Should update a customerPayment with references as ObjectIds', async () => {
      const updateCustomerPayment = {
        ...mocks.MOCK_CUSTOMERPAYMENT,
        deletedAt: new Date()
      } as unknown as databaseTypes.ICustomerPayment;

      const customerPaymentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(CustomerPaymentModel, 'updateOne', updateStub);

      const getCustomerPaymentStub = sandbox.stub();
      getCustomerPaymentStub.resolves({_id: customerPaymentId});
      sandbox.replace(CustomerPaymentModel, 'getCustomerPaymentById', getCustomerPaymentStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(CustomerPaymentModel, 'validateUpdateObject', validateStub);

      const result = await CustomerPaymentModel.updateCustomerPaymentById(
        customerPaymentId,
        updateCustomerPayment
      );

      assert.strictEqual(result._id, customerPaymentId);
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getCustomerPaymentStub.calledOnce);
      assert.isTrue(validateStub.calledOnce);
    });

    it('Will fail when the customerPayment does not exist', async () => {
      const updateCustomerPayment = {
        ...mocks.MOCK_CUSTOMERPAYMENT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.ICustomerPayment;

      const customerPaymentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(CustomerPaymentModel, 'updateOne', updateStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(true);
      sandbox.replace(CustomerPaymentModel, 'validateUpdateObject', validateStub);

      const getCustomerPaymentStub = sandbox.stub();
      getCustomerPaymentStub.resolves({_id: customerPaymentId});
      sandbox.replace(CustomerPaymentModel, 'getCustomerPaymentById', getCustomerPaymentStub);

      let errorred = false;
      try {
        await CustomerPaymentModel.updateCustomerPaymentById(customerPaymentId, updateCustomerPayment);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when validateUpdateObject fails', async () => {
      const updateCustomerPayment = {
       ...mocks.MOCK_CUSTOMERPAYMENT,
        deletedAt: new Date(),
      } as unknown as databaseTypes.ICustomerPayment;

      const customerPaymentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(CustomerPaymentModel, 'updateOne', updateStub);

      const getCustomerPaymentStub = sandbox.stub();
      getCustomerPaymentStub.resolves({_id: customerPaymentId});
      sandbox.replace(CustomerPaymentModel, 'getCustomerPaymentById', getCustomerPaymentStub);

      const validateStub = sandbox.stub();
      validateStub.rejects(
        new error.InvalidOperationError("You can't do this", {})
      );
      sandbox.replace(CustomerPaymentModel, 'validateUpdateObject', validateStub);
      let errorred = false;
      try {
        await CustomerPaymentModel.updateCustomerPaymentById(customerPaymentId, updateCustomerPayment);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('Will fail when a database error occurs', async () => {
      const updateCustomerPayment = {
       ...mocks.MOCK_CUSTOMERPAYMENT,
        deletedAt: new Date()
      } as unknown as databaseTypes.ICustomerPayment;

      const customerPaymentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something terrible has happened');
      sandbox.replace(CustomerPaymentModel, 'updateOne', updateStub);

      const getCustomerPaymentStub = sandbox.stub();
      getCustomerPaymentStub.resolves({_id: customerPaymentId});
      sandbox.replace(CustomerPaymentModel, 'getCustomerPaymentById', getCustomerPaymentStub);

      const validateStub = sandbox.stub();
      validateStub.resolves(undefined as void);
      sandbox.replace(CustomerPaymentModel, 'validateUpdateObject', validateStub);

      let errorred = false;
      try {
        await CustomerPaymentModel.updateCustomerPaymentById(customerPaymentId, updateCustomerPayment);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('Delete a customerPayment document', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should remove a customerPayment', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 1});
      sandbox.replace(CustomerPaymentModel, 'deleteOne', deleteStub);

      const customerPaymentId = new mongoose.Types.ObjectId();

      await CustomerPaymentModel.deleteCustomerPaymentById(customerPaymentId);

      assert.isTrue(deleteStub.calledOnce);
    });

    it('should fail with an InvalidArgumentError when the customerPayment does not exist', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.resolves({deletedCount: 0});
      sandbox.replace(CustomerPaymentModel, 'deleteOne', deleteStub);

      const customerPaymentId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await CustomerPaymentModel.deleteCustomerPaymentById(customerPaymentId);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });

    it('should fail with an DatabaseOperationError when the underlying database connection throws an error', async () => {
      const deleteStub = sandbox.stub();
      deleteStub.rejects('something bad has happened');
      sandbox.replace(CustomerPaymentModel, 'deleteOne', deleteStub);

      const customerPaymentId = new mongoose.Types.ObjectId();

      let errorred = false;
      try {
        await CustomerPaymentModel.deleteCustomerPaymentById(customerPaymentId);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }

      assert.isTrue(errorred);
    });
  });

});

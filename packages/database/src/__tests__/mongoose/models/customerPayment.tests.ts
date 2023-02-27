import {assert} from 'chai';
import {CustomerPaymentModel} from '../../..//mongoose/models/customerPayment';
import {UserModel} from '../../..//mongoose/models/user';
import {database as databaseTypes} from '@glyphx/types';
import {error} from '@glyphx/core';
import mongoose from 'mongoose';
import {createSandbox} from 'sinon';

const MOCK_CUSTOMER_PAYMENT: databaseTypes.ICustomerPayment = {
  createdAt: new Date(),
  updatedAt: new Date(),
  paymentId: 'customerPaymentId',
  email: 'customerPaymentId',
  subscriptionType: databaseTypes.constants.SUBSCRIPTION_TYPE.FREE,
  customer: {_id: new mongoose.Types.ObjectId()} as databaseTypes.IUser,
};

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

      const result = await CustomerPaymentModel.customerPaymentIdExists(
        customerPaymentId
      );

      assert.isTrue(result);
    });

    it('should return false if the customerPaymentId does not exist', async () => {
      const customerPaymentId = new mongoose.Types.ObjectId();
      const findByIdStub = sandbox.stub();
      findByIdStub.resolves(null);
      sandbox.replace(CustomerPaymentModel, 'findById', findByIdStub);

      const result = await CustomerPaymentModel.customerPaymentIdExists(
        customerPaymentId
      );

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

  context('createCustomerPayment', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will create an customerPayment document', async () => {
      const customerPaymentId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(
        CustomerPaymentModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        CustomerPaymentModel,
        'create',
        sandbox.stub().resolves([{_id: customerPaymentId}])
      );

      const getCustomerPaymentByIdStub = sandbox.stub();
      getCustomerPaymentByIdStub.resolves({_id: customerPaymentId});

      sandbox.replace(
        CustomerPaymentModel,
        'getCustomerPaymentById',
        getCustomerPaymentByIdStub
      );

      const result = await CustomerPaymentModel.createCustomerPayment(
        MOCK_CUSTOMER_PAYMENT
      );
      assert.strictEqual(result._id, customerPaymentId);
      assert.isTrue(getCustomerPaymentByIdStub.calledOnce);
    });

    it('will throw an InvalidArgumentError if the user attached to the customerPayment does not exist.', async () => {
      const customerPaymentId = new mongoose.Types.ObjectId();
      sandbox.replace(
        UserModel,
        'userIdExists',
        sandbox.stub().resolves(false)
      );
      sandbox.replace(
        CustomerPaymentModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        CustomerPaymentModel,
        'create',
        sandbox.stub().resolves([{_id: customerPaymentId}])
      );

      const getCustomerPaymentByIdStub = sandbox.stub();
      getCustomerPaymentByIdStub.resolves({_id: customerPaymentId});

      sandbox.replace(
        CustomerPaymentModel,
        'getCustomerPaymentById',
        getCustomerPaymentByIdStub
      );
      let errorred = false;

      try {
        await CustomerPaymentModel.createCustomerPayment(MOCK_CUSTOMER_PAYMENT);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DataValidationError if the customerPayment cannot be validated.', async () => {
      const customerPaymentId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(
        CustomerPaymentModel,
        'validate',
        sandbox.stub().rejects('Invalid')
      );
      sandbox.replace(
        CustomerPaymentModel,
        'create',
        sandbox.stub().resolves([{_id: customerPaymentId}])
      );

      const getCustomerPaymentByIdStub = sandbox.stub();
      getCustomerPaymentByIdStub.resolves({_id: customerPaymentId});

      sandbox.replace(
        CustomerPaymentModel,
        'getCustomerPaymentById',
        getCustomerPaymentByIdStub
      );
      let errorred = false;

      try {
        await CustomerPaymentModel.createCustomerPayment(MOCK_CUSTOMER_PAYMENT);
      } catch (err) {
        assert.instanceOf(err, error.DataValidationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will throw an DatabaseOperationError if the underlying database connection throws an error.', async () => {
      const customerPaymentId = new mongoose.Types.ObjectId();
      sandbox.replace(UserModel, 'userIdExists', sandbox.stub().resolves(true));
      sandbox.replace(
        CustomerPaymentModel,
        'validate',
        sandbox.stub().resolves(true)
      );
      sandbox.replace(
        CustomerPaymentModel,
        'create',
        sandbox.stub().rejects('oops')
      );

      const getCustomerPaymentByIdStub = sandbox.stub();
      getCustomerPaymentByIdStub.resolves({_id: customerPaymentId});

      sandbox.replace(
        CustomerPaymentModel,
        'getCustomerPaymentById',
        getCustomerPaymentByIdStub
      );
      let errorred = false;

      try {
        await CustomerPaymentModel.createCustomerPayment(MOCK_CUSTOMER_PAYMENT);
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('updateCustomerPaymentByFilter', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('should update an existing customerPayment', async () => {
      const updateCustomerPayment = {
        email: 'testmail@gmail.com',
      };
      const customerPaymentFilter = {
        email: 'testmail@gmail.com',
      };

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(CustomerPaymentModel, 'updateOne', updateStub);

      await CustomerPaymentModel.updateCustomerPaymentWithFilter(
        {customerPaymentFilter},
        updateCustomerPayment
      );

      assert.isTrue(updateStub.calledOnce);
      // assert.isTrue(getCustomerPaymentStub.calledOnce);
    });

    it('should update an existing customerPayment changing the customer', async () => {
      const updateCustomerPayment = {
        email: 'testmail@gmail.com',
        customer: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };

      const updateCustomerPaymentFilter = {
        email: 'test@gmail.com',
      };

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(CustomerPaymentModel, 'updateOne', updateStub);

      const getUserStub = sandbox.stub();
      getUserStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', getUserStub);

      await CustomerPaymentModel.updateCustomerPaymentWithFilter(
        updateCustomerPaymentFilter,
        updateCustomerPayment
      );

      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(getUserStub.calledOnce);
    });

    it('will fail with DataNotFoundError when the customerPayment does not exist', async () => {
      const updateCustomerPayment = {
        email: 'testmail@gmail.com',
      };

      const customerPaymentFilter = {
        email: 'test@gmail.com',
      };

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 0});
      sandbox.replace(CustomerPaymentModel, 'updateOne', updateStub);

      let errorred = false;
      try {
        await CustomerPaymentModel.updateCustomerPaymentWithFilter(
          customerPaymentFilter,
          updateCustomerPayment
        );
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errorred = true;
      }
      assert.isTrue(updateStub.calledOnce);
      assert.isTrue(errorred);
    });

    it('will fail with an InvalidOperationError when the validateUpdateObject method fails', async () => {
      const updateCustomerPayment = {
        email: 'testmail@gmail.com',
      };

      const customerPaymentId = new mongoose.Types.ObjectId();

      sandbox.replace(
        CustomerPaymentModel,
        'validateUpdateObject',
        sandbox
          .stub()
          .rejects(new error.InvalidOperationError('you cant do that', {}))
      );

      const updateStub = sandbox.stub();
      updateStub.resolves({modifiedCount: 1});
      sandbox.replace(CustomerPaymentModel, 'updateOne', updateStub);

      let errorred = false;
      try {
        await CustomerPaymentModel.updateCustomerPaymentById(
          customerPaymentId,
          updateCustomerPayment
        );
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });

    it('will fail with a DatabaseOperationError when the underlying database connection errors', async () => {
      const updateCustomerPayment = {
        email: 'testmail@gmail.com',
      };

      const customerPaymentId = new mongoose.Types.ObjectId();

      const updateStub = sandbox.stub();
      updateStub.rejects('something really bad has happened');
      sandbox.replace(CustomerPaymentModel, 'updateOne', updateStub);

      let errorred = false;
      try {
        await CustomerPaymentModel.updateCustomerPaymentById(
          customerPaymentId,
          updateCustomerPayment
        );
      } catch (err) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
    });
  });

  context('validateUpdateObject', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return true when the object is valid', async () => {
      const inputCustomerPayment = {
        customer: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);

      await CustomerPaymentModel.validateUpdateObject(inputCustomerPayment);
      assert.isTrue(userExistsStub.calledOnce);
    });

    it('will throw an InvalidOperationError when the user does not exist', async () => {
      const inputCustomerPayment = {
        customer: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      };
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(false);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);
      let errorred = false;
      try {
        await CustomerPaymentModel.validateUpdateObject(inputCustomerPayment);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(userExistsStub.calledOnce);
    });

    it('will throw an InvalidOperationError when we attempt to supply an _id', async () => {
      const inputCustomerPayment = {
        _id: new mongoose.Types.ObjectId(),
        customer: {
          _id: new mongoose.Types.ObjectId(),
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ICustomerPayment;
      const userExistsStub = sandbox.stub();
      userExistsStub.resolves(true);
      sandbox.replace(UserModel, 'userIdExists', userExistsStub);
      let errorred = false;
      try {
        await CustomerPaymentModel.validateUpdateObject(inputCustomerPayment);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errorred = true;
      }
      assert.isTrue(errorred);
      assert.isTrue(userExistsStub.calledOnce);
    });
  });

  context('delete a customerPayment document', () => {
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

      const returnedCustomerPaymentIds = customerPaymentIds.map(
        customerPaymentId => {
          return {
            _id: customerPaymentId,
          };
        }
      );

      const findStub = sandbox.stub();
      findStub.resolves(returnedCustomerPaymentIds);
      sandbox.replace(CustomerPaymentModel, 'find', findStub);

      assert.isTrue(
        await CustomerPaymentModel.allCustomerPaymentIdsExist(
          customerPaymentIds
        )
      );
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
        await CustomerPaymentModel.allCustomerPaymentIdsExist(
          customerPaymentIds
        );
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
        await CustomerPaymentModel.allCustomerPaymentIdsExist(
          customerPaymentIds
        );
      } catch (err: any) {
        assert.instanceOf(err, error.DatabaseOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(findStub.calledOnce);
    });
  });

  context('getCustomerPaymentByFilter', () => {
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

    const mockCustomerPayment: databaseTypes.ICustomerPayment = {
      _id: new mongoose.Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentId: 'testPaymentId',
      customerId: 'tesCustomerId',
      email: 'testemail@gmail.com',
      subscriptionType: databaseTypes.constants.SUBSCRIPTION_TYPE.FREE,
      __v: 1,
      customer: {
        _id: new mongoose.Types.ObjectId(),
        name: 'test user',
        __v: 1,
      } as unknown as databaseTypes.IUser,
    } as databaseTypes.ICustomerPayment;
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will retreive a customerPayment document by filter with the customer populated', async () => {
      const findStub = sandbox.stub();
      findStub.returns(new MockMongooseQuery(mockCustomerPayment));
      sandbox.replace(CustomerPaymentModel, 'findOne', findStub);

      const doc = await CustomerPaymentModel.getCustomerPaymentByFilter({
        email: mockCustomerPayment.email,
      });

      assert.isTrue(findStub.calledOnce);
      assert.isUndefined((doc as any).__v);
      assert.isUndefined((doc.customer as any).__v);

      assert.strictEqual(doc._id, mockCustomerPayment._id);
    });
    
    it('will throw a DataNotFoundError when the customerPayment does not exist', async () => {
      const findStub = sandbox.stub();
      findStub.returns(new MockMongooseQuery(null));
      sandbox.replace(CustomerPaymentModel, 'findOne', findStub);

      let errored = false;
      try {
        await CustomerPaymentModel.getCustomerPaymentByFilter({
          email: 'testemail@gmail.com',
        });
      } catch (err) {
        assert.instanceOf(err, error.DataNotFoundError);
        errored = true;
      }

      assert.isTrue(errored);
    });

    it('will throw a DatabaseOperationError when an underlying database connection throws an error', async () => {
      const findStub = sandbox.stub();
      findStub.returns(new MockMongooseQuery('something bad happened', true));
      sandbox.replace(CustomerPaymentModel, 'findOne', findStub);

      let errored = false;
      try {
        await CustomerPaymentModel.getCustomerPaymentByFilter({
          email: 'testemail@gmail.com',
        });
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
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        paymentId: 'testPaymentId',
        customerId: 'tesCustomerId',
        email: 'testemail@gmail.com',
        subscriptionType: databaseTypes.constants.SUBSCRIPTION_TYPE.FREE,
        __v: 1,
        customer: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test user',
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as databaseTypes.ICustomerPayment,
      {
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        paymentId: 'testPaymentId2',
        customerId: 'tesCustomerId2',
        email: 'testemail2@gmail.com',
        subscriptionType: databaseTypes.constants.SUBSCRIPTION_TYPE.FREE,
        __v: 1,
        customer: {
          _id: new mongoose.Types.ObjectId(),
          name: 'test user2',
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
      results.results.forEach(doc => {
        assert.isUndefined((doc as any).__v);
        assert.isUndefined((doc.customer as any).__v);
      });
    });

    it('will throw a DataNotFoundError when no values match the filter', async () => {
      sandbox.replace(
        CustomerPaymentModel,
        'count',
        sandbox.stub().resolves(0)
      );

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
});

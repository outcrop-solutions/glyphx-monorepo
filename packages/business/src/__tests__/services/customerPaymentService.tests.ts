// THIS CODE WAS AUTOMATICALLY GENERATED
import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from 'database';
import {error} from 'core';
import { customerPaymentService} from '../../services';
import * as mocks from 'database/src/mongoose/mocks'

describe('#services/customerPayment', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();
  afterEach(() => {
    sandbox.restore();
  });
  context('createCustomerPayment', () => {
    it('will create a CustomerPayment', async () => {
      const customerPaymentId = new mongooseTypes.ObjectId();
      const idId = new mongooseTypes.ObjectId();
      const subscriptionTypeId = new mongooseTypes.ObjectId();
      const customerId = new mongooseTypes.ObjectId();

      // createCustomerPayment
      const createCustomerPaymentFromModelStub = sandbox.stub();
      createCustomerPaymentFromModelStub.resolves({
         ...mocks.MOCK_CUSTOMERPAYMENT,
        _id: new mongooseTypes.ObjectId(),
        customer: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ICustomerPayment);

      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'createCustomerPayment',
        createCustomerPaymentFromModelStub
      );

      const doc = await customerPaymentService.createCustomerPayment(
       {
         ...mocks.MOCK_CUSTOMERPAYMENT,
        _id: new mongooseTypes.ObjectId(),
        customer: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ICustomerPayment
      );

      assert.isTrue(createCustomerPaymentFromModelStub.calledOnce);
    });
    // customerPayment model fails
    it('will publish and rethrow an InvalidArgumentError when customerPayment model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidArgumentError(errMessage, '', '');

      // createCustomerPayment
      const createCustomerPaymentFromModelStub = sandbox.stub();
      createCustomerPaymentFromModelStub.rejects(err)

      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'createCustomerPayment',
        createCustomerPaymentFromModelStub
      );


      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await customerPaymentService.createCustomerPayment(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when customerPayment model throws it', async () => {
      const errMessage = 'You have an invalid argument error';
      const err = new error.InvalidOperationError(errMessage, {}, '');

      // createCustomerPayment
      const createCustomerPaymentFromModelStub = sandbox.stub();
      createCustomerPaymentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'createCustomerPayment',
        createCustomerPaymentFromModelStub
      );
      
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await customerPaymentService.createCustomerPayment(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an DataValidationError when customerPayment model throws it', async () => {
      const createCustomerPaymentFromModelStub = sandbox.stub();
      const errMessage = 'Data validation error';
      const err = new error.DataValidationError(errMessage, '', '');

      createCustomerPaymentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'createCustomerPayment',
        createCustomerPaymentFromModelStub
      );

      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DataValidationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await customerPaymentService.createCustomerPayment(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when customerPayment model throws a DataOperationError', async () => {
      const createCustomerPaymentFromModelStub = sandbox.stub();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );

      createCustomerPaymentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'createCustomerPayment',
        createCustomerPaymentFromModelStub
      );

      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await customerPaymentService.createCustomerPayment(
         {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when customerPayment model throws a UnexpectedError', async () => {
      const createCustomerPaymentFromModelStub = sandbox.stub();
      const errMessage = 'An UnexpectedError has occurred';
      const err = new error.UnexpectedError(
        errMessage,
        'mongodDb',
      );

      createCustomerPaymentFromModelStub.rejects(err);

      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'createCustomerPayment',
        createCustomerPaymentFromModelStub
      );

      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.UnexpectedError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await customerPaymentService.createCustomerPayment(
          {}
        );
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(createCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getCustomerPayment', () => {
    it('should get a customerPayment by id', async () => {
      const customerPaymentId = new mongooseTypes.ObjectId().toString();

      const getCustomerPaymentFromModelStub = sandbox.stub();
      getCustomerPaymentFromModelStub.resolves({
        _id: customerPaymentId,
      } as unknown as databaseTypes.ICustomerPayment);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'getCustomerPaymentById',
        getCustomerPaymentFromModelStub
      );

      const customerPayment = await customerPaymentService.getCustomerPayment(customerPaymentId);
      assert.isOk(customerPayment);
      assert.strictEqual(customerPayment?._id?.toString(), customerPaymentId.toString());

      assert.isTrue(getCustomerPaymentFromModelStub.calledOnce);
    });
    it('should get a customerPayment by id when id is a string', async () => {
      const customerPaymentId = new mongooseTypes.ObjectId();

      const getCustomerPaymentFromModelStub = sandbox.stub();
      getCustomerPaymentFromModelStub.resolves({
        _id: customerPaymentId,
      } as unknown as databaseTypes.ICustomerPayment);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'getCustomerPaymentById',
        getCustomerPaymentFromModelStub
      );

      const customerPayment = await customerPaymentService.getCustomerPayment(customerPaymentId.toString());
      assert.isOk(customerPayment);
      assert.strictEqual(customerPayment?._id?.toString(), customerPaymentId.toString());

      assert.isTrue(getCustomerPaymentFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the customerPayment cannot be found', async () => {
      const customerPaymentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Cannot find the psoject';
      const err = new error.DataNotFoundError(
        errMessage,
        'customerPaymentId',
        customerPaymentId
      );
      const getCustomerPaymentFromModelStub = sandbox.stub();
      getCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'getCustomerPaymentById',
        getCustomerPaymentFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const customerPayment = await customerPaymentService.getCustomerPayment(customerPaymentId);
      assert.notOk(customerPayment);

      assert.isTrue(getCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const customerPaymentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getCustomerPaymentById'
      );
      const getCustomerPaymentFromModelStub = sandbox.stub();
      getCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'getCustomerPaymentById',
        getCustomerPaymentFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await customerPaymentService.getCustomerPayment(customerPaymentId);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('getCustomerPayments', () => {
    it('should get customerPayments by filter', async () => {
      const customerPaymentId = new mongooseTypes.ObjectId();
      const customerPaymentId2 = new mongooseTypes.ObjectId();
      const customerPaymentFilter = {_id: customerPaymentId};

      const queryCustomerPaymentsFromModelStub = sandbox.stub();
      queryCustomerPaymentsFromModelStub.resolves({
        results: [
          {
         ...mocks.MOCK_CUSTOMERPAYMENT,
        _id: customerPaymentId,
        customer: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        } as unknown as databaseTypes.ICustomerPayment,
        {
         ...mocks.MOCK_CUSTOMERPAYMENT,
        _id: customerPaymentId2,
        customer: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
        } as unknown as databaseTypes.ICustomerPayment
        ],
      } as unknown as databaseTypes.ICustomerPayment[]);

      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'queryCustomerPayments',
        queryCustomerPaymentsFromModelStub
      );

      const customerPayments = await customerPaymentService.getCustomerPayments(customerPaymentFilter);
      assert.isOk(customerPayments![0]);
      assert.strictEqual(customerPayments![0]._id?.toString(), customerPaymentId.toString());
      assert.isTrue(queryCustomerPaymentsFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the customerPayments cannot be found', async () => {
      const customerPaymentName = 'customerPaymentName1';
      const customerPaymentFilter = {name: customerPaymentName};
      const errMessage = 'Cannot find the customerPayment';
      const err = new error.DataNotFoundError(
        errMessage,
        'name',
        customerPaymentFilter
      );
      const getCustomerPaymentFromModelStub = sandbox.stub();
      getCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'queryCustomerPayments',
        getCustomerPaymentFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const customerPayment = await customerPaymentService.getCustomerPayments(customerPaymentFilter);
      assert.notOk(customerPayment);

      assert.isTrue(getCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const customerPaymentName = 'customerPaymentName1';
      const customerPaymentFilter = {name: customerPaymentName};
      const errMessage = 'Something Bad has happened';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongoDb',
        'getCustomerPaymentByEmail'
      );
      const getCustomerPaymentFromModelStub = sandbox.stub();
      getCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'queryCustomerPayments',
        getCustomerPaymentFromModelStub
      );
      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await customerPaymentService.getCustomerPayments(customerPaymentFilter);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('updateCustomerPayment', () => {
    it('will update a customerPayment', async () => {
      const customerPaymentId = new mongooseTypes.ObjectId().toString();
      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.resolves({
         ...mocks.MOCK_CUSTOMERPAYMENT,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        customer: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ICustomerPayment);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentById',
        updateCustomerPaymentFromModelStub
      );

      const customerPayment = await customerPaymentService.updateCustomerPayment(customerPaymentId, {
        deletedAt: new Date(),
      });
      assert.isOk(customerPayment);
      assert.strictEqual(customerPayment.id, 'id');
      assert.isOk(customerPayment.deletedAt);
      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
    });
    it('will update a customerPayment when the id is a string', async () => {
     const customerPaymentId = new mongooseTypes.ObjectId();
      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.resolves({
         ...mocks.MOCK_CUSTOMERPAYMENT,
        _id: new mongooseTypes.ObjectId(),
        deletedAt: new Date(),
        customer: {
          _id: new mongooseTypes.ObjectId(),
          __v: 1,
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ICustomerPayment);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentById',
        updateCustomerPaymentFromModelStub
      );

      const customerPayment = await customerPaymentService.updateCustomerPayment(customerPaymentId.toString(), {
        deletedAt: new Date(),
      });
      assert.isOk(customerPayment);
      assert.strictEqual(customerPayment.id, 'id');
      assert.isOk(customerPayment.deletedAt);
      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when customerPayment model throws it', async () => {
      const customerPaymentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(errMessage, 'args', []);
      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentById',
        updateCustomerPaymentFromModelStub
      );

      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await customerPaymentService.updateCustomerPayment(customerPaymentId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });

    it('will publish and rethrow an InvalidOperationError when customerPayment model throws it ', async () => {
      const customerPaymentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentById',
        updateCustomerPaymentFromModelStub
      );

      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.InvalidOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await customerPaymentService.updateCustomerPayment(customerPaymentId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when customerPayment model throws a DataOperationError ', async () => {
      const customerPaymentId = new mongooseTypes.ObjectId().toString();
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );
      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentById',
        updateCustomerPaymentFromModelStub
      );

      function fakePublish() {
        
        //@ts-ignore
        assert.instanceOf(this, error.DatabaseOperationError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      let errored = false;
      try {
        await customerPaymentService.updateCustomerPayment(customerPaymentId, {deletedAt: new Date()});
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
});

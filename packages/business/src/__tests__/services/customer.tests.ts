import 'mocha';
import {assert} from 'chai';
import Stripe from 'stripe';
import {StripeClient} from 'lib/stripe';
import {createSandbox} from 'sinon';
import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {MongoDbConnection} from '@glyphx/database';
import {error} from '@glyphx/core';
import {customerPaymentService} from '../../services';

describe('#services/customer', () => {
  const sandbox = createSandbox();
  const dbConnection = new MongoDbConnection();

  afterEach(() => {
    sandbox.restore();
  });

  context('getPayment', () => {
    it('should get a customerPayment by email', async () => {
      const customerPaymentId = new mongooseTypes.ObjectId();
      const customerPaymentEmail = 'testemail@gmail.com';

      const getCustomerPaymentFromModelStub = sandbox.stub();
      getCustomerPaymentFromModelStub.resolves({
        _id: customerPaymentId,
        email: customerPaymentEmail,
      } as unknown as databaseTypes.ICustomerPayment);

      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'getCustomerPaymentByEmail',
        getCustomerPaymentFromModelStub
      );

      const customerPayment = await customerPaymentService.getPayment(
        customerPaymentEmail
      );
      assert.isOk(customerPayment);
      assert.strictEqual(
        customerPayment?.email?.toString(),
        customerPaymentEmail.toString()
      );

      assert.isTrue(getCustomerPaymentFromModelStub.calledOnce);
    });
    it('will log the failure and return null if the customerPayment cannot be found', async () => {
      const email = 'testemail@gmail.com';
      const errMessage = 'Cannot find the customerPayment';
      const err = new error.DataNotFoundError(errMessage, 'email', email);
      const getCustomerPaymentFromModelStub = sandbox.stub();
      getCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'getCustomerPaymentByEmail',
        getCustomerPaymentFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.instanceOf(this, error.DataNotFoundError);
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const customerPayment = await customerPaymentService.getPayment(email);
      assert.notOk(customerPayment);

      assert.isTrue(getCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will log the failure and throw a DatabaseService when the underlying model call fails', async () => {
      const email = 'testemail@gmail.com';
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
        'getCustomerPaymentByEmail',
        getCustomerPaymentFromModelStub
      );
      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
        await customerPaymentService.getPayment(email);
      } catch (e) {
        assert.instanceOf(e, error.DataServiceError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
  });
  context('createPaymentAccount', () => {
    it('will createCustomerPayment with user associated as customer', async () => {
      const customerPaymentId = new mongooseTypes.ObjectId();
      const customerPaymentEmail = 'testemail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const stripeId = new mongooseTypes.ObjectId();

      const createStub = sandbox.stub();
      createStub.resolves({id: customerPaymentId});

      StripeClient.stripe = {
        customers: {
          create: createStub,
        },
      };

      const createCustomerStub = sandbox.stub();
      createCustomerStub.resolves({id: stripeId});
      sandbox.replace(
        (Stripe as any).resources.Customers.prototype,
        'create',
        createCustomerStub
      );

      const createCustomerPaymentFromModelStub = sandbox.stub();
      createCustomerPaymentFromModelStub.resolves({
        _id: customerPaymentId,
        email: customerPaymentEmail,
      } as unknown as databaseTypes.ICustomerPayment);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'createCustomerPayment',
        createCustomerPaymentFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        customerPayment: {_id: customerPaymentId, email: customerPaymentEmail},
      } as unknown as databaseTypes.IUser);
      sandbox.replace(
        dbConnection.models.UserModel,
        'updateUserById',
        updateUserStub
      );

      const updateCustomerPaymentStub = sandbox.stub();
      updateCustomerPaymentStub.resolves({
        _id: customerPaymentId,
        email: customerPaymentEmail,
        customer: {
          _id: userId,
          customerPayment: {_id: customerPaymentId},
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ICustomerPayment);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentById',
        updateCustomerPaymentStub
      );

      const doc = await customerPaymentService.createPaymentAccount(
        customerPaymentEmail,
        userId
      );

      assert.isTrue(createCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(updateCustomerPaymentStub.calledOnce);
      assert.isOk(doc.customer.customerPayment);
      assert.strictEqual(doc?.customer._id, userId);
    });
    it('will createCustomerPayment with user associated as customer when customerId is a string', async () => {
      const customerPaymentId = new mongooseTypes.ObjectId();
      const customerPaymentEmail = 'testemail@gmail.com';
      const userId = new mongooseTypes.ObjectId();
      const stripeId = new mongooseTypes.ObjectId();

      const createStub = sandbox.stub();
      createStub.resolves({id: customerPaymentId});

      StripeClient.stripe = {
        customers: {
          create: createStub,
        },
      };

      const createCustomerStub = sandbox.stub();
      createCustomerStub.resolves({id: stripeId});
      sandbox.replace(
        (Stripe as any).resources.Customers.prototype,
        'create',
        createCustomerStub
      );

      const createCustomerPaymentFromModelStub = sandbox.stub();
      createCustomerPaymentFromModelStub.resolves({
        _id: customerPaymentId,
        email: customerPaymentEmail,
      } as unknown as databaseTypes.ICustomerPayment);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'createCustomerPayment',
        createCustomerPaymentFromModelStub
      );

      const updateUserStub = sandbox.stub();
      updateUserStub.resolves({
        _id: userId,
        customerPayment: {_id: customerPaymentId, email: customerPaymentEmail},
      } as unknown as databaseTypes.IUser);
      sandbox.replace(
        dbConnection.models.UserModel,
        'updateUserById',
        updateUserStub
      );

      const updateCustomerPaymentStub = sandbox.stub();
      updateCustomerPaymentStub.resolves({
        _id: customerPaymentId,
        email: customerPaymentEmail,
        customer: {
          _id: userId,
          customerPayment: {_id: customerPaymentId},
        } as unknown as databaseTypes.IUser,
      } as unknown as databaseTypes.ICustomerPayment);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentById',
        updateCustomerPaymentStub
      );

      const doc = await customerPaymentService.createPaymentAccount(
        customerPaymentEmail,
        userId.toString()
      );

      assert.isTrue(createCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(updateUserStub.calledOnce);
      assert.isTrue(updateCustomerPaymentStub.calledOnce);
      assert.isOk(doc.customer.customerPayment);
      assert.strictEqual(doc?.customer._id, userId);
    });
    it('will publish and rethrow an InvalidArgumentError when customerPayment model throws it ', async () => {
      const customerPaymentId = 'customerPaymentId';
      const customerPaymentEmail = 'testemail@gmail.com';
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(
        errMessage,
        'emailVerified',
        true
      );
      const createCustomerPaymentFromModelStub = sandbox.stub();
      createCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'createCustomerPayment',
        createCustomerPaymentFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
        await customerPaymentService.createPaymentAccount(
          customerPaymentId,
          customerPaymentEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(createCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow a DataValidationError when customerPayment model throws it ', async () => {
      const customerPaymentId = 'customerPaymentId';
      const customerPaymentEmail = 'testemail@gmail.com';
      const errMessage = 'You have an invalid argument';
      const err = new error.DataValidationError(errMessage, '', '');
      const createCustomerPaymentFromModelStub = sandbox.stub();
      createCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'createCustomerPayment',
        createCustomerPaymentFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
        await customerPaymentService.createPaymentAccount(
          customerPaymentId,
          customerPaymentEmail
        );
      } catch (e) {
        assert.instanceOf(e, error.DataValidationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(createCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when customerPayment model throws a DataOperationError ', async () => {
      const customerPaymentId = 'customerPaymentId';
      const customerPaymentEmail = 'testemail@gmail.com';
      const errMessage = 'A DataOperationError has occurred';
      const err = new error.DatabaseOperationError(
        errMessage,
        'mongodDb',
        'updateCustomerPaymentById'
      );
      const createCustomerPaymentFromModelStub = sandbox.stub();
      createCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'createCustomerPayment',
        createCustomerPaymentFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
        await customerPaymentService.createPaymentAccount(
          customerPaymentId,
          customerPaymentEmail
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
  context('updateSubscription', () => {
    it('will update a customerPayment subscription', async () => {
      const customerId = 'testCustomerId'; //comes from stripe
      const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.resolves();

      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      await customerPaymentService.updateSubscription(customerId, subscription);
      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
    });
    it('will publish and rethrow an InvalidArgumentError when customerPayment model throws it ', async () => {
      const customerId = 'testCustomerId'; //comes from stripe
      const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
      const errMessage = 'You have an invalid argument';
      const err = new error.InvalidArgumentError(
        errMessage,
        'emailVerified',
        true
      );
      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
        await customerPaymentService.updateSubscription(
          customerId,
          subscription
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and rethrow an InvalidOperationError when customerPayment model throws it ', async () => {
      const customerId = 'testCustomerId'; //comes from stripe
      const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
      const errMessage = 'You tried to perform an invalid operation';
      const err = new error.InvalidOperationError(errMessage, {});
      const updateCustomerPaymentFromModelStub = sandbox.stub();
      updateCustomerPaymentFromModelStub.rejects(err);
      sandbox.replace(
        dbConnection.models.CustomerPaymentModel,
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
        await customerPaymentService.updateSubscription(
          customerId,
          subscription
        );
      } catch (e) {
        assert.instanceOf(e, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);

      assert.isTrue(updateCustomerPaymentFromModelStub.calledOnce);
      assert.isTrue(publishOverride.calledOnce);
    });
    it('will publish and throw an DataServiceError when customerPayment model throws a DataOperationError ', async () => {
      const customerId = 'testCustomerId'; //comes from stripe
      const subscription = databaseTypes.constants.SUBSCRIPTION_TYPE.PREMIUM;
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
        'updateCustomerPaymentWithFilter',
        updateCustomerPaymentFromModelStub
      );

      function fakePublish() {
        /*eslint-disable  @typescript-eslint/ban-ts-comment */
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
        await customerPaymentService.updateSubscription(
          customerId,
          subscription
        );
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

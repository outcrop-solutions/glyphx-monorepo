import {StripeClient} from 'lib/stripe';
import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from 'lib/databaseConnection';

export class CustomerPaymentService {
  public static async getPayment(
    email: string
  ): Promise<databaseTypes.ICustomerPayment | null> {
    try {
      const customerPayment =
        await mongoDbConnection.models.CustomerPaymentModel.getCustomerPaymentByEmail(
          email
        );
      return customerPayment;
    } catch (err) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the customerPayment. See the inner error for additional details',
          'customerPayment',
          'getCustomerPayment',
          {email},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createPaymentAccount(
    email: string,
    customerId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.ICustomerPayment> {
    try {
      // create customer payment
      // add to the user
      // add user to the customerpayment
      const paymentAccount = await StripeClient.createCustomer(email);
      const input = {
        email,
        paymentId: paymentAccount.id,
      } as Omit<databaseTypes.ICustomerPayment, '_id'>;

      // create customer
      const customerPayment =
        await mongoDbConnection.models.CustomerPaymentModel.createCustomerPayment(
          input
        );

      const id =
        customerId instanceof mongooseTypes.ObjectId
          ? customerId
          : new mongooseTypes.ObjectId(customerId);

      // connect customer to user
      const user = await mongoDbConnection.models.UserModel.updateUserById(id, {
        customerPayment: {
          _id: customerPayment._id,
        } as unknown as databaseTypes.ICustomerPayment,
      });

      // connect user to customer
      const payment =
        await mongoDbConnection.models.CustomerPaymentModel.updateCustomerPaymentById(
          id,
          {customer: user}
        );

      return payment;
    } catch (err) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the customerPayment. See the inner error for additional details',
          'customerPayment',
          'createCustomerPayment',
          {email, customerId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateSubscription(
    customerId: string,
    subscriptionType: databaseTypes.constants.SUBSCRIPTION_TYPE
  ): Promise<void> {
    try {
      await mongoDbConnection.models.CustomerPaymentModel.updateCustomerPaymentWithFilter(
        {customerId},
        {subscriptionType}
      );
    } catch (err) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the customerPayment. See the inner error for additional details',
          'customerPayment',
          'updateCustomerPayment',
          {subscriptionType},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}

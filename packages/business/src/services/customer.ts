import {error, constants} from '@glyphx/core';
import {database as databaseTypes} from '@glyphx/types';
import {StripeClient} from '../lib/stripe';
import mongoDbConnection from '../lib/databaseConnection';
import {Types as mongooseTypes} from 'mongoose';

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
    } catch (err: any) {
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
      const id =
        customerId instanceof mongooseTypes.ObjectId
          ? customerId
          : new (mongooseTypes.ObjectId as any)(customerId);
      // create customer payment
      // add to the user
      // add user to the customerpayment
      const paymentAccount = await StripeClient.createCustomer(email);

      const input = {
        email,
        paymentId: paymentAccount.id,
        subscriptionType: databaseTypes.constants.SUBSCRIPTION_TYPE.FREE,
        customer: id,
      };

      // create customer
      const customerPayment =
        await mongoDbConnection.models.CustomerPaymentModel.createCustomerPayment(
          input
        );

      // connect customer to user
      await mongoDbConnection.models.UserModel.updateUserById(id, {
        customerPayment: {
          _id: customerPayment._id,
        } as unknown as databaseTypes.ICustomerPayment,
      });

      return customerPayment;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.DataValidationError
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
    } catch (err: any) {
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

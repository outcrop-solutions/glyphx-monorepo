import {error, constants} from 'core';
import {databaseTypes} from 'types';
import {StripeClient} from '../lib/stripe';
import mongoDbConnection from '../lib/databaseConnection';

export class CustomerPaymentService {
  public static async getPayment(email: string): Promise<databaseTypes.ICustomerPayment | null> {
    try {
      const customerPayment = await mongoDbConnection.models.CustomerPaymentModel.queryCustomerPayments({email});
      return customerPayment[0];
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

  public static async createPaymentAccount(email: string, customerId: string): Promise<databaseTypes.ICustomerPayment> {
    try {
      // create customer payment
      // add to the user
      // add user to the customerpayment
      const paymentAccount = await StripeClient.createCustomer(email);

      const input = {
        email,
        paymentId: paymentAccount.id,
        subscriptionType: databaseTypes.SUBSCRIPTION_TYPE.FREE,
        customer: customerId,
      };

      // create customer
      const customerPayment = await mongoDbConnection.models.CustomerPaymentModel.createCustomerPayment(input);

      // connect customer to user
      await mongoDbConnection.models.UserModel.updateUserById(customerId, {
        customerPayment: customerPayment,
      });

      return customerPayment;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.DataValidationError) {
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
    subscriptionType: databaseTypes.SUBSCRIPTION_TYPE
  ): Promise<void> {
    try {
      await mongoDbConnection.models.CustomerPaymentModel.updateCustomerPaymentWithFilter(
        {customerId},
        {subscriptionType}
      );
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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

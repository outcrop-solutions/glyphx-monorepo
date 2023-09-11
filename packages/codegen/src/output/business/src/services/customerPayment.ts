// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../database';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class CustomerPaymentService {
  public static async getCustomerPayment(
    customerPaymentId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.ICustomerPayment | null> {
    try {
      const id =
        customerPaymentId instanceof mongooseTypes.ObjectId
          ? customerPaymentId
          : new mongooseTypes.ObjectId(customerPaymentId);
      const customerPayment =
        await mongoDbConnection.models.CustomerPaymentModel.getCustomerPaymentById(
          id
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
          {id: customerPaymentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getCustomerPayments(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.ICustomerPayment[] | null> {
    try {
      const customerPayments =
        await mongoDbConnection.models.CustomerPaymentModel.queryCustomerPayments(
          filter
        );
      return customerPayments?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting customerPayments. See the inner error for additional details',
          'customerPayments',
          'getCustomerPayments',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createCustomerPayment(
    data: Partial<databaseTypes.ICustomerPayment>
  ): Promise<databaseTypes.ICustomerPayment> {
    try {
      // create customerPayment
      const customerPayment =
        await mongoDbConnection.models.CustomerPaymentModel.createCustomerPayment(
          data
        );

      return customerPayment;
    } catch (err: any) {
      if (
        err instanceof error.InvalidOperationError ||
        err instanceof error.InvalidArgumentError ||
        err instanceof error.DataValidationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while creating the customerPayment. See the inner error for additional details',
          'customerPayment',
          'createCustomerPayment',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateCustomerPayment(
    customerPaymentId: mongooseTypes.ObjectId | string,
    data: Partial<
      Omit<databaseTypes.ICustomerPayment, '_id' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<databaseTypes.ICustomerPayment> {
    try {
      const id =
        customerPaymentId instanceof mongooseTypes.ObjectId
          ? customerPaymentId
          : new mongooseTypes.ObjectId(customerPaymentId);
      const customerPayment =
        await mongoDbConnection.models.CustomerPaymentModel.updateCustomerPaymentById(
          id,
          {
            ...data,
          }
        );
      return customerPayment;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateCustomerPayment',
          {customerPaymentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteCustomerPayment(
    customerPaymentId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.ICustomerPayment> {
    try {
      const id =
        customerPaymentId instanceof mongooseTypes.ObjectId
          ? customerPaymentId
          : new mongooseTypes.ObjectId(customerPaymentId);
      const customerPayment =
        await mongoDbConnection.models.CustomerPaymentModel.updateCustomerPaymentById(
          id,
          {
            deletedAt: new Date(),
          }
        );
      return customerPayment;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateCustomerPayment',
          {customerPaymentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addCustomer(
    customerPaymentId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ICustomerPayment> {
    try {
      const id =
        customerPaymentId instanceof mongooseTypes.ObjectId
          ? customerPaymentId
          : new mongooseTypes.ObjectId(customerPaymentId);
      const updatedCustomerPayment =
        await mongoDbConnection.models.CustomerPaymentModel.addCustomer(
          id,
          user
        );

      return updatedCustomerPayment;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding user to the customerPayment. See the inner error for additional details',
          'customerPayment',
          'addCustomer',
          {id: customerPaymentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeCustomer(
    customerPaymentId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ICustomerPayment> {
    try {
      const id =
        customerPaymentId instanceof mongooseTypes.ObjectId
          ? customerPaymentId
          : new mongooseTypes.ObjectId(customerPaymentId);
      const updatedCustomerPayment =
        await mongoDbConnection.models.CustomerModel.removeCustomer(id, user);

      return updatedCustomerPayment;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the customerPayment. See the inner error for additional details',
          'customerPayment',
          'removeCustomer',
          {id: customerPaymentId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}

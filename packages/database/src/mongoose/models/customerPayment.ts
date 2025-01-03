import {databaseTypes, IQueryResult} from 'types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {
  ICustomerPaymentMethods,
  ICustomerPaymentStaticMethods,
  ICustomerPaymentDocument,
  ICustomerPaymentCreateInput,
} from '../interfaces';
import {error} from 'core';
import {UserModel} from './user';
import {DBFormatter} from '../../lib/format';

const SCHEMA = new Schema<ICustomerPaymentDocument, ICustomerPaymentStaticMethods, ICustomerPaymentMethods>({
  paymentId: {type: String, required: true},
  email: {type: String, required: true},
  subscriptionType: {
    type: Number,
    required: true,
    enum: databaseTypes.constants.SUBSCRIPTION_TYPE,
    default: databaseTypes.constants.SUBSCRIPTION_TYPE.FREE,
  },
  deletedAt: {type: Date, required: false},
  createdAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  updatedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  customer: {type: Schema.Types.ObjectId, required: true, ref: 'user'},
});

SCHEMA.static('customerPaymentIdExists', async (customerPaymentId: mongooseTypes.ObjectId): Promise<boolean> => {
  let retval = false;
  try {
    const result = await CUSTOMER_PAYMENT_MODEL.findById(customerPaymentId, ['_id']);
    if (result) retval = true;
  } catch (err) {
    throw new error.DatabaseOperationError(
      'an unexpected error occurred while trying to find the customerPayment.  See the inner error for additional information',
      'mongoDb',
      'customerPaymentIdExists',
      {_id: customerPaymentId},
      err
    );
  }
  return retval;
});

SCHEMA.static('allCustomerPaymentIdsExist', async (customerPaymentIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
  try {
    const notFoundIds: mongooseTypes.ObjectId[] = [];
    const foundIds = (await CUSTOMER_PAYMENT_MODEL.find({_id: {$in: customerPaymentIds}}, ['_id'])) as {
      _id: mongooseTypes.ObjectId;
    }[];

    customerPaymentIds.forEach((id) => {
      if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
    });

    if (notFoundIds.length) {
      throw new error.DataNotFoundError(
        'One or more customerPaymentIds cannot be found in the database.',
        'customerPayment._id',
        notFoundIds
      );
    }
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the customerPaymentIds.  See the inner error for additional information',
        'mongoDb',
        'allCustomerPaymentIdsExists',
        {customerPaymentIds: customerPaymentIds},
        err
      );
    }
  }
  return true;
});

SCHEMA.static('getCustomerPaymentById', async (customerPaymentId: string) => {
  return await CUSTOMER_PAYMENT_MODEL.getCustomerPaymentByFilter({
    _id: customerPaymentId,
  });
});

SCHEMA.static('getCustomerPaymentByEmail', async (email: string) => {
  return await CUSTOMER_PAYMENT_MODEL.getCustomerPaymentByFilter({
    email: email,
  });
});

SCHEMA.static('getCustomerPaymentByPaymentId', async (paymentId: string) => {
  return await CUSTOMER_PAYMENT_MODEL.getCustomerPaymentByFilter({
    paymentId: paymentId,
  });
});

SCHEMA.static('getCustomerPaymentByFilter', async (filter: Record<string, unknown>) => {
  try {
    const customerPaymentDocument = (await CUSTOMER_PAYMENT_MODEL.findOne(filter)
      .populate('customer')
      .lean()) as databaseTypes.ICustomerPayment;
    if (!customerPaymentDocument) {
      throw new error.DataNotFoundError(
        `Could not find a customerPayment with the filter: ${filter}`,
        'getCustomerPaymentByFilter',
        filter
      );
    }
    const format = new DBFormatter();
    return format.toJS(customerPaymentDocument);
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the customerPayment by filter.  See the inner error for additional information',
        'mongoDb',
        'getCustomerPaymentByFilter',
        err
      );
  }
});

SCHEMA.static('queryCustomerPayments', async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
  try {
    const count = await CUSTOMER_PAYMENT_MODEL.count(filter);

    if (!count) {
      throw new error.DataNotFoundError(
        `Could not find customerPayments with the filter: ${filter}`,
        'queryCustomerPayments',
        filter
      );
    }

    const skip = itemsPerPage * page;
    if (skip > count) {
      throw new error.InvalidArgumentError(
        `The page number supplied: ${page} exceeds the number of pages contained in the reults defined by the filter: ${Math.floor(
          count / itemsPerPage
        )}`,
        'page',
        page
      );
    }
    const paymentDocuments = (await CUSTOMER_PAYMENT_MODEL.find(filter, null, {
      skip: skip,
      limit: itemsPerPage,
    })
      .populate('customer')
      .lean()) as databaseTypes.ICustomerPayment[];

    const format = new DBFormatter();
    const formattedPayments = paymentDocuments.map((doc: any) => {
      return format.toJS(doc);
    });

    const retval: IQueryResult<databaseTypes.ICustomerPayment> = {
      results: formattedPayments as unknown as databaseTypes.ICustomerPayment[],
      numberOfItems: count,
      page: page,
      itemsPerPage: itemsPerPage,
    };

    return retval;
  } catch (err) {
    if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the customerPayments.  See the inner error for additional information',
        'mongoDb',
        'queryCustomerPayments',
        err
      );
  }
});

SCHEMA.static(
  'createCustomerPayment',
  async (input: ICustomerPaymentCreateInput): Promise<databaseTypes.ICustomerPayment> => {
    const customerId =
      typeof input.customer === 'string'
        ? new mongooseTypes.ObjectId(input.customer)
        : new mongooseTypes.ObjectId(input.customer.id);

    const userExists = await UserModel.userIdExists(customerId);

    if (!userExists)
      throw new error.InvalidArgumentError(
        `A customer with _id : ${customerId} cannot be found`,
        'customer._id',
        customerId
      );

    const createDate = new Date();

    const transformedDocument: ICustomerPaymentDocument = {
      paymentId: input.paymentId,
      email: input.email,
      createdAt: createDate,
      updatedAt: createDate,
      subscriptionType: input.subscriptionType || databaseTypes.constants.SUBSCRIPTION_TYPE.FREE,
      customer: customerId,
    };

    try {
      await CUSTOMER_PAYMENT_MODEL.validate(transformedDocument);
    } catch (err) {
      throw new error.DataValidationError(
        'An error occurred while validating the customerPayment document.  See the inner error for additional details.',
        'customerPayment',
        transformedDocument,
        err
      );
    }

    try {
      const createdDocument = (
        await CUSTOMER_PAYMENT_MODEL.create([transformedDocument], {
          validateBeforeSave: false,
        })
      )[0];
      return await CUSTOMER_PAYMENT_MODEL.getCustomerPaymentById(createdDocument._id.toString());
    } catch (err) {
      throw new error.DatabaseOperationError(
        'An unexpected error occurred wile creating the customerPayment. See the inner error for additional information',
        'mongoDb',
        'create customerPayment',
        input,
        err
      );
    }
  }
);

SCHEMA.static(
  'validateUpdateObject',
  async (customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>): Promise<void> => {
    if (customerPayment.customer?._id && !(await UserModel.userIdExists(customerPayment.customer?._id)))
      throw new error.InvalidOperationError(
        `A customer with the _id: ${customerPayment.customer._id} cannot be found`,
        {customerId: customerPayment.customer._id}
      );

    if ((customerPayment as unknown as databaseTypes.ICustomerPayment)._id)
      throw new error.InvalidOperationError("A CustomerPayment's _id is imutable and cannot be changed", {
        _id: (customerPayment as unknown as databaseTypes.ICustomerPayment)._id,
      });
  }
);

SCHEMA.static(
  'updateCustomerPaymentWithFilter',
  async (
    filter: Record<string, unknown>,
    customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<void> => {
    await CUSTOMER_PAYMENT_MODEL.validateUpdateObject(customerPayment);
    try {
      const transformedCustomerPayment: Partial<ICustomerPaymentDocument> & Record<string, any> = {};
      for (const key in customerPayment) {
        const value = (customerPayment as Record<string, any>)[key];
        if (key !== 'customer') transformedCustomerPayment[key] = value;
        else {
          //we only store the customer id in our account collection
          transformedCustomerPayment[key] = value._id;
        }
      }
      const updateResult = await CUSTOMER_PAYMENT_MODEL.updateOne(filter, transformedCustomerPayment);
      if (updateResult.modifiedCount !== 1) {
        throw new error.DataNotFoundError(
          `No customerPayment document with filter: ${filter} was found`,
          'filter',
          filter
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError || err instanceof error.InvalidOperationError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the customerPayment with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update customerPayment',
          {filter: filter, customerPayment: customerPayment},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateCustomerPaymentById',
  async (
    customerPaymentId: string,
    customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<databaseTypes.ICustomerPayment> => {
    await CUSTOMER_PAYMENT_MODEL.updateCustomerPaymentWithFilter({_id: customerPaymentId}, customerPayment);
    const retval = await CUSTOMER_PAYMENT_MODEL.getCustomerPaymentById(customerPaymentId);
    return retval;
  }
);

SCHEMA.static(
  'updateCustomerPaymentByStripeId',
  async (
    stripeId: string,
    customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<databaseTypes.ICustomerPayment> => {
    await CUSTOMER_PAYMENT_MODEL.updateCustomerPaymentWithFilter({clientId: stripeId}, customerPayment);
    const retval = await CUSTOMER_PAYMENT_MODEL.getCustomerPaymentByPaymentId(stripeId);
    return retval;
  }
);

SCHEMA.static('deleteCustomerPaymentById', async (customerPaymentId: string): Promise<void> => {
  try {
    const results = await CUSTOMER_PAYMENT_MODEL.deleteOne({
      _id: customerPaymentId,
    });
    if (results.deletedCount !== 1)
      throw new error.InvalidArgumentError(
        `An customerPayment with a _id: ${customerPaymentId} was not found in the database`,
        '_id',
        customerPaymentId
      );
  } catch (err) {
    if (err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while deleteing the customerPayment from the database. The customerPayment may still exist.  See the inner error for additional information',
        'mongoDb',
        'delete customerPayment',
        {_id: customerPaymentId},
        err
      );
  }
});

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['customerPayment'];

const CUSTOMER_PAYMENT_MODEL =
  (mongoose.models.CustomerPayment as ICustomerPaymentStaticMethods) ||
  model<ICustomerPaymentDocument, ICustomerPaymentStaticMethods>('customerPayment', SCHEMA);

export {CUSTOMER_PAYMENT_MODEL as CustomerPaymentModel};

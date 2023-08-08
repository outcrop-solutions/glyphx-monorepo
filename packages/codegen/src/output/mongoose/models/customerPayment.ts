import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {ICustomerPaymentDocument, ICustomerPaymentCreateInput, ICustomerPaymentStaticMethods, ICustomerPaymentMethods} from '../interfaces';
import { CustomerModel} from './customer'

const SCHEMA = new Schema<ICustomerPaymentDocument, ICustomerPaymentStaticMethods, ICustomerPaymentMethods>({
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
  deletedAt: {
    type: Date,
    required: true,
    default:
      //istanbul ignore next
      () => new Date(),
  },
  paymentId: {
    type: String,
    required: true,
      default: false
      },
  email: {
    type: String,
    required: false,
      default: false
      },
  subscriptionType: {
    type: String,
    required: false,
    enum: databaseTypes.constants.SubscriptionType
  },
  customer: {
    type: Schema.Types.ObjectId, 
    required: false,
    ref: 'user'
  }
})

SCHEMA.static(
  'customerPaymentIdExists',
  async (customerPaymentId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await CUSTOMERPAYMENT_MODEL.findById(customerPaymentId, ['_id']);
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
  }
);

SCHEMA.static(
  'allCustomerPaymentIdsExist',
  async (customerPaymentIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await CUSTOMERPAYMENT_MODEL.find({_id: {$in: customerPaymentIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      customerPaymentIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
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
          { customerPaymentIds: customerPaymentIds},
          err
        );
      }
    }
    return true;
  }
);

SCHEMA.static(
  'validateUpdateObject',
  async (
    customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a customerPayment with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

        if (customerPayment.customer)
          tasks.push(
            idValidator(
              customerPayment.customer._id as mongooseTypes.ObjectId,
              'Customer',
              CustomerModel.customerIdExists
            )
          );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (customerPayment.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: customerPayment.createdAt}
      );
    if (customerPayment.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: customerPayment.updatedAt}
      );
    if ((customerPayment as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The customerPayment._id is immutable and cannot be changed',
        {_id: (customerPayment as Record<string, unknown>)['_id']}
      );
  }
);

SCHEMA.static(
  'createCustomerPayment',
  async (input: ICustomerPaymentCreateInput): Promise<databaseTypes.ICustomerPayment> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [ 
        ] = await Promise.all([
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: ICustomerPaymentDocument = {
        createdAt: createDate,
        updatedAt: createDate
          ,paymentId: input.paymentId
          ,email: input.email
          ,subscriptionType: input.subscriptionType
          ,customer: input.customer
      };
      try {
        await CUSTOMERPAYMENT_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'ICustomerPaymentDocument',
          resolvedInput,
          err
        );
      }
      const customerpaymentDocument = (
        await CUSTOMERPAYMENT_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = customerpaymentDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the customerpayment.  See the inner error for additional details',
          'mongoDb',
          'addCustomerPayment',
          {},
          err
        );
      }
    }
    if (id) return await CUSTOMERPAYMENT_MODEL.getCustomerPaymentById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the customerpayment may not have been created.  I have no other information to provide.'
      );
  }
);

SCHEMA.static('getCustomerPaymentById', async (customerpaymentId: mongooseTypes.ObjectId) => {
  try {
    const customerpaymentDocument = (await CUSTOMERPAYMENT_MODEL.findById(customerpaymentId)
      .populate('subscriptionType')
      .populate('customer')
      .lean()) as databaseTypes.ICustomerPayment;
    if (!customerpaymentDocument) {
      throw new error.DataNotFoundError(
        `Could not find a customerpayment with the _id: ${ customerpaymentId}`,
        'customerpayment_id',
        customerpaymentId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (customerpaymentDocument as any)['__v'];

    delete (customerpaymentDocument as any).customer?.['__v'];

    return customerpaymentDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getCustomerPaymentById',
        err
      );
  }
});

SCHEMA.static(
  'updateCustomerPaymentWithFilter',
  async (
    filter: Record<string, unknown>,
    customerpayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<void> => {
    try {
      await CUSTOMERPAYMENT_MODEL.validateUpdateObject(customerpayment);
      const updateDate = new Date();
      const transformedObject: Partial<ICustomerPaymentDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in customerpayment) {
        const value = (customerpayment as Record<string, any>)[key];
          if (key === 'customer')
            transformedObject.customer =
              value instanceof mongooseTypes.ObjectId
                ? value
                : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await CUSTOMERPAYMENT_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No customerpayment document with filter: ${filter} was found',
          'filter',
          filter
        );
      }
    } catch (err) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      )
        throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the project with filter :${filter}.  See the inner error for additional information`,
          'mongoDb',
          'update customerpayment',
          {filter: filter, customerpayment : customerpayment },
          err
        );
    }
  }
);

SCHEMA.static(
  'queryCustomerPayments',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await CUSTOMERPAYMENT_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find customerpayments with the filter: ${filter}`,
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

      const customerpaymentDocuments = (await CUSTOMERPAYMENT_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('subscriptionType')
        .populate('customer')
        .lean()) as databaseTypes.ICustomerPayment[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      customerpaymentDocuments.forEach((doc: any) => {
      delete (doc as any)['__v'];
      delete (doc as any).customer?.['__v'];
      });

      const retval: IQueryResult<databaseTypes.ICustomerPayment> = {
        results: customerpaymentDocuments,
        numberOfItems: count,
        page: page,
        itemsPerPage: itemsPerPage,
      };

      return retval;
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while getting the customerpayments.  See the inner error for additional information',
          'mongoDb',
          'queryCustomerPayments',
          err
        );
    }
  }
);

SCHEMA.static(
  'deleteCustomerPaymentById',
  async (customerpaymentId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await CUSTOMERPAYMENT_MODEL.deleteOne({_id: customerpaymentId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A customerpayment with a _id: ${ customerpaymentId} was not found in the database`,
          '_id',
          customerpaymentId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the customerpayment from the database. The customerpayment may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete customerpayment',
          {_id: customerpaymentId},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateCustomerPaymentById',
  async (
    customerpaymentId: mongooseTypes.ObjectId,
    customerpayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<databaseTypes.ICustomerPayment> => {
    await CUSTOMERPAYMENT_MODEL.updateCustomerPaymentWithFilter({_id: customerpaymentId}, customerpayment);
    return await CUSTOMERPAYMENT_MODEL.getCustomerPaymentById(customerpaymentId);
  }
);





// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['customerpayment'];

const CUSTOMERPAYMENT_MODEL = model<ICustomerPaymentDocument, ICustomerPaymentStaticMethods>(
  'customerpayment',
  SCHEMA
);

export { CUSTOMERPAYMENT_MODEL as CustomerPaymentModel };
;

import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {ICustomerpaymentDocument, ICustomerpaymentStaticMethods, ICustomerpaymentMethods} from '../interfaces';

const SCHEMA = new Schema<ICustomerpaymentDocument, ICustomerpaymentStaticMethods, ICustomerpaymentMethods>({
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
  paymentId: { type:
  string, 
  required: false,
  
  },
  email: { type:
  string, 
  required: false,
  
  },
  subscriptionType: { type:
  SUBSCRIPTION_TYPE, 
  required: false,
  
  },
  createdAt: { type:
  Date, 
  required: false,
  
  },
  deletedAt: { type:
  Date, 
  required: false,
  
  },
  updatedAt: { type:
  Date, 
  required: false,
  
  },
  customer: { type:
  IUser, 
  required: false,
  
  },
})

SCHEMA.static(addSubscription_type: async (
    id: mongooseTypes.ObjectId,
    SUBSCRIPTION_TYPES: (databaseTypes.ISubscription_type | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIcustomerpayment> => {
    try {
      if (!SUBSCRIPTION_TYPES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'SUBSCRIPTION_TYPES',
          SUBSCRIPTION_TYPES
        );
      const document = await IcustomerpaymentModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'ICustomerPayment._id',
          id
        );

      const reconciledIds = await IcustomerpaymentModel.validateSubscription_type(SUBSCRIPTION_TYPES);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.SUBSCRIPTION_TYPES.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.SUBSCRIPTION_TYPES.push(
            p as unknown as databaseTypes.ISubscription_type
          );
        }
      });

      if (dirty) await document.save();

      return await IcustomerpaymentModel.getById(id);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding. See the inner error for additional information',
          'mongoDb',
          'ICustomerPayment.addSubscription_type',
          err
        );
      }
    }
})

SCHEMA.static(
    removeSubscription_type: async (
    id: mongooseTypes.ObjectId,
    SUBSCRIPTION_TYPES: (databaseTypes.ISubscription_type | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIcustomerpayment> => {
    try {
      if (!SUBSCRIPTION_TYPES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'SUBSCRIPTION_TYPES',
          SUBSCRIPTION_TYPES
        );
      const document = await IcustomerpaymentModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'ICustomerPayment._id',
          id
        );

      const reconciledIds = SUBSCRIPTION_TYPES.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedSubscription_type = document.SUBSCRIPTION_TYPES.filter(p => {
        let retval = true;
        if (
          reconciledIds.find(
            r =>
              r.toString() ===
              (p as unknown as mongooseTypes.ObjectId).toString()
          )
        ) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        document.SUBSCRIPTION_TYPES =
          updatedSubscription_type as unknown as databaseTypes.ISubscription_type[];
        await document.save();
      }

      return await IcustomerpaymentModel.getById(id);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'ICustomerPayment.removeSubscription_type',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateSubscription_type, 
    async (
    SUBSCRIPTION_TYPES: (databaseTypes.ISubscription_type | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const SUBSCRIPTION_TYPESIds: mongooseTypes.ObjectId[] = [];
    SUBSCRIPTION_TYPES.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) SUBSCRIPTION_TYPESIds.push(p);
      else SUBSCRIPTION_TYPESIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await Subscription_typeModel.allSubscription_typeIdsExist(SUBSCRIPTION_TYPESIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'SUBSCRIPTION_TYPES',
          SUBSCRIPTION_TYPES,
          err
        );
      else throw err;
    }

    return SUBSCRIPTION_TYPESIds;
  })
SCHEMA.static(addIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIcustomerpayment> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await IcustomerpaymentModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'ICustomerPayment._id',
          id
        );

      const reconciledIds = await IcustomerpaymentModel.validateIuser(IUsers);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.IUsers.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.IUsers.push(
            p as unknown as databaseTypes.IIuser
          );
        }
      });

      if (dirty) await document.save();

      return await IcustomerpaymentModel.getById(id);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding. See the inner error for additional information',
          'mongoDb',
          'ICustomerPayment.addIuser',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIcustomerpayment> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await IcustomerpaymentModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'ICustomerPayment._id',
          id
        );

      const reconciledIds = IUsers.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedIuser = document.IUsers.filter(p => {
        let retval = true;
        if (
          reconciledIds.find(
            r =>
              r.toString() ===
              (p as unknown as mongooseTypes.ObjectId).toString()
          )
        ) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        document.IUsers =
          updatedIuser as unknown as databaseTypes.IIuser[];
        await document.save();
      }

      return await IcustomerpaymentModel.getById(id);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing. See the inner error for additional information',
          'mongoDb',
          'ICustomerPayment.removeIuser',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateIuser, 
    async (
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const IUsersIds: mongooseTypes.ObjectId[] = [];
    IUsers.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) IUsersIds.push(p);
      else IUsersIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await IuserModel.allIuserIdsExist(IUsersIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'IUsers',
          IUsers,
          err
        );
      else throw err;
    }

    return IUsersIds;
  })


export default mongoose.model('CustomerPayment', SCHEMA);

import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IUserDocument, IUserStaticMethods, IUserMethods} from '../interfaces';

const SCHEMA = new Schema<IUserDocument, IUserStaticMethods, IUserMethods>({
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
  userCode: { type:
  string, 
  required: false,
  
  },
  name: { type:
  string, 
  required: false,
  
  },
  username: { type:
  string, 
  required: false,
  
  },
  gh_username: { type:
  string, 
  required: false,
  
  },
  email: { type:
  string, 
  required: false,
  
  },
  emailVerified: { type:
  Date, 
  required: false,
  
  },
  isVerified: { type:
  boolean, 
  required: false,
  
  },
  image: { type:
  string, 
  required: false,
  
  },
  createdAt: { type:
  Date, 
  required: false,
  
  },
  updatedAt: { type:
  Date, 
  required: false,
  
  },
  deletedAt: { type:
  Date, 
  required: false,
  
  },
  accounts: { type:
  IAccount[], 
  required: false,
  
  },
  sessions: { type:
  ISession[], 
  required: false,
  
  },
  membership: { type:
  IMember[], 
  required: false,
  
  },
  invitedMembers: { type:
  IMember[], 
  required: false,
  
  },
  createdWorkspaces: { type:
  IWorkspace[], 
  required: false,
  
  },
  projects: { type:
  IProject[], 
  required: false,
  
  },
  customerPayment: { type:
  ICustomerPayment, 
  required: false,
  
  },
  webhooks: { type:
  IWebhook[], 
  required: false,
  
  },
  apiKey: { type:
  string, 
  required: false,
  
  },
})

SCHEMA.static(addIcustomerpayment: async (
    id: mongooseTypes.ObjectId,
    ICustomerPayments: (databaseTypes.IIcustomerpayment | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIuser> => {
    try {
      if (!ICustomerPayments.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'ICustomerPayments',
          ICustomerPayments
        );
      const document = await IuserModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IUser._id',
          id
        );

      const reconciledIds = await IuserModel.validateIcustomerpayment(ICustomerPayments);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.ICustomerPayments.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.ICustomerPayments.push(
            p as unknown as databaseTypes.IIcustomerpayment
          );
        }
      });

      if (dirty) await document.save();

      return await IuserModel.getById(id);
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
          'IUser.addIcustomerpayment',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIcustomerpayment: async (
    id: mongooseTypes.ObjectId,
    ICustomerPayments: (databaseTypes.IIcustomerpayment | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIuser> => {
    try {
      if (!ICustomerPayments.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'ICustomerPayments',
          ICustomerPayments
        );
      const document = await IuserModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IUser._id',
          id
        );

      const reconciledIds = ICustomerPayments.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedIcustomerpayment = document.ICustomerPayments.filter(p => {
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
        document.ICustomerPayments =
          updatedIcustomerpayment as unknown as databaseTypes.IIcustomerpayment[];
        await document.save();
      }

      return await IuserModel.getById(id);
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
          'IUser.removeIcustomerpayment',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateIcustomerpayment, 
    async (
    ICustomerPayments: (databaseTypes.IIcustomerpayment | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const ICustomerPaymentsIds: mongooseTypes.ObjectId[] = [];
    ICustomerPayments.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) ICustomerPaymentsIds.push(p);
      else ICustomerPaymentsIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await IcustomerpaymentModel.allIcustomerpaymentIdsExist(ICustomerPaymentsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'ICustomerPayments',
          ICustomerPayments,
          err
        );
      else throw err;
    }

    return ICustomerPaymentsIds;
  })


export default mongoose.model('User', SCHEMA);

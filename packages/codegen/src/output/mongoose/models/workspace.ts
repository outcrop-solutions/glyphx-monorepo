import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IWorkspaceDocument, IWorkspaceStaticMethods, IWorkspaceMethods} from '../interfaces';

const SCHEMA = new Schema<IWorkspaceDocument, IWorkspaceStaticMethods, IWorkspaceMethods>({
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
  workspaceCode: { type:
  string, 
  required: false,
  
  },
  inviteCode: { type:
  string, 
  required: false,
  
  },
  name: { type:
  string, 
  required: false,
  
  },
  slug: { type:
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
  tags: { type:
  ITag[], 
  required: false,
  
  },
  deletedAt: { type:
  Date, 
  required: false,
  
  },
  description: { type:
  string, 
  required: false,
  
  },
  creator: { type:
  IUser, 
  required: false,
  
  },
  members: { type:
  IMember[], 
  required: false,
  
  },
  projects: { type:
  IProject[], 
  required: false,
  
  },
  states: { type:
  IState[], 
  required: false,
  
  },
})

SCHEMA.static(addIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIworkspace> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await IworkspaceModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IWorkspace._id',
          id
        );

      const reconciledIds = await IworkspaceModel.validateIuser(IUsers);
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

      return await IworkspaceModel.getById(id);
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
          'IWorkspace.addIuser',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIworkspace> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await IworkspaceModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IWorkspace._id',
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

      return await IworkspaceModel.getById(id);
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
          'IWorkspace.removeIuser',
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


export default mongoose.model('Workspace', SCHEMA);

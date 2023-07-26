import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IActivitylogDocument, IActivitylogStaticMethods, IActivitylogMethods} from '../interfaces';

const SCHEMA = new Schema<IActivitylogDocument, IActivitylogStaticMethods, IActivitylogMethods>({
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
  actor: { type:
  IUser, 
  required: false,
  
  },
  workspaceId: { type:
  string | ObjectId, 
  required: false,
  
  },
  projectId: { type:
  string | ObjectId, 
  required: false,
  
  },
  location: { type:
  string, 
  required: false,
  
  },
  userAgent: { type:
  IUserAgent, 
  required: false,
  
  },
  action: { type:
  ACTION_TYPE, 
  required: false,
  
  },
  onModel: { type:
  RESOURCE_MODEL, 
  required: false,
  
  },
  resource: { type:
  IUser | IState | IProject | ICustomerPayment | IMember | IWebhook | IWorkspace | IProcessTracking, 
  required: false,
  
  },
})

SCHEMA.static(addIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIactivitylog> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await IactivitylogModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IActivityLog._id',
          id
        );

      const reconciledIds = await IactivitylogModel.validateIuser(IUsers);
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

      return await IactivitylogModel.getById(id);
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
          'IActivityLog.addIuser',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIactivitylog> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await IactivitylogModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IActivityLog._id',
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

      return await IactivitylogModel.getById(id);
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
          'IActivityLog.removeIuser',
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
SCHEMA.static(addIuseragent: async (
    id: mongooseTypes.ObjectId,
    IUserAgents: (databaseTypes.IIuseragent | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIactivitylog> => {
    try {
      if (!IUserAgents.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUserAgents',
          IUserAgents
        );
      const document = await IactivitylogModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IActivityLog._id',
          id
        );

      const reconciledIds = await IactivitylogModel.validateIuseragent(IUserAgents);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.IUserAgents.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.IUserAgents.push(
            p as unknown as databaseTypes.IIuseragent
          );
        }
      });

      if (dirty) await document.save();

      return await IactivitylogModel.getById(id);
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
          'IActivityLog.addIuseragent',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIuseragent: async (
    id: mongooseTypes.ObjectId,
    IUserAgents: (databaseTypes.IIuseragent | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIactivitylog> => {
    try {
      if (!IUserAgents.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUserAgents',
          IUserAgents
        );
      const document = await IactivitylogModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IActivityLog._id',
          id
        );

      const reconciledIds = IUserAgents.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedIuseragent = document.IUserAgents.filter(p => {
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
        document.IUserAgents =
          updatedIuseragent as unknown as databaseTypes.IIuseragent[];
        await document.save();
      }

      return await IactivitylogModel.getById(id);
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
          'IActivityLog.removeIuseragent',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateIuseragent, 
    async (
    IUserAgents: (databaseTypes.IIuseragent | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const IUserAgentsIds: mongooseTypes.ObjectId[] = [];
    IUserAgents.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) IUserAgentsIds.push(p);
      else IUserAgentsIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await IuseragentModel.allIuseragentIdsExist(IUserAgentsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'IUserAgents',
          IUserAgents,
          err
        );
      else throw err;
    }

    return IUserAgentsIds;
  })
SCHEMA.static(addAction_type: async (
    id: mongooseTypes.ObjectId,
    ACTION_TYPES: (databaseTypes.IAction_type | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIactivitylog> => {
    try {
      if (!ACTION_TYPES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'ACTION_TYPES',
          ACTION_TYPES
        );
      const document = await IactivitylogModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IActivityLog._id',
          id
        );

      const reconciledIds = await IactivitylogModel.validateAction_type(ACTION_TYPES);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.ACTION_TYPES.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.ACTION_TYPES.push(
            p as unknown as databaseTypes.IAction_type
          );
        }
      });

      if (dirty) await document.save();

      return await IactivitylogModel.getById(id);
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
          'IActivityLog.addAction_type',
          err
        );
      }
    }
})

SCHEMA.static(
    removeAction_type: async (
    id: mongooseTypes.ObjectId,
    ACTION_TYPES: (databaseTypes.IAction_type | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIactivitylog> => {
    try {
      if (!ACTION_TYPES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'ACTION_TYPES',
          ACTION_TYPES
        );
      const document = await IactivitylogModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IActivityLog._id',
          id
        );

      const reconciledIds = ACTION_TYPES.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedAction_type = document.ACTION_TYPES.filter(p => {
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
        document.ACTION_TYPES =
          updatedAction_type as unknown as databaseTypes.IAction_type[];
        await document.save();
      }

      return await IactivitylogModel.getById(id);
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
          'IActivityLog.removeAction_type',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateAction_type, 
    async (
    ACTION_TYPES: (databaseTypes.IAction_type | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const ACTION_TYPESIds: mongooseTypes.ObjectId[] = [];
    ACTION_TYPES.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) ACTION_TYPESIds.push(p);
      else ACTION_TYPESIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await Action_typeModel.allAction_typeIdsExist(ACTION_TYPESIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'ACTION_TYPES',
          ACTION_TYPES,
          err
        );
      else throw err;
    }

    return ACTION_TYPESIds;
  })
SCHEMA.static(addResource_model: async (
    id: mongooseTypes.ObjectId,
    RESOURCE_MODELS: (databaseTypes.IResource_model | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIactivitylog> => {
    try {
      if (!RESOURCE_MODELS.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'RESOURCE_MODELS',
          RESOURCE_MODELS
        );
      const document = await IactivitylogModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IActivityLog._id',
          id
        );

      const reconciledIds = await IactivitylogModel.validateResource_model(RESOURCE_MODELS);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.RESOURCE_MODELS.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.RESOURCE_MODELS.push(
            p as unknown as databaseTypes.IResource_model
          );
        }
      });

      if (dirty) await document.save();

      return await IactivitylogModel.getById(id);
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
          'IActivityLog.addResource_model',
          err
        );
      }
    }
})

SCHEMA.static(
    removeResource_model: async (
    id: mongooseTypes.ObjectId,
    RESOURCE_MODELS: (databaseTypes.IResource_model | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIactivitylog> => {
    try {
      if (!RESOURCE_MODELS.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'RESOURCE_MODELS',
          RESOURCE_MODELS
        );
      const document = await IactivitylogModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IActivityLog._id',
          id
        );

      const reconciledIds = RESOURCE_MODELS.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedResource_model = document.RESOURCE_MODELS.filter(p => {
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
        document.RESOURCE_MODELS =
          updatedResource_model as unknown as databaseTypes.IResource_model[];
        await document.save();
      }

      return await IactivitylogModel.getById(id);
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
          'IActivityLog.removeResource_model',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateResource_model, 
    async (
    RESOURCE_MODELS: (databaseTypes.IResource_model | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const RESOURCE_MODELSIds: mongooseTypes.ObjectId[] = [];
    RESOURCE_MODELS.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) RESOURCE_MODELSIds.push(p);
      else RESOURCE_MODELSIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await Resource_modelModel.allResource_modelIdsExist(RESOURCE_MODELSIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'RESOURCE_MODELS',
          RESOURCE_MODELS,
          err
        );
      else throw err;
    }

    return RESOURCE_MODELSIds;
  })


export default mongoose.model('ActivityLog', SCHEMA);

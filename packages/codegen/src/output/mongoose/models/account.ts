import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IAccountDocument, IAccountStaticMethods, IAccountMethods} from '../interfaces';

const SCHEMA = new Schema<IAccountDocument, IAccountStaticMethods, IAccountMethods>({
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
  type: { type:
  ACCOUNT_TYPE, 
  required: false,
  
  },
  userId: { type:
  string, 
  required: false,
  
  },
  provider: { type:
  ACCOUNT_PROVIDER, 
  required: false,
  
  },
  providerAccountId: { type:
  string, 
  required: false,
  
  },
  refresh_token: { type:
  string, 
  required: false,
  
  },
  refresh_token_expires_in: { type:
  number, 
  required: false,
  
  },
  access_token: { type:
  string, 
  required: false,
  
  },
  expires_at: { type:
  number, 
  required: false,
  
  },
  token_type: { type:
  TOKEN_TYPE, 
  required: false,
  
  },
  scope: { type:
  string, 
  required: false,
  
  },
  id_token: { type:
  string, 
  required: false,
  
  },
  session_state: { type:
  SESSION_STATE, 
  required: false,
  
  },
  oauth_token_secret: { type:
  string, 
  required: false,
  
  },
  oauth_token: { type:
  string, 
  required: false,
  
  },
  user: { type:
  IUser, 
  required: false,
  
  },
})

SCHEMA.static(addAccount_type: async (
    id: mongooseTypes.ObjectId,
    ACCOUNT_TYPES: (databaseTypes.IAccount_type | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIaccount> => {
    try {
      if (!ACCOUNT_TYPES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'ACCOUNT_TYPES',
          ACCOUNT_TYPES
        );
      const document = await IaccountModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IAccount._id',
          id
        );

      const reconciledIds = await IaccountModel.validateAccount_type(ACCOUNT_TYPES);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.ACCOUNT_TYPES.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.ACCOUNT_TYPES.push(
            p as unknown as databaseTypes.IAccount_type
          );
        }
      });

      if (dirty) await document.save();

      return await IaccountModel.getById(id);
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
          'IAccount.addAccount_type',
          err
        );
      }
    }
})

SCHEMA.static(
    removeAccount_type: async (
    id: mongooseTypes.ObjectId,
    ACCOUNT_TYPES: (databaseTypes.IAccount_type | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIaccount> => {
    try {
      if (!ACCOUNT_TYPES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'ACCOUNT_TYPES',
          ACCOUNT_TYPES
        );
      const document = await IaccountModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IAccount._id',
          id
        );

      const reconciledIds = ACCOUNT_TYPES.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedAccount_type = document.ACCOUNT_TYPES.filter(p => {
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
        document.ACCOUNT_TYPES =
          updatedAccount_type as unknown as databaseTypes.IAccount_type[];
        await document.save();
      }

      return await IaccountModel.getById(id);
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
          'IAccount.removeAccount_type',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateAccount_type, 
    async (
    ACCOUNT_TYPES: (databaseTypes.IAccount_type | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const ACCOUNT_TYPESIds: mongooseTypes.ObjectId[] = [];
    ACCOUNT_TYPES.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) ACCOUNT_TYPESIds.push(p);
      else ACCOUNT_TYPESIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await Account_typeModel.allAccount_typeIdsExist(ACCOUNT_TYPESIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'ACCOUNT_TYPES',
          ACCOUNT_TYPES,
          err
        );
      else throw err;
    }

    return ACCOUNT_TYPESIds;
  })
SCHEMA.static(addAccount_provider: async (
    id: mongooseTypes.ObjectId,
    ACCOUNT_PROVIDERS: (databaseTypes.IAccount_provider | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIaccount> => {
    try {
      if (!ACCOUNT_PROVIDERS.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'ACCOUNT_PROVIDERS',
          ACCOUNT_PROVIDERS
        );
      const document = await IaccountModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IAccount._id',
          id
        );

      const reconciledIds = await IaccountModel.validateAccount_provider(ACCOUNT_PROVIDERS);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.ACCOUNT_PROVIDERS.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.ACCOUNT_PROVIDERS.push(
            p as unknown as databaseTypes.IAccount_provider
          );
        }
      });

      if (dirty) await document.save();

      return await IaccountModel.getById(id);
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
          'IAccount.addAccount_provider',
          err
        );
      }
    }
})

SCHEMA.static(
    removeAccount_provider: async (
    id: mongooseTypes.ObjectId,
    ACCOUNT_PROVIDERS: (databaseTypes.IAccount_provider | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIaccount> => {
    try {
      if (!ACCOUNT_PROVIDERS.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'ACCOUNT_PROVIDERS',
          ACCOUNT_PROVIDERS
        );
      const document = await IaccountModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IAccount._id',
          id
        );

      const reconciledIds = ACCOUNT_PROVIDERS.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedAccount_provider = document.ACCOUNT_PROVIDERS.filter(p => {
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
        document.ACCOUNT_PROVIDERS =
          updatedAccount_provider as unknown as databaseTypes.IAccount_provider[];
        await document.save();
      }

      return await IaccountModel.getById(id);
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
          'IAccount.removeAccount_provider',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateAccount_provider, 
    async (
    ACCOUNT_PROVIDERS: (databaseTypes.IAccount_provider | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const ACCOUNT_PROVIDERSIds: mongooseTypes.ObjectId[] = [];
    ACCOUNT_PROVIDERS.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) ACCOUNT_PROVIDERSIds.push(p);
      else ACCOUNT_PROVIDERSIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await Account_providerModel.allAccount_providerIdsExist(ACCOUNT_PROVIDERSIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'ACCOUNT_PROVIDERS',
          ACCOUNT_PROVIDERS,
          err
        );
      else throw err;
    }

    return ACCOUNT_PROVIDERSIds;
  })
SCHEMA.static(addToken_type: async (
    id: mongooseTypes.ObjectId,
    TOKEN_TYPES: (databaseTypes.IToken_type | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIaccount> => {
    try {
      if (!TOKEN_TYPES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'TOKEN_TYPES',
          TOKEN_TYPES
        );
      const document = await IaccountModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IAccount._id',
          id
        );

      const reconciledIds = await IaccountModel.validateToken_type(TOKEN_TYPES);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.TOKEN_TYPES.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.TOKEN_TYPES.push(
            p as unknown as databaseTypes.IToken_type
          );
        }
      });

      if (dirty) await document.save();

      return await IaccountModel.getById(id);
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
          'IAccount.addToken_type',
          err
        );
      }
    }
})

SCHEMA.static(
    removeToken_type: async (
    id: mongooseTypes.ObjectId,
    TOKEN_TYPES: (databaseTypes.IToken_type | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIaccount> => {
    try {
      if (!TOKEN_TYPES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'TOKEN_TYPES',
          TOKEN_TYPES
        );
      const document = await IaccountModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IAccount._id',
          id
        );

      const reconciledIds = TOKEN_TYPES.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedToken_type = document.TOKEN_TYPES.filter(p => {
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
        document.TOKEN_TYPES =
          updatedToken_type as unknown as databaseTypes.IToken_type[];
        await document.save();
      }

      return await IaccountModel.getById(id);
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
          'IAccount.removeToken_type',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateToken_type, 
    async (
    TOKEN_TYPES: (databaseTypes.IToken_type | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const TOKEN_TYPESIds: mongooseTypes.ObjectId[] = [];
    TOKEN_TYPES.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) TOKEN_TYPESIds.push(p);
      else TOKEN_TYPESIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await Token_typeModel.allToken_typeIdsExist(TOKEN_TYPESIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'TOKEN_TYPES',
          TOKEN_TYPES,
          err
        );
      else throw err;
    }

    return TOKEN_TYPESIds;
  })
SCHEMA.static(addSession_state: async (
    id: mongooseTypes.ObjectId,
    SESSION_STATES: (databaseTypes.ISession_state | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIaccount> => {
    try {
      if (!SESSION_STATES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'SESSION_STATES',
          SESSION_STATES
        );
      const document = await IaccountModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IAccount._id',
          id
        );

      const reconciledIds = await IaccountModel.validateSession_state(SESSION_STATES);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.SESSION_STATES.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.SESSION_STATES.push(
            p as unknown as databaseTypes.ISession_state
          );
        }
      });

      if (dirty) await document.save();

      return await IaccountModel.getById(id);
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
          'IAccount.addSession_state',
          err
        );
      }
    }
})

SCHEMA.static(
    removeSession_state: async (
    id: mongooseTypes.ObjectId,
    SESSION_STATES: (databaseTypes.ISession_state | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIaccount> => {
    try {
      if (!SESSION_STATES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'SESSION_STATES',
          SESSION_STATES
        );
      const document = await IaccountModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IAccount._id',
          id
        );

      const reconciledIds = SESSION_STATES.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedSession_state = document.SESSION_STATES.filter(p => {
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
        document.SESSION_STATES =
          updatedSession_state as unknown as databaseTypes.ISession_state[];
        await document.save();
      }

      return await IaccountModel.getById(id);
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
          'IAccount.removeSession_state',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateSession_state, 
    async (
    SESSION_STATES: (databaseTypes.ISession_state | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const SESSION_STATESIds: mongooseTypes.ObjectId[] = [];
    SESSION_STATES.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) SESSION_STATESIds.push(p);
      else SESSION_STATESIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await Session_stateModel.allSession_stateIdsExist(SESSION_STATESIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'SESSION_STATES',
          SESSION_STATES,
          err
        );
      else throw err;
    }

    return SESSION_STATESIds;
  })
SCHEMA.static(addIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIaccount> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await IaccountModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IAccount._id',
          id
        );

      const reconciledIds = await IaccountModel.validateIuser(IUsers);
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

      return await IaccountModel.getById(id);
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
          'IAccount.addIuser',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIaccount> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await IaccountModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IAccount._id',
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

      return await IaccountModel.getById(id);
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
          'IAccount.removeIuser',
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


export default mongoose.model('Account', SCHEMA);

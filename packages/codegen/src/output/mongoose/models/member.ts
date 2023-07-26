import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IMemberDocument, IMemberStaticMethods, IMemberMethods} from '../interfaces';

const SCHEMA = new Schema<IMemberDocument, IMemberStaticMethods, IMemberMethods>({
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
  email: { type:
  string, 
  required: false,
  
  },
  inviter: { type:
  string, 
  required: false,
  
  },
  type: { type:
  MEMBERSHIP_TYPE, 
  required: false,
  
  },
  invitedAt: { type:
  Date, 
  required: false,
  
  },
  joinedAt: { type:
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
  createdAt: { type:
  Date, 
  required: false,
  
  },
  status: { type:
  INVITATION_STATUS, 
  required: false,
  
  },
  teamRole: { type:
  ROLE, 
  required: false,
  
  },
  projectRole: { type:
  PROJECT_ROLE, 
  required: false,
  
  },
  member: { type:
  IUser, 
  required: false,
  
  },
  invitedBy: { type:
  IUser, 
  required: false,
  
  },
  workspace: { type:
  IWorkspace, 
  required: false,
  
  },
  project: { type:
  IProject, 
  required: false,
  
  },
})

SCHEMA.static(addMembership_type: async (
    id: mongooseTypes.ObjectId,
    MEMBERSHIP_TYPES: (databaseTypes.IMembership_type | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!MEMBERSHIP_TYPES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'MEMBERSHIP_TYPES',
          MEMBERSHIP_TYPES
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = await ImemberModel.validateMembership_type(MEMBERSHIP_TYPES);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.MEMBERSHIP_TYPES.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.MEMBERSHIP_TYPES.push(
            p as unknown as databaseTypes.IMembership_type
          );
        }
      });

      if (dirty) await document.save();

      return await ImemberModel.getById(id);
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
          'IMember.addMembership_type',
          err
        );
      }
    }
})

SCHEMA.static(
    removeMembership_type: async (
    id: mongooseTypes.ObjectId,
    MEMBERSHIP_TYPES: (databaseTypes.IMembership_type | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!MEMBERSHIP_TYPES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'MEMBERSHIP_TYPES',
          MEMBERSHIP_TYPES
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = MEMBERSHIP_TYPES.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedMembership_type = document.MEMBERSHIP_TYPES.filter(p => {
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
        document.MEMBERSHIP_TYPES =
          updatedMembership_type as unknown as databaseTypes.IMembership_type[];
        await document.save();
      }

      return await ImemberModel.getById(id);
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
          'IMember.removeMembership_type',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateMembership_type, 
    async (
    MEMBERSHIP_TYPES: (databaseTypes.IMembership_type | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const MEMBERSHIP_TYPESIds: mongooseTypes.ObjectId[] = [];
    MEMBERSHIP_TYPES.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) MEMBERSHIP_TYPESIds.push(p);
      else MEMBERSHIP_TYPESIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await Membership_typeModel.allMembership_typeIdsExist(MEMBERSHIP_TYPESIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'MEMBERSHIP_TYPES',
          MEMBERSHIP_TYPES,
          err
        );
      else throw err;
    }

    return MEMBERSHIP_TYPESIds;
  })
SCHEMA.static(addInvitation_status: async (
    id: mongooseTypes.ObjectId,
    INVITATION_STATUSES: (databaseTypes.IInvitation_status | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!INVITATION_STATUSES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'INVITATION_STATUSES',
          INVITATION_STATUSES
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = await ImemberModel.validateInvitation_status(INVITATION_STATUSES);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.INVITATION_STATUSES.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.INVITATION_STATUSES.push(
            p as unknown as databaseTypes.IInvitation_status
          );
        }
      });

      if (dirty) await document.save();

      return await ImemberModel.getById(id);
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
          'IMember.addInvitation_status',
          err
        );
      }
    }
})

SCHEMA.static(
    removeInvitation_status: async (
    id: mongooseTypes.ObjectId,
    INVITATION_STATUSES: (databaseTypes.IInvitation_status | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!INVITATION_STATUSES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'INVITATION_STATUSES',
          INVITATION_STATUSES
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = INVITATION_STATUSES.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedInvitation_status = document.INVITATION_STATUSES.filter(p => {
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
        document.INVITATION_STATUSES =
          updatedInvitation_status as unknown as databaseTypes.IInvitation_status[];
        await document.save();
      }

      return await ImemberModel.getById(id);
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
          'IMember.removeInvitation_status',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateInvitation_status, 
    async (
    INVITATION_STATUSES: (databaseTypes.IInvitation_status | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const INVITATION_STATUSESIds: mongooseTypes.ObjectId[] = [];
    INVITATION_STATUSES.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) INVITATION_STATUSESIds.push(p);
      else INVITATION_STATUSESIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await Invitation_statusModel.allInvitation_statusIdsExist(INVITATION_STATUSESIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'INVITATION_STATUSES',
          INVITATION_STATUSES,
          err
        );
      else throw err;
    }

    return INVITATION_STATUSESIds;
  })
SCHEMA.static(addRole: async (
    id: mongooseTypes.ObjectId,
    ROLES: (databaseTypes.IRole | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!ROLES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'ROLES',
          ROLES
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = await ImemberModel.validateRole(ROLES);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.ROLES.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.ROLES.push(
            p as unknown as databaseTypes.IRole
          );
        }
      });

      if (dirty) await document.save();

      return await ImemberModel.getById(id);
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
          'IMember.addRole',
          err
        );
      }
    }
})

SCHEMA.static(
    removeRole: async (
    id: mongooseTypes.ObjectId,
    ROLES: (databaseTypes.IRole | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!ROLES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'ROLES',
          ROLES
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = ROLES.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedRole = document.ROLES.filter(p => {
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
        document.ROLES =
          updatedRole as unknown as databaseTypes.IRole[];
        await document.save();
      }

      return await ImemberModel.getById(id);
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
          'IMember.removeRole',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateRole, 
    async (
    ROLES: (databaseTypes.IRole | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const ROLESIds: mongooseTypes.ObjectId[] = [];
    ROLES.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) ROLESIds.push(p);
      else ROLESIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await RoleModel.allRoleIdsExist(ROLESIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'ROLES',
          ROLES,
          err
        );
      else throw err;
    }

    return ROLESIds;
  })
SCHEMA.static(addProject_role: async (
    id: mongooseTypes.ObjectId,
    PROJECT_ROLES: (databaseTypes.IProject_role | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!PROJECT_ROLES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'PROJECT_ROLES',
          PROJECT_ROLES
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = await ImemberModel.validateProject_role(PROJECT_ROLES);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.PROJECT_ROLES.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.PROJECT_ROLES.push(
            p as unknown as databaseTypes.IProject_role
          );
        }
      });

      if (dirty) await document.save();

      return await ImemberModel.getById(id);
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
          'IMember.addProject_role',
          err
        );
      }
    }
})

SCHEMA.static(
    removeProject_role: async (
    id: mongooseTypes.ObjectId,
    PROJECT_ROLES: (databaseTypes.IProject_role | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!PROJECT_ROLES.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'PROJECT_ROLES',
          PROJECT_ROLES
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = PROJECT_ROLES.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedProject_role = document.PROJECT_ROLES.filter(p => {
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
        document.PROJECT_ROLES =
          updatedProject_role as unknown as databaseTypes.IProject_role[];
        await document.save();
      }

      return await ImemberModel.getById(id);
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
          'IMember.removeProject_role',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateProject_role, 
    async (
    PROJECT_ROLES: (databaseTypes.IProject_role | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const PROJECT_ROLESIds: mongooseTypes.ObjectId[] = [];
    PROJECT_ROLES.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) PROJECT_ROLESIds.push(p);
      else PROJECT_ROLESIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await Project_roleModel.allProject_roleIdsExist(PROJECT_ROLESIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'PROJECT_ROLES',
          PROJECT_ROLES,
          err
        );
      else throw err;
    }

    return PROJECT_ROLESIds;
  })
SCHEMA.static(addIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = await ImemberModel.validateIuser(IUsers);
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

      return await ImemberModel.getById(id);
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
          'IMember.addIuser',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
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

      return await ImemberModel.getById(id);
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
          'IMember.removeIuser',
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
SCHEMA.static(addIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = await ImemberModel.validateIuser(IUsers);
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

      return await ImemberModel.getById(id);
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
          'IMember.addIuser',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
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

      return await ImemberModel.getById(id);
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
          'IMember.removeIuser',
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
SCHEMA.static(addIworkspace: async (
    id: mongooseTypes.ObjectId,
    IWorkspaces: (databaseTypes.IIworkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!IWorkspaces.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IWorkspaces',
          IWorkspaces
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = await ImemberModel.validateIworkspace(IWorkspaces);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.IWorkspaces.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.IWorkspaces.push(
            p as unknown as databaseTypes.IIworkspace
          );
        }
      });

      if (dirty) await document.save();

      return await ImemberModel.getById(id);
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
          'IMember.addIworkspace',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIworkspace: async (
    id: mongooseTypes.ObjectId,
    IWorkspaces: (databaseTypes.IIworkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!IWorkspaces.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IWorkspaces',
          IWorkspaces
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = IWorkspaces.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedIworkspace = document.IWorkspaces.filter(p => {
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
        document.IWorkspaces =
          updatedIworkspace as unknown as databaseTypes.IIworkspace[];
        await document.save();
      }

      return await ImemberModel.getById(id);
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
          'IMember.removeIworkspace',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateIworkspace, 
    async (
    IWorkspaces: (databaseTypes.IIworkspace | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const IWorkspacesIds: mongooseTypes.ObjectId[] = [];
    IWorkspaces.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) IWorkspacesIds.push(p);
      else IWorkspacesIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await IworkspaceModel.allIworkspaceIdsExist(IWorkspacesIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'IWorkspaces',
          IWorkspaces,
          err
        );
      else throw err;
    }

    return IWorkspacesIds;
  })
SCHEMA.static(addIproject: async (
    id: mongooseTypes.ObjectId,
    IProjects: (databaseTypes.IIproject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!IProjects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IProjects',
          IProjects
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = await ImemberModel.validateIproject(IProjects);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.IProjects.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.IProjects.push(
            p as unknown as databaseTypes.IIproject
          );
        }
      });

      if (dirty) await document.save();

      return await ImemberModel.getById(id);
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
          'IMember.addIproject',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIproject: async (
    id: mongooseTypes.ObjectId,
    IProjects: (databaseTypes.IIproject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IImember> => {
    try {
      if (!IProjects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IProjects',
          IProjects
        );
      const document = await ImemberModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IMember._id',
          id
        );

      const reconciledIds = IProjects.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedIproject = document.IProjects.filter(p => {
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
        document.IProjects =
          updatedIproject as unknown as databaseTypes.IIproject[];
        await document.save();
      }

      return await ImemberModel.getById(id);
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
          'IMember.removeIproject',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateIproject, 
    async (
    IProjects: (databaseTypes.IIproject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const IProjectsIds: mongooseTypes.ObjectId[] = [];
    IProjects.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) IProjectsIds.push(p);
      else IProjectsIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await IprojectModel.allIprojectIdsExist(IProjectsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'IProjects',
          IProjects,
          err
        );
      else throw err;
    }

    return IProjectsIds;
  })


export default mongoose.model('Member', SCHEMA);

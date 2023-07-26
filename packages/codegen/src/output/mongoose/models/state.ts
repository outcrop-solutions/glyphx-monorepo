import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IStateDocument, IStateStaticMethods, IStateMethods} from '../interfaces';

const SCHEMA = new Schema<IStateDocument, IStateStaticMethods, IStateMethods>({
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
  createdBy: { type:
  IUser, 
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
  name: { type:
  string, 
  required: false,
  
  },
  updatedAt: { type:
  Date, 
  required: false,
  
  },
  version: { type:
  number, 
  required: false,
  
  },
  static: { type:
  boolean, 
  required: false,
  
  },
  imageHash: { type:
  string, 
  required: false,
  
  },
  camera: { type:
  Camera, 
  required: false,
  
  },
  aspectRatio: { type:
  Aspect, 
  required: false,
  
  },
  properties: { type:
  Record&lt;string, Property&gt;, 
  required: false,
  
  },
  fileSystemHash: { type:
  string, 
  required: false,
  
  },
  payloadHash: { type:
  string, 
  required: false,
  
  },
  description: { type:
  string, 
  required: false,
  
  },
  project: { type:
  IProject, 
  required: false,
  
  },
  workspace: { type:
  IWorkspace, 
  required: false,
  
  },
  fileSystem: { type:
  IFileStats[], 
  required: false,
  
  },
})

SCHEMA.static(addIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIstate> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await IstateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IState._id',
          id
        );

      const reconciledIds = await IstateModel.validateIuser(IUsers);
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

      return await IstateModel.getById(id);
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
          'IState.addIuser',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIuser: async (
    id: mongooseTypes.ObjectId,
    IUsers: (databaseTypes.IIuser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIstate> => {
    try {
      if (!IUsers.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IUsers',
          IUsers
        );
      const document = await IstateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IState._id',
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

      return await IstateModel.getById(id);
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
          'IState.removeIuser',
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
SCHEMA.static(addCamera: async (
    id: mongooseTypes.ObjectId,
    Cameras: (databaseTypes.ICamera | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIstate> => {
    try {
      if (!Cameras.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Cameras',
          Cameras
        );
      const document = await IstateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IState._id',
          id
        );

      const reconciledIds = await IstateModel.validateCamera(Cameras);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.Cameras.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.Cameras.push(
            p as unknown as databaseTypes.ICamera
          );
        }
      });

      if (dirty) await document.save();

      return await IstateModel.getById(id);
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
          'IState.addCamera',
          err
        );
      }
    }
})

SCHEMA.static(
    removeCamera: async (
    id: mongooseTypes.ObjectId,
    Cameras: (databaseTypes.ICamera | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIstate> => {
    try {
      if (!Cameras.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Cameras',
          Cameras
        );
      const document = await IstateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IState._id',
          id
        );

      const reconciledIds = Cameras.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedCamera = document.Cameras.filter(p => {
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
        document.Cameras =
          updatedCamera as unknown as databaseTypes.ICamera[];
        await document.save();
      }

      return await IstateModel.getById(id);
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
          'IState.removeCamera',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateCamera, 
    async (
    Cameras: (databaseTypes.ICamera | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const CamerasIds: mongooseTypes.ObjectId[] = [];
    Cameras.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) CamerasIds.push(p);
      else CamerasIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await CameraModel.allCameraIdsExist(CamerasIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'Cameras',
          Cameras,
          err
        );
      else throw err;
    }

    return CamerasIds;
  })
SCHEMA.static(addAspect: async (
    id: mongooseTypes.ObjectId,
    Aspects: (databaseTypes.IAspect | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIstate> => {
    try {
      if (!Aspects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Aspects',
          Aspects
        );
      const document = await IstateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IState._id',
          id
        );

      const reconciledIds = await IstateModel.validateAspect(Aspects);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.Aspects.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.Aspects.push(
            p as unknown as databaseTypes.IAspect
          );
        }
      });

      if (dirty) await document.save();

      return await IstateModel.getById(id);
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
          'IState.addAspect',
          err
        );
      }
    }
})

SCHEMA.static(
    removeAspect: async (
    id: mongooseTypes.ObjectId,
    Aspects: (databaseTypes.IAspect | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIstate> => {
    try {
      if (!Aspects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Aspects',
          Aspects
        );
      const document = await IstateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IState._id',
          id
        );

      const reconciledIds = Aspects.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedAspect = document.Aspects.filter(p => {
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
        document.Aspects =
          updatedAspect as unknown as databaseTypes.IAspect[];
        await document.save();
      }

      return await IstateModel.getById(id);
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
          'IState.removeAspect',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateAspect, 
    async (
    Aspects: (databaseTypes.IAspect | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const AspectsIds: mongooseTypes.ObjectId[] = [];
    Aspects.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) AspectsIds.push(p);
      else AspectsIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await AspectModel.allAspectIdsExist(AspectsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'Aspects',
          Aspects,
          err
        );
      else throw err;
    }

    return AspectsIds;
  })
SCHEMA.static(addRecord: async (
    id: mongooseTypes.ObjectId,
    Records: (databaseTypes.IRecord | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIstate> => {
    try {
      if (!Records.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Records',
          Records
        );
      const document = await IstateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IState._id',
          id
        );

      const reconciledIds = await IstateModel.validateRecord(Records);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.Records.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.Records.push(
            p as unknown as databaseTypes.IRecord
          );
        }
      });

      if (dirty) await document.save();

      return await IstateModel.getById(id);
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
          'IState.addRecord',
          err
        );
      }
    }
})

SCHEMA.static(
    removeRecord: async (
    id: mongooseTypes.ObjectId,
    Records: (databaseTypes.IRecord | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIstate> => {
    try {
      if (!Records.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Records',
          Records
        );
      const document = await IstateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IState._id',
          id
        );

      const reconciledIds = Records.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedRecord = document.Records.filter(p => {
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
        document.Records =
          updatedRecord as unknown as databaseTypes.IRecord[];
        await document.save();
      }

      return await IstateModel.getById(id);
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
          'IState.removeRecord',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateRecord, 
    async (
    Records: (databaseTypes.IRecord | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const RecordsIds: mongooseTypes.ObjectId[] = [];
    Records.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) RecordsIds.push(p);
      else RecordsIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await RecordModel.allRecordIdsExist(RecordsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'Records',
          Records,
          err
        );
      else throw err;
    }

    return RecordsIds;
  })
SCHEMA.static(addIproject: async (
    id: mongooseTypes.ObjectId,
    IProjects: (databaseTypes.IIproject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIstate> => {
    try {
      if (!IProjects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IProjects',
          IProjects
        );
      const document = await IstateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IState._id',
          id
        );

      const reconciledIds = await IstateModel.validateIproject(IProjects);
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

      return await IstateModel.getById(id);
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
          'IState.addIproject',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIproject: async (
    id: mongooseTypes.ObjectId,
    IProjects: (databaseTypes.IIproject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIstate> => {
    try {
      if (!IProjects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IProjects',
          IProjects
        );
      const document = await IstateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IState._id',
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

      return await IstateModel.getById(id);
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
          'IState.removeIproject',
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
SCHEMA.static(addIworkspace: async (
    id: mongooseTypes.ObjectId,
    IWorkspaces: (databaseTypes.IIworkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIstate> => {
    try {
      if (!IWorkspaces.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IWorkspaces',
          IWorkspaces
        );
      const document = await IstateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IState._id',
          id
        );

      const reconciledIds = await IstateModel.validateIworkspace(IWorkspaces);
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

      return await IstateModel.getById(id);
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
          'IState.addIworkspace',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIworkspace: async (
    id: mongooseTypes.ObjectId,
    IWorkspaces: (databaseTypes.IIworkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIstate> => {
    try {
      if (!IWorkspaces.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IWorkspaces',
          IWorkspaces
        );
      const document = await IstateModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IState._id',
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

      return await IstateModel.getById(id);
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
          'IState.removeIworkspace',
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


export default mongoose.model('State', SCHEMA);

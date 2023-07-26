import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IProjectDocument, IProjectStaticMethods, IProjectMethods} from '../interfaces';

const SCHEMA = new Schema<IProjectDocument, IProjectStaticMethods, IProjectMethods>({
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
  name: { type:
  string, 
  required: false,
  
  },
  description: { type:
  string, 
  required: false,
  
  },
  deletedAt: { type:
  Date, 
  required: false,
  
  },
  sdtPath: { type:
  string, 
  required: false,
  
  },
  workspace: { type:
  IWorkspace, 
  required: false,
  
  },
  lastOpened: { type:
  Date, 
  required: false,
  
  },
  imageHash: { type:
  string, 
  required: false,
  
  },
  aspectRatio: { type:
  Aspect, 
  required: false,
  
  },
  slug: { type:
  string, 
  required: false,
  
  },
  template: { type:
  IProjectTemplate, 
  required: false,
  
  },
  members: { type:
  IMember[], 
  required: false,
  
  },
  tags: { type:
  ITag[], 
  required: false,
  
  },
  currentVersion: { type:
  number, 
  required: false,
  
  },
  state: { type:
  Omit&lt;IState, &quot;name&quot; | &quot;createdAt&quot; | &quot;updatedAt&quot; | &quot;fileSystemHash&quot; | &quot;payloadHash&quot; | &quot;fileSystem&quot; | &quot;description&quot; | &quot;version&quot; | &quot;static&quot; | &quot;camera&quot; | &quot;aspectRatio&quot; | &quot;project&quot; | &quot;workspace&quot; | &quot;createdBy&quot; | &quot;_id&quot;&gt;, 
  required: false,
  
  },
  stateHistory: { type:
  IState[], 
  required: false,
  
  },
  files: { type:
  IFileStats[], 
  required: false,
  
  },
  viewName: { type:
  string, 
  required: false,
  
  },
})

SCHEMA.static(addIworkspace: async (
    id: mongooseTypes.ObjectId,
    IWorkspaces: (databaseTypes.IIworkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIproject> => {
    try {
      if (!IWorkspaces.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IWorkspaces',
          IWorkspaces
        );
      const document = await IprojectModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProject._id',
          id
        );

      const reconciledIds = await IprojectModel.validateIworkspace(IWorkspaces);
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

      return await IprojectModel.getById(id);
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
          'IProject.addIworkspace',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIworkspace: async (
    id: mongooseTypes.ObjectId,
    IWorkspaces: (databaseTypes.IIworkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIproject> => {
    try {
      if (!IWorkspaces.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IWorkspaces',
          IWorkspaces
        );
      const document = await IprojectModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProject._id',
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

      return await IprojectModel.getById(id);
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
          'IProject.removeIworkspace',
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
SCHEMA.static(addAspect: async (
    id: mongooseTypes.ObjectId,
    Aspects: (databaseTypes.IAspect | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIproject> => {
    try {
      if (!Aspects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Aspects',
          Aspects
        );
      const document = await IprojectModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProject._id',
          id
        );

      const reconciledIds = await IprojectModel.validateAspect(Aspects);
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

      return await IprojectModel.getById(id);
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
          'IProject.addAspect',
          err
        );
      }
    }
})

SCHEMA.static(
    removeAspect: async (
    id: mongooseTypes.ObjectId,
    Aspects: (databaseTypes.IAspect | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIproject> => {
    try {
      if (!Aspects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Aspects',
          Aspects
        );
      const document = await IprojectModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProject._id',
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

      return await IprojectModel.getById(id);
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
          'IProject.removeAspect',
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
SCHEMA.static(addIprojecttemplate: async (
    id: mongooseTypes.ObjectId,
    IProjectTemplates: (databaseTypes.IIprojecttemplate | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIproject> => {
    try {
      if (!IProjectTemplates.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IProjectTemplates',
          IProjectTemplates
        );
      const document = await IprojectModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProject._id',
          id
        );

      const reconciledIds = await IprojectModel.validateIprojecttemplate(IProjectTemplates);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.IProjectTemplates.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.IProjectTemplates.push(
            p as unknown as databaseTypes.IIprojecttemplate
          );
        }
      });

      if (dirty) await document.save();

      return await IprojectModel.getById(id);
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
          'IProject.addIprojecttemplate',
          err
        );
      }
    }
})

SCHEMA.static(
    removeIprojecttemplate: async (
    id: mongooseTypes.ObjectId,
    IProjectTemplates: (databaseTypes.IIprojecttemplate | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIproject> => {
    try {
      if (!IProjectTemplates.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'IProjectTemplates',
          IProjectTemplates
        );
      const document = await IprojectModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProject._id',
          id
        );

      const reconciledIds = IProjectTemplates.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedIprojecttemplate = document.IProjectTemplates.filter(p => {
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
        document.IProjectTemplates =
          updatedIprojecttemplate as unknown as databaseTypes.IIprojecttemplate[];
        await document.save();
      }

      return await IprojectModel.getById(id);
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
          'IProject.removeIprojecttemplate',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateIprojecttemplate, 
    async (
    IProjectTemplates: (databaseTypes.IIprojecttemplate | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const IProjectTemplatesIds: mongooseTypes.ObjectId[] = [];
    IProjectTemplates.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) IProjectTemplatesIds.push(p);
      else IProjectTemplatesIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await IprojecttemplateModel.allIprojecttemplateIdsExist(IProjectTemplatesIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'IProjectTemplates',
          IProjectTemplates,
          err
        );
      else throw err;
    }

    return IProjectTemplatesIds;
  })
SCHEMA.static(addOmit: async (
    id: mongooseTypes.ObjectId,
    Omits: (databaseTypes.IOmit | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIproject> => {
    try {
      if (!Omits.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Omits',
          Omits
        );
      const document = await IprojectModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProject._id',
          id
        );

      const reconciledIds = await IprojectModel.validateOmit(Omits);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !document.Omits.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          document.Omits.push(
            p as unknown as databaseTypes.IOmit
          );
        }
      });

      if (dirty) await document.save();

      return await IprojectModel.getById(id);
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
          'IProject.addOmit',
          err
        );
      }
    }
})

SCHEMA.static(
    removeOmit: async (
    id: mongooseTypes.ObjectId,
    Omits: (databaseTypes.IOmit | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IIproject> => {
    try {
      if (!Omits.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'Omits',
          Omits
        );
      const document = await IprojectModel.findById(id);
      if (!document)
        throw new error.DataNotFoundError(
          `A Document with _id : ${id} cannot be found`,
          'IProject._id',
          id
        );

      const reconciledIds = Omits.map(i =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedOmit = document.Omits.filter(p => {
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
        document.Omits =
          updatedOmit as unknown as databaseTypes.IOmit[];
        await document.save();
      }

      return await IprojectModel.getById(id);
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
          'IProject.removeOmit',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    validateOmit, 
    async (
    Omits: (databaseTypes.IOmit | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const OmitsIds: mongooseTypes.ObjectId[] = [];
    Omits.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) OmitsIds.push(p);
      else OmitsIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await OmitModel.allOmitIdsExist(OmitsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exist in the database. See the inner error for additional information',
          'Omits',
          Omits,
          err
        );
      else throw err;
    }

    return OmitsIds;
  })


export default mongoose.model('Project', SCHEMA);

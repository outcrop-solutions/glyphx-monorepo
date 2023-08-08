import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {IProjectTemplateDocument, IProjectTemplateCreateInput, IProjectTemplateStaticMethods, IProjectTemplateMethods} from '../interfaces';
import { ProjectModel} from './project'
import { TagModel} from './tag'
import { shapeSchema } from '../schemas'

const SCHEMA = new Schema<IProjectTemplateDocument, IProjectTemplateStaticMethods, IProjectTemplateMethods>({
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
  name: {
    type: String,
    required: true,
      default: false
      },
  projects: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'projects'
  },
  tags: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'tags'
  },
  shape: {
    type: shapeSchema,
    required: false,
    default: {}
  }
})

SCHEMA.static(
  'projectTemplateIdExists',
  async (projectTemplateId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await PROJECTTEMPLATE_MODEL.findById(projectTemplateId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the projectTemplate.  See the inner error for additional information',
        'mongoDb',
        'projectTemplateIdExists',
        {_id: projectTemplateId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allProjectTemplateIdsExist',
  async (projectTemplateIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await PROJECTTEMPLATE_MODEL.find({_id: {$in: projectTemplateIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      projectTemplateIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more projectTemplateIds cannot be found in the database.',
          'projectTemplate._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the projectTemplateIds.  See the inner error for additional information',
          'mongoDb',
          'allProjectTemplateIdsExists',
          { projectTemplateIds: projectTemplateIds},
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
    projectTemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a projectTemplate with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];


    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (projectTemplate.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: projectTemplate.createdAt}
      );
    if (projectTemplate.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: projectTemplate.updatedAt}
      );
    if ((projectTemplate as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The projectTemplate._id is immutable and cannot be changed',
        {_id: (projectTemplate as Record<string, unknown>)['_id']}
      );
  }
);

SCHEMA.static(
  'createProjectTemplate',
  async (input: IProjectTemplateCreateInput): Promise<databaseTypes.IProjectTemplate> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [ 
          projects,
          tags,
        ] = await Promise.all([
        PROJECTTEMPLATE_MODEL.validateProjects(input.workspace ?? []),
        PROJECTTEMPLATE_MODEL.validateTags(input.workspace ?? []),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IProjectTemplateDocument = {
        createdAt: createDate,
        updatedAt: createDate
          ,name: input.name
          ,projects: input.projects
          ,tags: input.tags
          ,shape: input.shape
      };
      try {
        await PROJECTTEMPLATE_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IProjectTemplateDocument',
          resolvedInput,
          err
        );
      }
      const projecttemplateDocument = (
        await PROJECTTEMPLATE_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = projecttemplateDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the projecttemplate.  See the inner error for additional details',
          'mongoDb',
          'addProjectTemplate',
          {},
          err
        );
      }
    }
    if (id) return await PROJECTTEMPLATE_MODEL.getProjectTemplateById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the projecttemplate may not have been created.  I have no other information to provide.'
      );
  }
);

SCHEMA.static('getProjectTemplateById', async (projecttemplateId: mongooseTypes.ObjectId) => {
  try {
    const projecttemplateDocument = (await PROJECTTEMPLATE_MODEL.findById(projecttemplateId)
      .populate('projects')
      .populate('tags')
      .populate('shape')
      .lean()) as databaseTypes.IProjectTemplate;
    if (!projecttemplateDocument) {
      throw new error.DataNotFoundError(
        `Could not find a projecttemplate with the _id: ${ projecttemplateId}`,
        'projecttemplate_id',
        projecttemplateId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (projecttemplateDocument as any)['__v'];

    projecttemplateDocument.projects?.forEach((m: any) => delete (m as any)['__v']);
        projecttemplateDocument.tags?.forEach((m: any) => delete (m as any)['__v']);
    
    return projecttemplateDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getProjectTemplateById',
        err
      );
  }
});

SCHEMA.static(
  'updateProjectTemplateWithFilter',
  async (
    filter: Record<string, unknown>,
    projecttemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): Promise<void> => {
    try {
      await PROJECTTEMPLATE_MODEL.validateUpdateObject(projecttemplate);
      const updateDate = new Date();
      const transformedObject: Partial<IProjectTemplateDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in projecttemplate) {
        const value = (projecttemplate as Record<string, any>)[key];
        else transformedObject[key] = value;
      }
      const updateResult = await PROJECTTEMPLATE_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No projecttemplate document with filter: ${filter} was found',
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
          'update projecttemplate',
          {filter: filter, projecttemplate : projecttemplate },
          err
        );
    }
  }
);

SCHEMA.static(
  'queryProjectTemplates',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await PROJECTTEMPLATE_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find projecttemplates with the filter: ${filter}`,
          'queryProjectTemplates',
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

      const projecttemplateDocuments = (await PROJECTTEMPLATE_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('projects')
        .populate('tags')
        .populate('shape')
        .lean()) as databaseTypes.IProjectTemplate[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      projecttemplateDocuments.forEach((doc: any) => {
      delete (doc as any)['__v'];
      (doc as any).projects?.forEach((m: any) => delete (m as any)['__v']);
            (doc as any).tags?.forEach((m: any) => delete (m as any)['__v']);
            });

      const retval: IQueryResult<databaseTypes.IProjectTemplate> = {
        results: projecttemplateDocuments,
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
          'An unexpected error occurred while getting the projecttemplates.  See the inner error for additional information',
          'mongoDb',
          'queryProjectTemplates',
          err
        );
    }
  }
);

SCHEMA.static(
  'deleteProjectTemplateById',
  async (projecttemplateId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await PROJECTTEMPLATE_MODEL.deleteOne({_id: projecttemplateId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A projecttemplate with a _id: ${ projecttemplateId} was not found in the database`,
          '_id',
          projecttemplateId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the projecttemplate from the database. The projecttemplate may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete projecttemplate',
          {_id: projecttemplateId},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateProjectTemplateById',
  async (
    projecttemplateId: mongooseTypes.ObjectId,
    projecttemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): Promise<databaseTypes.IProjectTemplate> => {
    await PROJECTTEMPLATE_MODEL.updateProjectTemplateWithFilter({_id: projecttemplateId}, projecttemplate);
    return await PROJECTTEMPLATE_MODEL.getProjectTemplateById(projecttemplateId);
  }
);



SCHEMA.static(
    'addProjects',
    async (
    projecttemplateId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'projects',
          projects
        );
      const projectTemplateDocument = await PROJECTTEMPLATE_MODEL.findById(projecttemplateId);
      if (!projectTemplateDocument)
        throw new error.DataNotFoundError(
          'A projectTemplateDocument with _id cannot be found',
          'projecttemplate._id',
          projecttemplateId
        );

      const reconciledIds = await PROJECTTEMPLATE_MODEL.validateProject(projects);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        if (
          !projectTemplateDocument.projects.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          projectTemplateDocument.projects.push(
            p as unknown as databaseTypes.IProject
          );
        }
      });

      if (dirty) await projectTemplateDocument.save();

      return await PROJECTTEMPLATE_MODEL.getProjectTemplateById(projecttemplateId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the Projects. See the inner error for additional information',
          'mongoDb',
          'projectTemplate.addProjects',
          err
        );
      }
    }
})

SCHEMA.static(
    'removeProjects',
    async (
     projecttemplateId: mongooseTypes.ObjectId, 
     projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'projects',
          projects
        );
      const projectTemplateDocument = await PROJECTTEMPLATE_MODEL.findById(projecttemplateId);
      if (!projectTemplateDocument)
        throw new error.DataNotFoundError(
          'A Document cannot be found',
          '._id',
          projecttemplateId
        );

      const reconciledIds = projects.map((i: any) =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedProjects = projectTemplateDocument.projects.filter((p: any) => {
        let retval = true;
        if (
          reconciledIds.find(
            (r: any) =>
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
        projectTemplateDocument.projects =
          updatedProjects as unknown as databaseTypes.IProject[];
        await projectTemplateDocument.save();
      }

      return await PROJECTTEMPLATE_MODEL.getProjectTemplateById(projecttemplateId);
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
          'projectTemplate.removeProjects',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    'validateProjects', 
    async (
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const projectsIds: mongooseTypes.ObjectId[] = [];
    projects.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) projectsIds.push(p);
      else projectsIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await ProjectModel.allProjectIdsExist(projectsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'projects',
          projects,
          err
        );
      else throw err;
    }

    return projectsIds;
  })

SCHEMA.static(
    'addTags',
    async (
    projecttemplateId: mongooseTypes.ObjectId,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate> => {
    try {
      if (!tags.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'tags',
          tags
        );
      const projectTemplateDocument = await PROJECTTEMPLATE_MODEL.findById(projecttemplateId);
      if (!projectTemplateDocument)
        throw new error.DataNotFoundError(
          'A projectTemplateDocument with _id cannot be found',
          'projecttemplate._id',
          projecttemplateId
        );

      const reconciledIds = await PROJECTTEMPLATE_MODEL.validateTag(tags);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        if (
          !projectTemplateDocument.tags.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          projectTemplateDocument.tags.push(
            p as unknown as databaseTypes.ITag
          );
        }
      });

      if (dirty) await projectTemplateDocument.save();

      return await PROJECTTEMPLATE_MODEL.getProjectTemplateById(projecttemplateId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the Tags. See the inner error for additional information',
          'mongoDb',
          'projectTemplate.addTags',
          err
        );
      }
    }
})

SCHEMA.static(
    'removeTags',
    async (
     projecttemplateId: mongooseTypes.ObjectId, 
     tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate> => {
    try {
      if (!tags.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'tags',
          tags
        );
      const projectTemplateDocument = await PROJECTTEMPLATE_MODEL.findById(projecttemplateId);
      if (!projectTemplateDocument)
        throw new error.DataNotFoundError(
          'A Document cannot be found',
          '._id',
          projecttemplateId
        );

      const reconciledIds = tags.map((i: any) =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedTags = projectTemplateDocument.tags.filter((p: any) => {
        let retval = true;
        if (
          reconciledIds.find(
            (r: any) =>
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
        projectTemplateDocument.tags =
          updatedTags as unknown as databaseTypes.ITag[];
        await projectTemplateDocument.save();
      }

      return await PROJECTTEMPLATE_MODEL.getProjectTemplateById(projecttemplateId);
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
          'projectTemplate.removeTags',
          err
        );
      }
    }
  }
)

SCHEMA.static(
    'validateTags', 
    async (
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const tagsIds: mongooseTypes.ObjectId[] = [];
    tags.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) tagsIds.push(p);
      else tagsIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await TagModel.allTagIdsExist(tagsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'tags',
          tags,
          err
        );
      else throw err;
    }

    return tagsIds;
  })


// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['projecttemplate'];

const PROJECTTEMPLATE_MODEL = model<IProjectTemplateDocument, IProjectTemplateStaticMethods>(
  'projecttemplate',
  SCHEMA
);

export { PROJECTTEMPLATE_MODEL as ProjectTemplateModel };
;

// THIS CODE WAS AUTOMATICALLY GENERATED
import {IQueryResult, databaseTypes} from 'types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from 'core';
import {
  IProjectTemplateDocument,
  IProjectTemplateCreateInput,
  IProjectTemplateStaticMethods,
  IProjectTemplateMethods,
} from '../interfaces';
import {ProjectModel} from './project';
import {TagModel} from './tag';

const SCHEMA = new Schema<
  IProjectTemplateDocument,
  IProjectTemplateStaticMethods,
  IProjectTemplateMethods
>({
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
  },
  projects: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'projects',
  },
  tags: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'tags',
  },
  shape: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
});

SCHEMA.static(
  'projectTemplateIdExists',
  async (projectTemplateId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await PROJECTTEMPLATE_MODEL.findById(projectTemplateId, [
        '_id',
      ]);
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
      const foundIds = (await PROJECTTEMPLATE_MODEL.find(
        {_id: {$in: projectTemplateIds}},
        ['_id']
      )) as {_id: mongooseTypes.ObjectId}[];

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
          {projectTemplateIds: projectTemplateIds},
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

// CREATE
SCHEMA.static(
  'createProjectTemplate',
  async (
    input: IProjectTemplateCreateInput
  ): Promise<databaseTypes.IProjectTemplate> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [projects, tags] = await Promise.all([
        PROJECTTEMPLATE_MODEL.validateProjects(input.projects ?? []),
        PROJECTTEMPLATE_MODEL.validateTags(input.tags ?? []),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IProjectTemplateDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        name: input.name,
        projects: projects,
        tags: tags,
        shape: input.shape,
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
      const projectTemplateDocument = (
        await PROJECTTEMPLATE_MODEL.create([resolvedInput], {
          validateBeforeSave: false,
        })
      )[0];
      id = projectTemplateDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the projectTemplate.  See the inner error for additional details',
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
        'An unexpected error has occurred and the projectTemplate may not have been created.  I have no other information to provide.'
      );
  }
);

// READ
SCHEMA.static(
  'getProjectTemplateById',
  async (projectTemplateId: mongooseTypes.ObjectId) => {
    try {
      const projectTemplateDocument = (await PROJECTTEMPLATE_MODEL.findById(
        projectTemplateId
      )
        .populate('projects')
        .populate('tags')
        .populate('shape')
        .lean()) as databaseTypes.IProjectTemplate;
      if (!projectTemplateDocument) {
        throw new error.DataNotFoundError(
          `Could not find a projectTemplate with the _id: ${projectTemplateId}`,
          'projectTemplate_id',
          projectTemplateId
        );
      }
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      delete (projectTemplateDocument as any)['__v'];

      projectTemplateDocument.projects?.forEach(
        (m: any) => delete (m as any)['__v']
      );
      projectTemplateDocument.tags?.forEach(
        (m: any) => delete (m as any)['__v']
      );

      return projectTemplateDocument;
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

      const projectTemplateDocuments = (await PROJECTTEMPLATE_MODEL.find(
        filter,
        null,
        {
          skip: skip,
          limit: itemsPerPage,
        }
      )
        .populate('projects')
        .populate('tags')
        .populate('shape')
        .lean()) as databaseTypes.IProjectTemplate[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      projectTemplateDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
        (doc as any).projects?.forEach((m: any) => delete (m as any)['__v']);
        (doc as any).tags?.forEach((m: any) => delete (m as any)['__v']);
      });

      const retval: IQueryResult<databaseTypes.IProjectTemplate> = {
        results: projectTemplateDocuments,
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
          'An unexpected error occurred while getting the projectTemplates.  See the inner error for additional information',
          'mongoDb',
          'queryProjectTemplates',
          err
        );
    }
  }
);

// UPDATE
SCHEMA.static(
  'updateProjectTemplateWithFilter',
  async (
    filter: Record<string, unknown>,
    projectTemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): Promise<void> => {
    try {
      await PROJECTTEMPLATE_MODEL.validateUpdateObject(projectTemplate);
      const updateDate = new Date();
      const transformedObject: Partial<IProjectTemplateDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      const updateResult = await PROJECTTEMPLATE_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No projectTemplate document with filter: ${filter} was found',
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
          'update projectTemplate',
          {filter: filter, projectTemplate: projectTemplate},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateProjectTemplateById',
  async (
    projectTemplateId: mongooseTypes.ObjectId,
    projectTemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): Promise<databaseTypes.IProjectTemplate> => {
    await PROJECTTEMPLATE_MODEL.updateProjectTemplateWithFilter(
      {_id: projectTemplateId},
      projectTemplate
    );
    return await PROJECTTEMPLATE_MODEL.getProjectTemplateById(
      projectTemplateId
    );
  }
);

// DELETE
SCHEMA.static(
  'deleteProjectTemplateById',
  async (projectTemplateId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await PROJECTTEMPLATE_MODEL.deleteOne({
        _id: projectTemplateId,
      });
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A projectTemplate with a _id: ${projectTemplateId} was not found in the database`,
          '_id',
          projectTemplateId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the projectTemplate from the database. The projectTemplate may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete projectTemplate',
          {_id: projectTemplateId},
          err
        );
    }
  }
);

SCHEMA.static(
  'addProjects',
  async (
    projectTemplateId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'projects',
          projects
        );
      const projectTemplateDocument =
        await PROJECTTEMPLATE_MODEL.findById(projectTemplateId);
      if (!projectTemplateDocument)
        throw new error.DataNotFoundError(
          'A projectTemplateDocument with _id cannot be found',
          'projectTemplate._id',
          projectTemplateId
        );

      const reconciledIds =
        await PROJECTTEMPLATE_MODEL.validateProjects(projects);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // @ts-ignore
        if (
          !projectTemplateDocument.projects.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          // @ts-ignore
          projectTemplateDocument.projects.push(
            p as unknown as databaseTypes.IProject
          );
        }
      });

      if (dirty) await projectTemplateDocument.save();

      return await PROJECTTEMPLATE_MODEL.getProjectTemplateById(
        projectTemplateId
      );
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
  }
);

SCHEMA.static(
  'removeProjects',
  async (
    projectTemplateId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'projects',
          projects
        );
      const projectTemplateDocument =
        await PROJECTTEMPLATE_MODEL.findById(projectTemplateId);
      if (!projectTemplateDocument)
        throw new error.DataNotFoundError(
          'A Document cannot be found',
          '._id',
          projectTemplateId
        );

      const reconciledIds = projects.map((i: any) =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // @ts-ignore
      const updatedProjects = projectTemplateDocument.projects.filter(
        (p: any) => {
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
        }
      );

      if (dirty) {
        // @ts-ignore
        projectTemplateDocument.projects =
          updatedProjects as unknown as databaseTypes.IProject[];
        await projectTemplateDocument.save();
      }

      return await PROJECTTEMPLATE_MODEL.getProjectTemplateById(
        projectTemplateId
      );
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
);

SCHEMA.static(
  'validateProjects',
  async (
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const projectsIds: mongooseTypes.ObjectId[] = [];
    projects.forEach((p: any) => {
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
  }
);
SCHEMA.static(
  'addTags',
  async (
    projectTemplateId: mongooseTypes.ObjectId,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate> => {
    try {
      if (!tags.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'tags',
          tags
        );
      const projectTemplateDocument =
        await PROJECTTEMPLATE_MODEL.findById(projectTemplateId);
      if (!projectTemplateDocument)
        throw new error.DataNotFoundError(
          'A projectTemplateDocument with _id cannot be found',
          'projectTemplate._id',
          projectTemplateId
        );

      const reconciledIds = await PROJECTTEMPLATE_MODEL.validateTags(tags);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // @ts-ignore
        if (
          !projectTemplateDocument.tags.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          // @ts-ignore
          projectTemplateDocument.tags.push(p as unknown as databaseTypes.ITag);
        }
      });

      if (dirty) await projectTemplateDocument.save();

      return await PROJECTTEMPLATE_MODEL.getProjectTemplateById(
        projectTemplateId
      );
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
  }
);

SCHEMA.static(
  'removeTags',
  async (
    projectTemplateId: mongooseTypes.ObjectId,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProjectTemplate> => {
    try {
      if (!tags.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'tags',
          tags
        );
      const projectTemplateDocument =
        await PROJECTTEMPLATE_MODEL.findById(projectTemplateId);
      if (!projectTemplateDocument)
        throw new error.DataNotFoundError(
          'A Document cannot be found',
          '._id',
          projectTemplateId
        );

      const reconciledIds = tags.map((i: any) =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // @ts-ignore
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
        // @ts-ignore
        projectTemplateDocument.tags =
          updatedTags as unknown as databaseTypes.ITag[];
        await projectTemplateDocument.save();
      }

      return await PROJECTTEMPLATE_MODEL.getProjectTemplateById(
        projectTemplateId
      );
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
);

SCHEMA.static(
  'validateTags',
  async (
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const tagsIds: mongooseTypes.ObjectId[] = [];
    tags.forEach((p: any) => {
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
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['projectTemplate'];

const PROJECTTEMPLATE_MODEL = model<
  IProjectTemplateDocument,
  IProjectTemplateStaticMethods
>('projectTemplate', SCHEMA);

export {PROJECTTEMPLATE_MODEL as ProjectTemplateModel};

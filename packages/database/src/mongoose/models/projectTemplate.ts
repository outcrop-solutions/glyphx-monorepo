import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {
  IProjectTemplateMethods,
  IProjectTemplateStaticMethods,
  IProjectTemplateDocument,
} from '../interfaces';
import {error} from '@glyphx/core';
import {ProjectModel} from './project';
import {projectTemplateShapeValidator} from '../validators';
import {IProjectTemplateCreateInput} from '../interfaces/iProjectTemplateCreateInput';
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
  name: {type: String, required: true},
  projects: {
    type: [mongooseTypes.ObjectId],
    required: true,
    default: [],
    ref: 'project',
  },
  tags: {
    type: [mongooseTypes.ObjectId],
    required: true,
    default: [],
    ref: 'tag',
  },
  shape: {
    type: Schema.Types.Mixed,
    required: true,
    validate: projectTemplateShapeValidator,
  },
});

SCHEMA.static(
  'projectTemplateIdExists',
  async (projectTemplateId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await PROJECT_TEMPLATE_MODEL.findById(projectTemplateId, [
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
  async (templateIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await PROJECT_TEMPLATE_MODEL.find(
        {_id: {$in: templateIds}},
        ['_id']
      )) as {_id: mongooseTypes.ObjectId}[];

      templateIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more templateIds cannot be found in the database.',
          'projectTemplate._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the templateIds.  See the inner error for additional information',
          'mongoDb',
          'allProjectIdsExists',
          {templateIds: templateIds},
          err
        );
      }
    }
    return true;
  }
);

SCHEMA.static(
  'getProjectTemplateById',
  async (projectTemplateId: mongooseTypes.ObjectId) => {
    try {
      const projectTemplateDocument = (await PROJECT_TEMPLATE_MODEL.findById(
        projectTemplateId
      )
        .populate('projects')
        .lean()) as databaseTypes.IProjectTemplate;
      if (!projectTemplateDocument) {
        throw new error.DataNotFoundError(
          `Could not find a projectTemplate with the _id: ${projectTemplateId}`,
          'projectTemplate._id',
          projectTemplateId
        );
      }
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      delete (projectTemplateDocument as any)['__v'];
      projectTemplateDocument.projects.forEach(p => delete (p as any)['__v']);

      return projectTemplateDocument;
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while getting the projectTemplate.  See the inner error for additional information',
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
      const count = await PROJECT_TEMPLATE_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find projectTemplates with the filter: ${filter}`,
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

      const projectTemplateDocuments = (await PROJECT_TEMPLATE_MODEL.find(
        filter,
        null,
        {
          skip: skip,
          limit: itemsPerPage,
        }
      )
        .populate('projects')
        .lean()) as databaseTypes.IProjectTemplate[];
      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      projectTemplateDocuments.forEach((doc: any) => {
        delete (doc as any)?.__v;
        doc.projects?.forEach((p: any) => delete (p as any)?.__v);
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

SCHEMA.static(
  'validateProjects',
  async (
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const projectIds: mongooseTypes.ObjectId[] = [];
    projects.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) projectIds.push(p);
      else projectIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await ProjectModel.allProjectIdsExist(projectIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exisit in the database.  See the inner error for additional information',
          'projects',
          projects,
          err
        );
      else throw err;
    }

    return projectIds;
  }
);

SCHEMA.static(
  'validateTags',
  async (
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const tagIds: mongooseTypes.ObjectId[] = [];
    tags.forEach(p => {
      if (p instanceof mongooseTypes.ObjectId) tagIds.push(p);
      else tagIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await TagModel.allTagIdsExist(tagIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more tag ids do not exisit in the database.  See the inner error for additional information',
          'tags',
          tags,
          err
        );
      else throw err;
    }

    return tagIds;
  }
);

SCHEMA.static(
  'createProjectTemplate',
  async (
    input: IProjectTemplateCreateInput
  ): Promise<databaseTypes.IProjectTemplate> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;
    try {
      const [projects, tags] = await Promise.all([
        PROJECT_TEMPLATE_MODEL.validateProjects(input.projects),
        PROJECT_TEMPLATE_MODEL.validateTags(input.tags),
      ]);
      const createDate = new Date();

      const resolvedInput: IProjectTemplateDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        tags: tags,
        name: input.name,
        shape: input.shape,
        projects: projects,
      };
      try {
        await PROJECT_TEMPLATE_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IProjectTemplateDocument',
          resolvedInput,
          err
        );
      }
      const projectTemplateDocument = (
        await PROJECT_TEMPLATE_MODEL.create([resolvedInput], {
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
          'add projectTemplate',
          {},
          err
        );
      }
    }
    if (id) return await PROJECT_TEMPLATE_MODEL.getProjectTemplateById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the project type may not have been created.  I have no other information to provide.'
      );
  }
);

SCHEMA.static(
  'validateUpdateObject',
  (
    projectTemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): void => {
    if (projectTemplate.createdAt) {
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be included in the update set',
        {createdAt: projectTemplate.createdAt}
      );
    }
    if (projectTemplate.updatedAt) {
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be included in the update set',
        {updatedAt: projectTemplate.updatedAt}
      );
    }
    if ((projectTemplate as Record<string, unknown>)['_id']) {
      throw new error.InvalidOperationError(
        'The _id on a projectTemplate is immutable and cannot be changed',
        {_id: (projectTemplate as Record<string, unknown>)['_id']}
      );
    }

    if (projectTemplate.projects?.length) {
      throw new error.InvalidOperationError(
        'Projects cannot be updated directly for a projectTemplate.  Please use the add/remove project functions',
        {projects: projectTemplate.projects}
      );
    }

    if (
      projectTemplate.shape &&
      !projectTemplateShapeValidator(projectTemplate.shape as any)
    ) {
      throw new error.InvalidArgumentError(
        'The value of projectTemplate.shape does not appear to be correctly formatted',
        'projectTemplate.shape',
        projectTemplate.shape
      );
    }
  }
);

SCHEMA.static(
  'updateProjectTemplateWithFilter',
  async (
    filter: Record<string, unknown>,
    projectTemplate: Omit<Partial<databaseTypes.IProjectTemplate>, '_id'>
  ): Promise<void> => {
    try {
      PROJECT_TEMPLATE_MODEL.validateUpdateObject(projectTemplate);
      const updateDate = new Date();
      projectTemplate.updatedAt = updateDate;
      //someone could sneak in an empty array and we do not want to accidently
      //overwrite projects that already exist.
      delete projectTemplate.projects;
      const updateResult = await PROJECT_TEMPLATE_MODEL.updateOne(
        filter,
        projectTemplate
      );

      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          `No projectTemplate document with filter: ${filter} was found`,
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
          `An unexpected error occurred while updating the projectTemplate with filter :${filter}.  See the inner error for additional information`,
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
    await PROJECT_TEMPLATE_MODEL.updateProjectTemplateWithFilter(
      {_id: projectTemplateId},
      projectTemplate
    );
    return await PROJECT_TEMPLATE_MODEL.getProjectTemplateById(
      projectTemplateId
    );
  }
);

SCHEMA.static(
  'deleteProjectTemplateById',
  async (projectTemplateId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await PROJECT_TEMPLATE_MODEL.deleteOne({
        _id: projectTemplateId,
      });
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A project type with an _id: ${projectTemplateId} was not found in the database`,
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
          'You must supply at least one projectId',
          'projects',
          projects
        );
      const projectTemplateDocument = await PROJECT_TEMPLATE_MODEL.findById(
        projectTemplateId
      );
      if (!projectTemplateDocument)
        throw new error.DataNotFoundError(
          `A ProjectTemplate Document with _id : ${projectTemplateId} cannot be found`,
          'projectTemplate._id',
          projectTemplateId
        );

      const reconciledIds = await PROJECT_TEMPLATE_MODEL.validateProjects(
        projects
      );
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !projectTemplateDocument.projects.find(
            progId => progId.toString() === p.toString()
          )
        ) {
          dirty = true;
          projectTemplateDocument.projects.push(
            p as unknown as databaseTypes.IProject
          );
        }
      });

      if (dirty) await projectTemplateDocument.save();

      return await PROJECT_TEMPLATE_MODEL.getProjectTemplateById(
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
          'An unexpected error occurrred while adding the projects. See the innner error for additional information',
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
          'You must supply at least one projectId',
          'projects',
          projects
        );
      const projectTemplateDocument = await PROJECT_TEMPLATE_MODEL.findById(
        projectTemplateId
      );
      if (!projectTemplateDocument)
        throw new error.DataNotFoundError(
          `An ProjectTemplate Document with _id : ${projectTemplateId} cannot be found`,
          'projectTemplate ._id',
          projectTemplateId
        );

      const reconciledIds = projects.map(i =>
        //istanbul ignore next
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedProjects = projectTemplateDocument.projects.filter(p => {
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
        projectTemplateDocument.projects =
          updatedProjects as unknown as databaseTypes.IProject[];
        await projectTemplateDocument.save();
      }

      return await PROJECT_TEMPLATE_MODEL.getProjectTemplateById(
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
          'An unexpected error occurrred while removing the projects. See the innner error for additional information',
          'mongoDb',
          'projectTemplateremoveProjects',
          err
        );
      }
    }
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
          'You must supply at least one projectId',
          'tags',
          tags
        );
      const projectTemplateDocument = await PROJECT_TEMPLATE_MODEL.findById(
        projectTemplateId
      );
      if (!projectTemplateDocument)
        throw new error.DataNotFoundError(
          `A ProjectTemplate Document with _id : ${projectTemplateId} cannot be found`,
          'projectTemplate._id',
          projectTemplateId
        );

      const reconciledIds = await PROJECT_TEMPLATE_MODEL.validateTags(tags);
      let dirty = false;
      reconciledIds.forEach(p => {
        if (
          !projectTemplateDocument.tags.find(
            progId => progId.toString() === p.toString()
          )
        ) {
          dirty = true;
          projectTemplateDocument.tags.push(p as unknown as databaseTypes.ITag);
        }
      });

      if (dirty) await projectTemplateDocument.save();

      return await PROJECT_TEMPLATE_MODEL.getProjectTemplateById(
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
          'An unexpected error occurrred while adding the tags. See the innner error for additional information',
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
          'You must supply at least one projectId',
          'projects',
          tags
        );
      const projectTemplateDocument = await PROJECT_TEMPLATE_MODEL.findById(
        projectTemplateId
      );
      if (!projectTemplateDocument)
        throw new error.DataNotFoundError(
          `An ProjectTemplate Document with _id : ${projectTemplateId} cannot be found`,
          'projectTemplate ._id',
          projectTemplateId
        );

      const reconciledIds = tags.map(i =>
        //istanbul ignore next
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedTags = projectTemplateDocument.tags.filter(p => {
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
        projectTemplateDocument.tags =
          updatedTags as unknown as databaseTypes.ITag[];
        await projectTemplateDocument.save();
      }

      return await PROJECT_TEMPLATE_MODEL.getProjectTemplateById(
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
          'An unexpected error occurrred while removing the projects. See the innner error for additional information',
          'mongoDb',
          'projectTemplate.removeTags',
          err
        );
      }
    }
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['projecttemplate'];

const PROJECT_TEMPLATE_MODEL = model<
  IProjectTemplateDocument,
  IProjectTemplateStaticMethods
>('projecttemplate', SCHEMA);

export {PROJECT_TEMPLATE_MODEL as ProjectTemplateModel};

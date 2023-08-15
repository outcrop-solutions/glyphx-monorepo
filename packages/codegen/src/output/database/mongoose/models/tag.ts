// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {
  ITagDocument,
  ITagCreateInput,
  ITagStaticMethods,
  ITagMethods,
} from '../interfaces';
import {WorkspaceModel} from './workspace';
import {ProjectTemplateModel} from './projectTemplate';
import {ProjectModel} from './project';

const SCHEMA = new Schema<ITagDocument, ITagStaticMethods, ITagMethods>({
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
  workspaces: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'workspaces',
  },
  templates: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'templates',
  },
  projects: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'projects',
  },
  value: {
    type: String,
    required: true,
  },
});

SCHEMA.static(
  'tagIdExists',
  async (tagId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await TAG_MODEL.findById(tagId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the tag.  See the inner error for additional information',
        'mongoDb',
        'tagIdExists',
        {_id: tagId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allTagIdsExist',
  async (tagIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await TAG_MODEL.find({_id: {$in: tagIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      tagIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more tagIds cannot be found in the database.',
          'tag._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the tagIds.  See the inner error for additional information',
          'mongoDb',
          'allTagIdsExists',
          {tagIds: tagIds},
          err
        );
      }
    }
    return true;
  }
);

SCHEMA.static(
  'validateUpdateObject',
  async (tag: Omit<Partial<databaseTypes.ITag>, '_id'>): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a tag with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (tag.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: tag.createdAt}
      );
    if (tag.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: tag.updatedAt}
      );
    if ((tag as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The tag._id is immutable and cannot be changed',
        {_id: (tag as Record<string, unknown>)['_id']}
      );
  }
);

// CREATE
SCHEMA.static(
  'createTag',
  async (input: ITagCreateInput): Promise<databaseTypes.ITag> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [workspaces, templates, projects] = await Promise.all([
        TAG_MODEL.validateWorkspaces(input.workspaces ?? []),
        TAG_MODEL.validateTemplates(input.templates ?? []),
        TAG_MODEL.validateProjects(input.projects ?? []),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: ITagDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        workspaces: workspaces,
        templates: templates,
        projects: projects,
        value: input.value,
      };
      try {
        await TAG_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'ITagDocument',
          resolvedInput,
          err
        );
      }
      const tagDocument = (
        await TAG_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = tagDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the tag.  See the inner error for additional details',
          'mongoDb',
          'addTag',
          {},
          err
        );
      }
    }
    if (id) return await TAG_MODEL.getTagById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the tag may not have been created.  I have no other information to provide.'
      );
  }
);

// READ
SCHEMA.static('getTagById', async (tagId: mongooseTypes.ObjectId) => {
  try {
    const tagDocument = (await TAG_MODEL.findById(tagId)
      .populate('workspaces')
      .populate('templates')
      .populate('projects')
      .lean()) as databaseTypes.ITag;
    if (!tagDocument) {
      throw new error.DataNotFoundError(
        `Could not find a tag with the _id: ${tagId}`,
        'tag_id',
        tagId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (tagDocument as any)['__v'];

    tagDocument.workspaces?.forEach((m: any) => delete (m as any)['__v']);
    tagDocument.templates?.forEach((m: any) => delete (m as any)['__v']);
    tagDocument.projects?.forEach((m: any) => delete (m as any)['__v']);

    return tagDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getTagById',
        err
      );
  }
});

SCHEMA.static(
  'queryTags',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await TAG_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find tags with the filter: ${filter}`,
          'queryTags',
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

      const tagDocuments = (await TAG_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('workspaces')
        .populate('templates')
        .populate('projects')
        .lean()) as databaseTypes.ITag[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      tagDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
        (doc as any).workspaces?.forEach((m: any) => delete (m as any)['__v']);
        (doc as any).templates?.forEach((m: any) => delete (m as any)['__v']);
        (doc as any).projects?.forEach((m: any) => delete (m as any)['__v']);
      });

      const retval: IQueryResult<databaseTypes.ITag> = {
        results: tagDocuments,
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
          'An unexpected error occurred while getting the tags.  See the inner error for additional information',
          'mongoDb',
          'queryTags',
          err
        );
    }
  }
);

// UPDATE
SCHEMA.static(
  'updateTagWithFilter',
  async (
    filter: Record<string, unknown>,
    tag: Omit<Partial<databaseTypes.ITag>, '_id'>
  ): Promise<void> => {
    try {
      await TAG_MODEL.validateUpdateObject(tag);
      const updateDate = new Date();
      const transformedObject: Partial<ITagDocument> & Record<string, unknown> =
        {updatedAt: updateDate};
      const updateResult = await TAG_MODEL.updateOne(filter, transformedObject);
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No tag document with filter: ${filter} was found',
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
          'update tag',
          {filter: filter, tag: tag},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateTagById',
  async (
    tagId: mongooseTypes.ObjectId,
    tag: Omit<Partial<databaseTypes.ITag>, '_id'>
  ): Promise<databaseTypes.ITag> => {
    await TAG_MODEL.updateTagWithFilter({_id: tagId}, tag);
    return await TAG_MODEL.getTagById(tagId);
  }
);

// DELETE
SCHEMA.static(
  'deleteTagById',
  async (tagId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await TAG_MODEL.deleteOne({_id: tagId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A tag with a _id: ${tagId} was not found in the database`,
          '_id',
          tagId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the tag from the database. The tag may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete tag',
          {_id: tagId},
          err
        );
    }
  }
);

SCHEMA.static(
  'addWorkspaces',
  async (
    tagId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag> => {
    try {
      if (!workspaces.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'workspaces',
          workspaces
        );
      const tagDocument = await TAG_MODEL.findById(tagId);
      if (!tagDocument)
        throw new error.DataNotFoundError(
          'A tagDocument with _id cannot be found',
          'tag._id',
          tagId
        );

      const reconciledIds = await TAG_MODEL.validateWorkspaces(workspaces);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (
          !tagDocument.workspaces.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tagDocument.workspaces.push(p as unknown as databaseTypes.IWorkspace);
        }
      });

      if (dirty) await tagDocument.save();

      return await TAG_MODEL.getTagById(tagId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the Workspaces. See the inner error for additional information',
          'mongoDb',
          'tag.addWorkspaces',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeWorkspaces',
  async (
    tagId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag> => {
    try {
      if (!workspaces.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'workspaces',
          workspaces
        );
      const tagDocument = await TAG_MODEL.findById(tagId);
      if (!tagDocument)
        throw new error.DataNotFoundError(
          'A Document cannot be found',
          '._id',
          tagId
        );

      const reconciledIds = workspaces.map((i: any) =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const updatedWorkspaces = tagDocument.workspaces.filter((p: any) => {
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        tagDocument.workspaces =
          updatedWorkspaces as unknown as databaseTypes.IWorkspace[];
        await tagDocument.save();
      }

      return await TAG_MODEL.getTagById(tagId);
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
          'tag.removeWorkspaces',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateWorkspaces',
  async (
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const workspacesIds: mongooseTypes.ObjectId[] = [];
    workspaces.forEach((p: any) => {
      if (p instanceof mongooseTypes.ObjectId) workspacesIds.push(p);
      else workspacesIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await WorkspaceModel.allWorkspaceIdsExist(workspacesIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'workspaces',
          workspaces,
          err
        );
      else throw err;
    }

    return workspacesIds;
  }
);
SCHEMA.static(
  'addTemplates',
  async (
    tagId: mongooseTypes.ObjectId,
    projectTemplates: (
      | databaseTypes.IProjectTemplate
      | mongooseTypes.ObjectId
    )[]
  ): Promise<databaseTypes.ITag> => {
    try {
      if (!projectTemplates.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'projectTemplates',
          projectTemplates
        );
      const tagDocument = await TAG_MODEL.findById(tagId);
      if (!tagDocument)
        throw new error.DataNotFoundError(
          'A tagDocument with _id cannot be found',
          'tag._id',
          tagId
        );

      const reconciledIds = await TAG_MODEL.validateTemplates(projectTemplates);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (
          !tagDocument.templates.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tagDocument.templates.push(
            p as unknown as databaseTypes.IProjectTemplate
          );
        }
      });

      if (dirty) await tagDocument.save();

      return await TAG_MODEL.getTagById(tagId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the ProjectTemplates. See the inner error for additional information',
          'mongoDb',
          'tag.addProjectTemplates',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeTemplates',
  async (
    tagId: mongooseTypes.ObjectId,
    projectTemplates: (
      | databaseTypes.IProjectTemplate
      | mongooseTypes.ObjectId
    )[]
  ): Promise<databaseTypes.ITag> => {
    try {
      if (!projectTemplates.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'projectTemplates',
          projectTemplates
        );
      const tagDocument = await TAG_MODEL.findById(tagId);
      if (!tagDocument)
        throw new error.DataNotFoundError(
          'A Document cannot be found',
          '._id',
          tagId
        );

      const reconciledIds = projectTemplates.map((i: any) =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const updatedProjectTemplates = tagDocument.projectTemplates.filter(
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        tagDocument.projectTemplates =
          updatedProjectTemplates as unknown as databaseTypes.IProjectTemplate[];
        await tagDocument.save();
      }

      return await TAG_MODEL.getTagById(tagId);
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
          'tag.removeProjectTemplates',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateTemplates',
  async (
    projectTemplates: (
      | databaseTypes.IProjectTemplate
      | mongooseTypes.ObjectId
    )[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const projectTemplatesIds: mongooseTypes.ObjectId[] = [];
    projectTemplates.forEach((p: any) => {
      if (p instanceof mongooseTypes.ObjectId) projectTemplatesIds.push(p);
      else projectTemplatesIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await ProjectTemplateModel.allProjectTemplateIdsExist(
        projectTemplatesIds
      );
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'projectTemplates',
          projectTemplates,
          err
        );
      else throw err;
    }

    return projectTemplatesIds;
  }
);
SCHEMA.static(
  'addProjects',
  async (
    tagId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'projects',
          projects
        );
      const tagDocument = await TAG_MODEL.findById(tagId);
      if (!tagDocument)
        throw new error.DataNotFoundError(
          'A tagDocument with _id cannot be found',
          'tag._id',
          tagId
        );

      const reconciledIds = await TAG_MODEL.validateProjects(projects);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (
          !tagDocument.projects.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          tagDocument.projects.push(p as unknown as databaseTypes.IProject);
        }
      });

      if (dirty) await tagDocument.save();

      return await TAG_MODEL.getTagById(tagId);
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
          'tag.addProjects',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeProjects',
  async (
    tagId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'projects',
          projects
        );
      const tagDocument = await TAG_MODEL.findById(tagId);
      if (!tagDocument)
        throw new error.DataNotFoundError(
          'A Document cannot be found',
          '._id',
          tagId
        );

      const reconciledIds = projects.map((i: any) =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const updatedProjects = tagDocument.projects.filter((p: any) => {
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        tagDocument.projects =
          updatedProjects as unknown as databaseTypes.IProject[];
        await tagDocument.save();
      }

      return await TAG_MODEL.getTagById(tagId);
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
          'tag.removeProjects',
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

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['tag'];

const TAG_MODEL = model<ITagDocument, ITagStaticMethods>('tag', SCHEMA);

export {TAG_MODEL as TagModel};

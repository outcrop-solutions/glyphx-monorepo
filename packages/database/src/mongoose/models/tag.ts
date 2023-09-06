import {IQueryResult, databaseTypes} from 'types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {ITagMethods, ITagStaticMethods, ITagDocument} from '../interfaces';
import {error} from 'core';
import {ProjectModel} from './project';
import {WorkspaceModel} from './workspace';
import {ProjectTemplateModel} from './projectTemplate';

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
  value: {type: String, required: true},
  workspaces: {
    type: [mongooseTypes.ObjectId],
    required: true,
    default: [],
    ref: 'workspace',
  },
  projects: {
    type: [mongooseTypes.ObjectId],
    required: true,
    default: [],
    ref: 'project',
  },
  templates: {
    type: [mongooseTypes.ObjectId],
    required: true,
    default: [],
    ref: 'projecttemplate',
  },
});

SCHEMA.static('tagIdExists', async (tagId: mongooseTypes.ObjectId): Promise<boolean> => {
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
});

SCHEMA.static('allTagIdsExist', async (tagIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
  try {
    const notFoundIds: mongooseTypes.ObjectId[] = [];
    const foundIds = (await TAG_MODEL.find({_id: {$in: tagIds}}, ['_id'])) as {_id: mongooseTypes.ObjectId}[];

    tagIds.forEach((id) => {
      if (!foundIds.find((fid) => fid._id.toString() === id.toString())) notFoundIds.push(id);
    });

    if (notFoundIds.length) {
      throw new error.DataNotFoundError('One or more tagIds cannot be found in the database.', 'tag._id', notFoundIds);
    }
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the tagIds.  See the inner error for additional information',
        'mongoDb',
        'allProjectIdsExists',
        {tagIds: tagIds},
        err
      );
    }
  }
  return true;
});

SCHEMA.static('getTagById', async (tagId: mongooseTypes.ObjectId) => {
  try {
    const tagDocument = (await TAG_MODEL.findById(tagId)
      .populate('workspaces')
      .populate('projects')
      .populate('templates')
      .lean()) as databaseTypes.ITag;
    if (!tagDocument) {
      throw new error.DataNotFoundError(`Could not find a tag with the _id: ${tagId}`, 'tag._id', tagId);
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (tagDocument as any)['__v'];
    tagDocument.workspaces.forEach((p) => delete (p as any)['__v']);
    tagDocument.projects.forEach((p) => delete (p as any)['__v']);
    tagDocument.templates.forEach((p) => delete (p as any)['__v']);

    return tagDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the tag.  See the inner error for additional information',
        'mongoDb',
        'getTagById',
        err
      );
  }
});

SCHEMA.static('queryTags', async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
  try {
    const count = await TAG_MODEL.count(filter);

    if (!count) {
      throw new error.DataNotFoundError(`Could not find tags with the filter: ${filter}`, 'queryTags', filter);
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
      .populate('projects')
      .populate('templates')
      .lean()) as databaseTypes.ITag[];
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    tagDocuments.forEach((doc: any) => {
      delete (doc as any)?.__v;
      doc.workspaces?.forEach((p: any) => delete (p as any)?.__v);
      doc.projects?.forEach((p: any) => delete (p as any)?.__v);
      doc.templates?.forEach((p: any) => delete (p as any)?.__v);
    });

    const retval: IQueryResult<databaseTypes.ITag> = {
      results: tagDocuments,
      numberOfItems: count,
      page: page,
      itemsPerPage: itemsPerPage,
    };

    return retval;
  } catch (err) {
    if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the tags.  See the inner error for additional information',
        'mongoDb',
        'queryTags',
        err
      );
  }
});

SCHEMA.static(
  'validateProjects',
  async (projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]> => {
    const projectIds: mongooseTypes.ObjectId[] = [];
    projects.forEach((p) => {
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
  'validateWorkspaces',
  async (workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]> => {
    const workspaceIds: mongooseTypes.ObjectId[] = [];
    workspaces.forEach((p) => {
      if (p instanceof mongooseTypes.ObjectId) workspaceIds.push(p);
      else workspaceIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await WorkspaceModel.allWorkspaceIdsExist(workspaceIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exisit in the database.  See the inner error for additional information',
          'workspaces',
          workspaces,
          err
        );
      else throw err;
    }

    return workspaceIds;
  }
);

SCHEMA.static(
  'validateTemplates',
  async (templates: (databaseTypes.IProjectTemplate | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]> => {
    const templateIds: mongooseTypes.ObjectId[] = [];
    templates.forEach((p) => {
      if (p instanceof mongooseTypes.ObjectId) templateIds.push(p);
      else templateIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await ProjectTemplateModel.allProjectTemplateIdsExist(templateIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more project ids do not exisit in the database.  See the inner error for additional information',
          'templates',
          templates,
          err
        );
      else throw err;
    }

    return templateIds;
  }
);

SCHEMA.static('createTag', async (input: Omit<databaseTypes.ITag, '_id'>): Promise<databaseTypes.ITag> => {
  let id: undefined | mongooseTypes.ObjectId = undefined;
  try {
    //istanbul ignore next
    const [workspaces, projects, templates] = await Promise.all([
      TAG_MODEL.validateWorkspaces(input.workspaces ?? []),
      TAG_MODEL.validateProjects(input.projects ?? []),
      TAG_MODEL.validateTemplates(input.templates ?? []),
    ]);

    const createDate = new Date();

    const resolvedInput: ITagDocument = {
      createdAt: createDate,
      updatedAt: createDate,
      value: input.value,
      projects: projects,
      workspaces: workspaces,
      templates: templates,
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
      await TAG_MODEL.create([resolvedInput], {
        validateBeforeSave: false,
      })
    )[0];
    id = tagDocument._id;
  } catch (err) {
    if (err instanceof error.DataValidationError) throw err;
    else {
      throw new error.DatabaseOperationError(
        'An Unexpected Error occurred while adding the tag.  See the inner error for additional details',
        'mongoDb',
        'add tag',
        {},
        err
      );
    }
  }
  if (id) return await TAG_MODEL.getTagById(id);
  else
    throw new error.UnexpectedError(
      'An unexpected error has occurred and the project type may not have been created.  I have no other information to provide.'
    );
});

SCHEMA.static('validateUpdateObject', (tag: Omit<Partial<databaseTypes.ITag>, '_id'>): void => {
  if (tag.createdAt) {
    throw new error.InvalidOperationError(
      'The createdAt date is set internally and cannot be included in the update set',
      {createdAt: tag.createdAt}
    );
  }
  if (tag.updatedAt) {
    throw new error.InvalidOperationError(
      'The updatedAt date is set internally and cannot be included in the update set',
      {updatedAt: tag.updatedAt}
    );
  }
  if ((tag as Record<string, unknown>)['_id']) {
    throw new error.InvalidOperationError('The _id on a tag is immutable and cannot be changed', {
      _id: (tag as Record<string, unknown>)['_id'],
    });
  }

  if (tag.workspaces?.length) {
    throw new error.InvalidOperationError(
      'Workspaces cannot be updated directly for a tag.  Please use the add/remove workspace functions',
      {workspaces: tag.workspaces}
    );
  }
  if (tag.projects?.length) {
    throw new error.InvalidOperationError(
      'Projects cannot be updated directly for a tag.  Please use the add/remove project functions',
      {projects: tag.projects}
    );
  }
  if (tag.templates?.length) {
    throw new error.InvalidOperationError(
      'Templates cannot be updated directly for a tag.  Please use the add/remove templates functions',
      {templates: tag.templates}
    );
  }
});

SCHEMA.static(
  'updateTagWithFilter',
  async (filter: Record<string, unknown>, tag: Omit<Partial<databaseTypes.ITag>, '_id'>): Promise<void> => {
    try {
      TAG_MODEL.validateUpdateObject(tag);
      const updateDate = new Date();
      tag.updatedAt = updateDate;
      //someone could sneak in an empty array and we do not want to accidently
      //overwrite projects that already exist.
      delete tag.projects;
      const updateResult = await TAG_MODEL.updateOne(filter, tag);

      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(`No tag document with filter: ${filter} was found`, 'filter', filter);
      }
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) throw err;
      else
        throw new error.DatabaseOperationError(
          `An unexpected error occurred while updating the tag with filter :${filter}.  See the inner error for additional information`,
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
  async (tagId: mongooseTypes.ObjectId, tag: Omit<Partial<databaseTypes.ITag>, '_id'>): Promise<databaseTypes.ITag> => {
    await TAG_MODEL.updateTagWithFilter({_id: tagId}, tag);
    return await TAG_MODEL.getTagById(tagId);
  }
);

SCHEMA.static('deleteTagById', async (tagId: mongooseTypes.ObjectId): Promise<void> => {
  try {
    const results = await TAG_MODEL.deleteOne({
      _id: tagId,
    });
    if (results.deletedCount !== 1)
      throw new error.InvalidArgumentError(
        `A project type with an _id: ${tagId} was not found in the database`,
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
});

SCHEMA.static(
  'addProjects',
  async (
    tagId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError('You must supply at least one projectId', 'projects', projects);
      const tagDocument = await TAG_MODEL.findById(tagId);
      if (!tagDocument)
        throw new error.DataNotFoundError(`A Tag Document with _id : ${tagId} cannot be found`, 'tag._id', tagId);

      const reconciledIds = await TAG_MODEL.validateProjects(projects);
      let dirty = false;
      reconciledIds.forEach((p) => {
        if (!tagDocument.projects.find((progId: any) => progId.toString() === p.toString())) {
          dirty = true;
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
          'An unexpected error occurrred while adding the projects. See the innner error for additional information',
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
        throw new error.InvalidArgumentError('You must supply at least one projectId', 'projects', projects);
      const tagDocument = await TAG_MODEL.findById(tagId);
      if (!tagDocument)
        throw new error.DataNotFoundError(`An Tag Document with _id : ${tagId} cannot be found`, 'tag ._id', tagId);

      const reconciledIds = projects.map((i) =>
        //istanbul ignore next
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedProjects = tagDocument.projects.filter((p) => {
        let retval = true;
        if (reconciledIds.find((r) => r.toString() === (p as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        tagDocument.projects = updatedProjects as unknown as databaseTypes.IProject[];
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
          'An unexpected error occurrred while removing the projects. See the innner error for additional information',
          'mongoDb',
          'tagremoveProjects',
          err
        );
      }
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
        throw new error.InvalidArgumentError('You must supply at least one projectId', 'workspaces', workspaces);
      const tagDocument = await TAG_MODEL.findById(tagId);
      if (!tagDocument)
        throw new error.DataNotFoundError(`A Tag Document with _id : ${tagId} cannot be found`, 'tag._id', tagId);

      const reconciledIds = await TAG_MODEL.validateWorkspaces(workspaces);
      let dirty = false;
      reconciledIds.forEach((p) => {
        if (!tagDocument.workspaces.find((wId: any) => wId.toString() === p.toString())) {
          dirty = true;
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
          'An unexpected error occurrred while adding the workspaces. See the innner error for additional information',
          'mongoDb',
          'tag.addProjects',
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
        throw new error.InvalidArgumentError('You must supply at least one projectId', 'workspaces', workspaces);
      const tagDocument = await TAG_MODEL.findById(tagId);
      if (!tagDocument)
        throw new error.DataNotFoundError(`An Tag Document with _id : ${tagId} cannot be found`, 'tag ._id', tagId);

      const reconciledIds = workspaces.map((i) =>
        //istanbul ignore next
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedWorkspaces = tagDocument.workspaces.filter((p: any) => {
        let retval = true;
        if (reconciledIds.find((r) => r.toString() === (p as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        tagDocument.workspaces = updatedWorkspaces as unknown as databaseTypes.IWorkspace[];
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
          'An unexpected error occurrred while removing the workspaces. See the innner error for additional information',
          'mongoDb',
          'tag.removeWorkspaces',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'addTemplates',
  async (
    tagId: mongooseTypes.ObjectId,
    templates: (databaseTypes.IProjectTemplate | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag> => {
    try {
      if (!templates.length)
        throw new error.InvalidArgumentError('You must supply at least one projectId', 'projects', templates);
      const tagDocument = await TAG_MODEL.findById(tagId);
      if (!tagDocument)
        throw new error.DataNotFoundError(`A Tag Document with _id : ${tagId} cannot be found`, 'tag._id', tagId);

      const reconciledIds = await TAG_MODEL.validateTemplates(templates);
      let dirty = false;
      reconciledIds.forEach((p) => {
        if (!tagDocument.templates.find((tagId: any) => tagId.toString() === p.toString())) {
          dirty = true;
          tagDocument.templates.push(p as unknown as databaseTypes.IProjectTemplate);
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
          'An unexpected error occurrred while adding the projects. See the innner error for additional information',
          'mongoDb',
          'tag.addProjects',
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
    templates: (databaseTypes.IProjectTemplate | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ITag> => {
    try {
      if (!templates.length)
        throw new error.InvalidArgumentError('You must supply at least one templateId', 'templates', templates);
      const tagDocument = await TAG_MODEL.findById(tagId);
      if (!tagDocument)
        throw new error.DataNotFoundError(`An Tag Document with _id : ${tagId} cannot be found`, 'tag ._id', tagId);

      const reconciledIds = templates.map((i) =>
        //istanbul ignore next
        i instanceof mongooseTypes.ObjectId ? i : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      const updatedTemplates = tagDocument.templates.filter((p) => {
        let retval = true;
        if (reconciledIds.find((r) => r.toString() === (p as unknown as mongooseTypes.ObjectId).toString())) {
          dirty = true;
          retval = false;
        }

        return retval;
      });

      if (dirty) {
        tagDocument.templates = updatedTemplates as unknown as databaseTypes.IProjectTemplate[];
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
          'An unexpected error occurrred while removing the projects. See the innner error for additional information',
          'mongoDb',
          'tagremoveProjects',
          err
        );
      }
    }
  }
);

// define the object that holds Mongoose models
const MODELS = mongoose.connection.models as {[index: string]: Model<any>};

delete MODELS['tag'];

const TAG_MODEL = model<ITagDocument, ITagStaticMethods>('tag', SCHEMA);

export {TAG_MODEL as TagModel};

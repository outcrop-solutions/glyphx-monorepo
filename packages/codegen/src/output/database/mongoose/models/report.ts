// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import mongoose, {Types as mongooseTypes, Schema, model, Model} from 'mongoose';
import {error} from '@glyphx/core';
import {
  IReportDocument,
  IReportCreateInput,
  IReportStaticMethods,
  IReportMethods,
} from '../interfaces';
import {CommentModel} from './comment';
import {UserModel} from './user';
import {WorkspaceModel} from './workspace';
import {ProjectModel} from './project';

const SCHEMA = new Schema<
  IReportDocument,
  IReportStaticMethods,
  IReportMethods
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
  comments: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'comments',
  },
  author: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'user',
  },
  workspace: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'workspace',
  },
  projects: {
    type: [Schema.Types.ObjectId],
    required: true,
    default: [],
    ref: 'projects',
  },
});

SCHEMA.static(
  'reportIdExists',
  async (reportId: mongooseTypes.ObjectId): Promise<boolean> => {
    let retval = false;
    try {
      const result = await REPORT_MODEL.findById(reportId, ['_id']);
      if (result) retval = true;
    } catch (err) {
      throw new error.DatabaseOperationError(
        'an unexpected error occurred while trying to find the report.  See the inner error for additional information',
        'mongoDb',
        'reportIdExists',
        {_id: reportId},
        err
      );
    }
    return retval;
  }
);

SCHEMA.static(
  'allReportIdsExist',
  async (reportIds: mongooseTypes.ObjectId[]): Promise<boolean> => {
    try {
      const notFoundIds: mongooseTypes.ObjectId[] = [];
      const foundIds = (await REPORT_MODEL.find({_id: {$in: reportIds}}, [
        '_id',
      ])) as {_id: mongooseTypes.ObjectId}[];

      reportIds.forEach(id => {
        if (!foundIds.find(fid => fid._id.toString() === id.toString()))
          notFoundIds.push(id);
      });

      if (notFoundIds.length) {
        throw new error.DataNotFoundError(
          'One or more reportIds cannot be found in the database.',
          'report._id',
          notFoundIds
        );
      }
    } catch (err) {
      if (err instanceof error.DataNotFoundError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'an unexpected error occurred while trying to find the reportIds.  See the inner error for additional information',
          'mongoDb',
          'allReportIdsExists',
          {reportIds: reportIds},
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
    report: Omit<Partial<databaseTypes.IReport>, '_id'>
  ): Promise<void> => {
    const idValidator = async (
      id: mongooseTypes.ObjectId,
      objectType: string,
      validator: (id: mongooseTypes.ObjectId) => Promise<boolean>
    ) => {
      const result = await validator(id);
      if (!result) {
        throw new error.InvalidOperationError(
          `A ${objectType} with an id: ${id} cannot be found.  You cannot update a report with an invalid ${objectType} id`,
          {objectType: objectType, id: id}
        );
      }
    };

    const tasks: Promise<void>[] = [];

    if (report.author)
      tasks.push(
        idValidator(
          report.author._id as mongooseTypes.ObjectId,
          'User',
          UserModel.userIdExists
        )
      );
    if (report.workspace)
      tasks.push(
        idValidator(
          report.workspace._id as mongooseTypes.ObjectId,
          'Workspace',
          WorkspaceModel.workspaceIdExists
        )
      );

    if (tasks.length) await Promise.all(tasks); //will throw an exception if anything fails.

    if (report.createdAt)
      throw new error.InvalidOperationError(
        'The createdAt date is set internally and cannot be altered externally',
        {createdAt: report.createdAt}
      );
    if (report.updatedAt)
      throw new error.InvalidOperationError(
        'The updatedAt date is set internally and cannot be altered externally',
        {updatedAt: report.updatedAt}
      );
    if ((report as Record<string, unknown>)['_id'])
      throw new error.InvalidOperationError(
        'The report._id is immutable and cannot be changed',
        {_id: (report as Record<string, unknown>)['_id']}
      );
  }
);

// CREATE
SCHEMA.static(
  'createReport',
  async (input: IReportCreateInput): Promise<databaseTypes.IReport> => {
    let id: undefined | mongooseTypes.ObjectId = undefined;

    try {
      const [comments, author, workspace, projects] = await Promise.all([
        REPORT_MODEL.validateComments(input.comments ?? []),
        REPORT_MODEL.validateAuthor(input.author),
        REPORT_MODEL.validateWorkspace(input.workspace),
        REPORT_MODEL.validateProjects(input.projects ?? []),
      ]);

      const createDate = new Date();

      //istanbul ignore next
      const resolvedInput: IReportDocument = {
        createdAt: createDate,
        updatedAt: createDate,
        comments: comments,
        author: author,
        workspace: workspace,
        projects: projects,
      };
      try {
        await REPORT_MODEL.validate(resolvedInput);
      } catch (err) {
        throw new error.DataValidationError(
          'An error occurred while validating the document before creating it.  See the inner error for additional information',
          'IReportDocument',
          resolvedInput,
          err
        );
      }
      const reportDocument = (
        await REPORT_MODEL.create([resolvedInput], {validateBeforeSave: false})
      )[0];
      id = reportDocument._id;
    } catch (err) {
      if (err instanceof error.DataValidationError) throw err;
      else {
        throw new error.DatabaseOperationError(
          'An Unexpected Error occurred while adding the report.  See the inner error for additional details',
          'mongoDb',
          'addReport',
          {},
          err
        );
      }
    }
    if (id) return await REPORT_MODEL.getReportById(id);
    else
      throw new error.UnexpectedError(
        'An unexpected error has occurred and the report may not have been created.  I have no other information to provide.'
      );
  }
);

// READ
SCHEMA.static('getReportById', async (reportId: mongooseTypes.ObjectId) => {
  try {
    const reportDocument = (await REPORT_MODEL.findById(reportId)
      .populate('comments')
      .populate('author')
      .populate('workspace')
      .populate('projects')
      .lean()) as databaseTypes.IReport;
    if (!reportDocument) {
      throw new error.DataNotFoundError(
        `Could not find a report with the _id: ${reportId}`,
        'report_id',
        reportId
      );
    }
    //this is added by mongoose, so we will want to remove it before returning the document
    //to the user.
    delete (reportDocument as any)['__v'];

    reportDocument.comments?.forEach((m: any) => delete (m as any)['__v']);
    delete (reportDocument as any).author?.['__v'];
    delete (reportDocument as any).workspace?.['__v'];
    reportDocument.projects?.forEach((m: any) => delete (m as any)['__v']);

    return reportDocument;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) throw err;
    else
      throw new error.DatabaseOperationError(
        'An unexpected error occurred while getting the project.  See the inner error for additional information',
        'mongoDb',
        'getReportById',
        err
      );
  }
});

SCHEMA.static(
  'queryReports',
  async (filter: Record<string, unknown> = {}, page = 0, itemsPerPage = 10) => {
    try {
      const count = await REPORT_MODEL.count(filter);

      if (!count) {
        throw new error.DataNotFoundError(
          `Could not find reports with the filter: ${filter}`,
          'queryReports',
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

      const reportDocuments = (await REPORT_MODEL.find(filter, null, {
        skip: skip,
        limit: itemsPerPage,
      })
        .populate('comments')
        .populate('author')
        .populate('workspace')
        .populate('projects')
        .lean()) as databaseTypes.IReport[];

      //this is added by mongoose, so we will want to remove it before returning the document
      //to the user.
      reportDocuments.forEach((doc: any) => {
        delete (doc as any)['__v'];
        (doc as any).comments?.forEach((m: any) => delete (m as any)['__v']);
        delete (doc as any).author?.['__v'];
        delete (doc as any).workspace?.['__v'];
        (doc as any).projects?.forEach((m: any) => delete (m as any)['__v']);
      });

      const retval: IQueryResult<databaseTypes.IReport> = {
        results: reportDocuments,
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
          'An unexpected error occurred while getting the reports.  See the inner error for additional information',
          'mongoDb',
          'queryReports',
          err
        );
    }
  }
);

// UPDATE
SCHEMA.static(
  'updateReportWithFilter',
  async (
    filter: Record<string, unknown>,
    report: Omit<Partial<databaseTypes.IReport>, '_id'>
  ): Promise<void> => {
    try {
      await REPORT_MODEL.validateUpdateObject(report);
      const updateDate = new Date();
      const transformedObject: Partial<IReportDocument> &
        Record<string, unknown> = {updatedAt: updateDate};
      for (const key in report) {
        const value = (report as Record<string, any>)[key];
        if (key === 'author')
          transformedObject.author =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        if (key === 'workspace')
          transformedObject.workspace =
            value instanceof mongooseTypes.ObjectId
              ? value
              : (value._id as mongooseTypes.ObjectId);
        else transformedObject[key] = value;
      }
      const updateResult = await REPORT_MODEL.updateOne(
        filter,
        transformedObject
      );
      if (updateResult.modifiedCount !== 1) {
        throw new error.InvalidArgumentError(
          'No report document with filter: ${filter} was found',
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
          'update report',
          {filter: filter, report: report},
          err
        );
    }
  }
);

SCHEMA.static(
  'updateReportById',
  async (
    reportId: mongooseTypes.ObjectId,
    report: Omit<Partial<databaseTypes.IReport>, '_id'>
  ): Promise<databaseTypes.IReport> => {
    await REPORT_MODEL.updateReportWithFilter({_id: reportId}, report);
    return await REPORT_MODEL.getReportById(reportId);
  }
);

// DELETE
SCHEMA.static(
  'deleteReportById',
  async (reportId: mongooseTypes.ObjectId): Promise<void> => {
    try {
      const results = await REPORT_MODEL.deleteOne({_id: reportId});
      if (results.deletedCount !== 1)
        throw new error.InvalidArgumentError(
          `A report with a _id: ${reportId} was not found in the database`,
          '_id',
          reportId
        );
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) throw err;
      else
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while deleteing the report from the database. The report may still exist.  See the inner error for additional information',
          'mongoDb',
          'delete report',
          {_id: reportId},
          err
        );
    }
  }
);

SCHEMA.static(
  'addComments',
  async (
    reportId: mongooseTypes.ObjectId,
    comments: (databaseTypes.IComment | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport> => {
    try {
      if (!comments.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'comments',
          comments
        );
      const reportDocument = await REPORT_MODEL.findById(reportId);
      if (!reportDocument)
        throw new error.DataNotFoundError(
          'A reportDocument with _id cannot be found',
          'report._id',
          reportId
        );

      const reconciledIds = await REPORT_MODEL.validateComments(comments);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (
          !reportDocument.comments.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          reportDocument.comments.push(p as unknown as databaseTypes.IComment);
        }
      });

      if (dirty) await reportDocument.save();

      return await REPORT_MODEL.getReportById(reportId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the Comments. See the inner error for additional information',
          'mongoDb',
          'report.addComments',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeComments',
  async (
    reportId: mongooseTypes.ObjectId,
    comments: (databaseTypes.IComment | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport> => {
    try {
      if (!comments.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'comments',
          comments
        );
      const reportDocument = await REPORT_MODEL.findById(reportId);
      if (!reportDocument)
        throw new error.DataNotFoundError(
          'A Document cannot be found',
          '._id',
          reportId
        );

      const reconciledIds = comments.map((i: any) =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const updatedComments = reportDocument.comments.filter((p: any) => {
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
        reportDocument.comments =
          updatedComments as unknown as databaseTypes.IComment[];
        await reportDocument.save();
      }

      return await REPORT_MODEL.getReportById(reportId);
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
          'report.removeComments',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateComments',
  async (
    comments: (databaseTypes.IComment | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]> => {
    const commentsIds: mongooseTypes.ObjectId[] = [];
    comments.forEach((p: any) => {
      if (p instanceof mongooseTypes.ObjectId) commentsIds.push(p);
      else commentsIds.push(p._id as mongooseTypes.ObjectId);
    });
    try {
      await CommentModel.allCommentIdsExist(commentsIds);
    } catch (err) {
      if (err instanceof error.DataNotFoundError)
        throw new error.DataValidationError(
          'One or more ids do not exist in the database. See the inner error for additional information',
          'comments',
          comments,
          err
        );
      else throw err;
    }

    return commentsIds;
  }
);

SCHEMA.static(
  'addAuthor',
  async (
    reportId: mongooseTypes.ObjectId,
    author: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IReport> => {
    try {
      if (!author)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'author',
          author
        );
      const reportDocument = await REPORT_MODEL.findById(reportId);

      if (!reportDocument)
        throw new error.DataNotFoundError(
          'A reportDocument with _id cannot be found',
          'report._id',
          reportId
        );

      const reconciledId = await REPORT_MODEL.validateAuthor(author);

      if (reportDocument.author?.toString() !== reconciledId.toString()) {
        const reconciledId = await REPORT_MODEL.validateAuthor(author);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        reportDocument.author = reconciledId;
        await reportDocument.save();
      }

      return await REPORT_MODEL.getReportById(reportId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the author. See the inner error for additional information',
          'mongoDb',
          'report.addAuthor',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeAuthor',
  async (reportId: mongooseTypes.ObjectId): Promise<databaseTypes.IReport> => {
    try {
      const reportDocument = await REPORT_MODEL.findById(reportId);
      if (!reportDocument)
        throw new error.DataNotFoundError(
          'A reportDocument with _id cannot be found',
          'report._id',
          reportId
        );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reportDocument.author = undefined;
      await reportDocument.save();

      return await REPORT_MODEL.getReportById(reportId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing the author. See the inner error for additional information',
          'mongoDb',
          'report.removeAuthor',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateAuthor',
  async (
    input: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const authorId =
      input instanceof mongooseTypes.ObjectId
        ? input
        : (input._id as mongooseTypes.ObjectId);
    if (!(await UserModel.userIdExists(authorId))) {
      throw new error.InvalidArgumentError(
        `The author: ${authorId} does not exist`,
        'authorId',
        authorId
      );
    }
    return authorId;
  }
);

SCHEMA.static(
  'addWorkspace',
  async (
    reportId: mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IReport> => {
    try {
      if (!workspace)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'workspace',
          workspace
        );
      const reportDocument = await REPORT_MODEL.findById(reportId);

      if (!reportDocument)
        throw new error.DataNotFoundError(
          'A reportDocument with _id cannot be found',
          'report._id',
          reportId
        );

      const reconciledId = await REPORT_MODEL.validateWorkspace(workspace);

      if (reportDocument.workspace?.toString() !== reconciledId.toString()) {
        const reconciledId = await REPORT_MODEL.validateWorkspace(workspace);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        reportDocument.workspace = reconciledId;
        await reportDocument.save();
      }

      return await REPORT_MODEL.getReportById(reportId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while adding the workspace. See the inner error for additional information',
          'mongoDb',
          'report.addWorkspace',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeWorkspace',
  async (reportId: mongooseTypes.ObjectId): Promise<databaseTypes.IReport> => {
    try {
      const reportDocument = await REPORT_MODEL.findById(reportId);
      if (!reportDocument)
        throw new error.DataNotFoundError(
          'A reportDocument with _id cannot be found',
          'report._id',
          reportId
        );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reportDocument.workspace = undefined;
      await reportDocument.save();

      return await REPORT_MODEL.getReportById(reportId);
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.DataValidationError ||
        err instanceof error.InvalidArgumentError
      )
        throw err;
      else {
        throw new error.DatabaseOperationError(
          'An unexpected error occurred while removing the workspace. See the inner error for additional information',
          'mongoDb',
          'report.removeWorkspace',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'validateWorkspace',
  async (
    input: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId> => {
    const workspaceId =
      input instanceof mongooseTypes.ObjectId
        ? input
        : (input._id as mongooseTypes.ObjectId);
    if (!(await WorkspaceModel.workspaceIdExists(workspaceId))) {
      throw new error.InvalidArgumentError(
        `The workspace: ${workspaceId} does not exist`,
        'workspaceId',
        workspaceId
      );
    }
    return workspaceId;
  }
);
SCHEMA.static(
  'addProjects',
  async (
    reportId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'projects',
          projects
        );
      const reportDocument = await REPORT_MODEL.findById(reportId);
      if (!reportDocument)
        throw new error.DataNotFoundError(
          'A reportDocument with _id cannot be found',
          'report._id',
          reportId
        );

      const reconciledIds = await REPORT_MODEL.validateProjects(projects);
      let dirty = false;
      reconciledIds.forEach((p: any) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (
          !reportDocument.projects.find(
            (id: any) => id.toString() === p.toString()
          )
        ) {
          dirty = true;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          reportDocument.projects.push(p as unknown as databaseTypes.IProject);
        }
      });

      if (dirty) await reportDocument.save();

      return await REPORT_MODEL.getReportById(reportId);
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
          'report.addProjects',
          err
        );
      }
    }
  }
);

SCHEMA.static(
  'removeProjects',
  async (
    reportId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport> => {
    try {
      if (!projects.length)
        throw new error.InvalidArgumentError(
          'You must supply at least one id',
          'projects',
          projects
        );
      const reportDocument = await REPORT_MODEL.findById(reportId);
      if (!reportDocument)
        throw new error.DataNotFoundError(
          'A Document cannot be found',
          '._id',
          reportId
        );

      const reconciledIds = projects.map((i: any) =>
        i instanceof mongooseTypes.ObjectId
          ? i
          : (i._id as mongooseTypes.ObjectId)
      );
      let dirty = false;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const updatedProjects = reportDocument.projects.filter((p: any) => {
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
        reportDocument.projects =
          updatedProjects as unknown as databaseTypes.IProject[];
        await reportDocument.save();
      }

      return await REPORT_MODEL.getReportById(reportId);
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
          'report.removeProjects',
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

delete MODELS['report'];

const REPORT_MODEL = model<IReportDocument, IReportStaticMethods>(
  'report',
  SCHEMA
);

export {REPORT_MODEL as ReportModel};

// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import {IReportMethods} from './iReportMethods';
import {IReportCreateInput} from './iReportCreateInput';

export interface IReportStaticMethods
  extends Model<databaseTypes.IReport, {}, IReportMethods> {
  reportIdExists(reportId: mongooseTypes.ObjectId): Promise<boolean>;
  allReportIdsExist(reportIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createReport(input: IReportCreateInput): Promise<databaseTypes.IReport>;
  getReportById(
    reportId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IReport>;
  queryReports(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IReport>>;
  updateReportWithFilter(
    filter: Record<string, unknown>,
    report: Omit<Partial<databaseTypes.IReport>, '_id'>
  ): Promise<databaseTypes.IReport>;
  updateReportById(
    reportId: mongooseTypes.ObjectId,
    report: Omit<Partial<databaseTypes.IReport>, '_id'>
  ): Promise<databaseTypes.IReport>;
  deleteReportById(reportId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    report: Omit<Partial<databaseTypes.IReport>, '_id'>
  ): Promise<void>;
  addComments(
    reportId: mongooseTypes.ObjectId,
    comments: (databaseTypes.IComment | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport>;
  removeComments(
    reportId: mongooseTypes.ObjectId,
    comments: (databaseTypes.IComment | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport>;
  validateComments(
    comments: (databaseTypes.IComment | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  addAuthor(
    reportId: mongooseTypes.ObjectId,
    user: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IReport>;
  removeAuthor(
    reportId: mongooseTypes.ObjectId,
    user: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IReport>;
  validateAuthor(
    user: databaseTypes.IUser | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  addWorkspace(
    reportId: mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IReport>;
  removeWorkspace(
    reportId: mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IReport>;
  validateWorkspace(
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  addProjects(
    reportId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport>;
  removeProjects(
    reportId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IReport>;
  validateProjects(
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
}

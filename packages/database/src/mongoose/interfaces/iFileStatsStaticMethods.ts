// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IFileStatsMethods} from './iFileStatsMethods';
import {IFileStatsCreateInput} from './iFileStatsCreateInput';

export interface IFileStatsStaticMethods extends Model<databaseTypes.IFileStats, {}, IFileStatsMethods> {
  fileStatsIdExists(fileStatsId: mongooseTypes.ObjectId): Promise<boolean>;
  allFileStatsIdsExist(fileStatsIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createFileStats(input: IFileStatsCreateInput): Promise<databaseTypes.IFileStats>;
  getFileStatsById(fileStatsId: string): Promise<databaseTypes.IFileStats>;
  queryFileStats(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IFileStats>>;
  updateFileStatsWithFilter(
    filter: Record<string, unknown>,
    fileStats: Omit<Partial<databaseTypes.IFileStats>, '_id'>
  ): Promise<databaseTypes.IFileStats>;
  updateFileStatsById(
    fileStatsId: string,
    fileStats: Omit<Partial<databaseTypes.IFileStats>, '_id'>
  ): Promise<databaseTypes.IFileStats>;
  deleteFileStatsById(fileStatsId: string): Promise<void>;
  validateUpdateObject(fileStats: Omit<Partial<databaseTypes.IFileStats>, '_id'>): Promise<void>;
  addColumns(fileStatsId: string, columns: (databaseTypes.Column | string)[]): Promise<databaseTypes.IFileStats>;
  removeColumns(fileStatsId: string, columns: (databaseTypes.Column | string)[]): Promise<databaseTypes.IFileStats>;
  validateColumns(columns: (databaseTypes.Column | string)[]): Promise<mongooseTypes.ObjectId[]>;
}

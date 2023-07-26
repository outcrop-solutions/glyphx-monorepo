import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { ISessionMethods } from './iSessionMethods';
import { ISessionCreateInput } from './iSessionCreateInput';

export interface ISessionStaticMethods extends Model<databaseTypes.ISession, {}, ISessionMethods> {
  sessionIdExists(sessionId: mongooseTypes.ObjectId): Promise<boolean>;
  allSessionIdsExist(sessionIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createSession(input: ISessionCreateInput): Promise<databaseTypes.ISession>;
  getSessionById(sessionId: mongooseTypes.ObjectId): Promise<databaseTypes.ISession>;
  querySessions(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.ISession>>;
  updateSessionWithFilter(
    filter: Record<string, unknown>,
    session: Omit<Partial<databaseTypes.ISession>, '_id'>
  ): Promise<databaseTypes.ISession>;
  updateSessionById(
    sessionId: mongooseTypes.ObjectId,
    session: Omit<Partial<databaseTypes.ISession>, '_id'>
  ): Promise<databaseTypes.ISession>;
  deleteSessionById(sessionId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(session: Omit<Partial<databaseTypes.ISession>, '_id'>): Promise<void>;
  addUsers(
    sessionId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ISession>;
  removeUsers(
    sessionId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ISession>;
  validateUsers(users: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;
}

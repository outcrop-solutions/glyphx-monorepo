import {Types as mongooseTypes, Model} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {ISessionMethods} from './iSessionMethods';
export interface ISessionStaticMethods
  extends Model<databaseTypes.ISession, {}, ISessionMethods> {
  sessionIdExists(sessionId: mongooseTypes.ObjectId): Promise<boolean>;
  allSessionIdsExist(sessionIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createSession(
    input: Omit<databaseTypes.ISession, '_id'>
  ): Promise<databaseTypes.ISession>;
  getSessionById(
    sessionId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.ISession>;
  updateSessionWithFilter(
    filter: Record<string, unknown>,
    session: Omit<Partial<databaseTypes.ISession>, '_id'>
  ): Promise<void>;
  updateSessionById(
    sessionId: mongooseTypes.ObjectId,
    session: Omit<Partial<databaseTypes.ISession>, '_id'>
  ): Promise<databaseTypes.ISession>;
  deleteSessionById(sessionId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    session: Omit<Partial<databaseTypes.ISession>, '_id'>
  ): Promise<void>;
}

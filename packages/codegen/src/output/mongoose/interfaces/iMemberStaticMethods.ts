import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { IMemberMethods } from './iMemberMethods';
import { IMemberCreateInput } from './iMemberCreateInput';

export interface IMemberStaticMethods extends Model<databaseTypes.IMember, {}, IMemberMethods> {
  memberIdExists(memberId: mongooseTypes.ObjectId): Promise<boolean>;
  allMemberIdsExist(memberIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createMember(input: IMemberCreateInput): Promise<databaseTypes.IMember>;
  getMemberById(memberId: mongooseTypes.ObjectId): Promise<databaseTypes.IMember>;
  queryMembers(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IMember>>;
  updateMemberWithFilter(
    filter: Record<string, unknown>,
    member: Omit<Partial<databaseTypes.IMember>, '_id'>
  ): Promise<databaseTypes.IMember>;
  updateMemberById(
    memberId: mongooseTypes.ObjectId,
    member: Omit<Partial<databaseTypes.IMember>, '_id'>
  ): Promise<databaseTypes.IMember>;
  deleteMemberById(memberId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(member: Omit<Partial<databaseTypes.IMember>, '_id'>): Promise<void>;
  addUsers(
    memberId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember>;
  removeUsers(
    memberId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember>;
  validateUsers(users: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;

  addUsers(
    memberId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember>;
  removeUsers(
    memberId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember>;
  validateUsers(users: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;

  addWorkspaces(
    memberId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember>;
  removeWorkspaces(
    memberId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember>;
  validateWorkspaces(
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;

  addProjects(
    memberId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember>;
  removeProjects(
    memberId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember>;
  validateProjects(projects: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;
}

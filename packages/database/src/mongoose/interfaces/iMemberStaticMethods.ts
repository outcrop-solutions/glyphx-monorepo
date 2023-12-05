// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IMemberMethods} from './iMemberMethods';
import {IMemberCreateInput} from './iMemberCreateInput';

export interface IMemberStaticMethods extends Model<databaseTypes.IMember, {}, IMemberMethods> {
  memberIdExists(memberId: mongooseTypes.ObjectId): Promise<boolean>;
  allMemberIdsExist(memberIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createMember(input: IMemberCreateInput): Promise<databaseTypes.IMember>;
  getMemberById(memberId: string): Promise<databaseTypes.IMember>;
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
    memberId: string,
    member: Omit<Partial<databaseTypes.IMember>, '_id'>
  ): Promise<databaseTypes.IMember>;
  deleteMemberById(memberId: string): Promise<void>;
  validateUpdateObject(member: Omit<Partial<databaseTypes.IMember>, '_id'>): Promise<void>;
  addMember(memberId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IMember>;
  removeMember(memberId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IMember>;
  validateMember(user: databaseTypes.IUser | string): Promise<mongooseTypes.ObjectId>;
  addInvitedBy(memberId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IMember>;
  removeInvitedBy(memberId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IMember>;
  validateInvitedBy(user: databaseTypes.IUser | string): Promise<mongooseTypes.ObjectId>;
  addWorkspace(memberId: string, workspace: databaseTypes.IWorkspace | string): Promise<databaseTypes.IMember>;
  removeWorkspace(memberId: string, workspace: databaseTypes.IWorkspace | string): Promise<databaseTypes.IMember>;
  validateWorkspace(workspace: databaseTypes.IWorkspace | string): Promise<mongooseTypes.ObjectId>;
  addProject(memberId: string, project: databaseTypes.IProject | string): Promise<databaseTypes.IMember>;
  removeProject(memberId: string, project: databaseTypes.IProject | string): Promise<databaseTypes.IMember>;
  validateProject(project: databaseTypes.IProject | string): Promise<mongooseTypes.ObjectId>;
}

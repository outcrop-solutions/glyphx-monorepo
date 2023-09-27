import {Types as mongooseTypes, Model} from 'mongoose';
import {databaseTypes, IQueryResult} from 'types';
import {IMemberMethods} from './iMemberMethods';
import {IMemberCreateInput} from './iMemberCreateInput';

export interface IMemberStaticMethods extends Model<databaseTypes.IMember, {}, IMemberMethods> {
  memberIdExists(memberId: mongooseTypes.ObjectId): Promise<boolean>;
  memberExists(
    memberEmail: string,
    type: databaseTypes.constants.MEMBERSHIP_TYPE,
    workspaceId: string,
    projectId?: string
  ): Promise<boolean>;
  allMemberIdsExist(memberIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createWorkspaceMember(input: IMemberCreateInput): Promise<databaseTypes.IMember>;
  createProjectMember(input: IMemberCreateInput): Promise<databaseTypes.IMember>;
  getMemberById(memberId: string, hasProject?: boolean): Promise<databaseTypes.IMember>;
  queryMembers(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IMember>>;
  updateMemberById(id: string, member: Partial<databaseTypes.IMember>): Promise<databaseTypes.IMember>;
  deleteMemberById(id: string): Promise<void>;
  validateWorkspace(input: databaseTypes.IWorkspace | string): Promise<string>;
  validateWorkspaceMember(
    member: databaseTypes.IUser | string,
    workspace: databaseTypes.IWorkspace | string
  ): Promise<string>;
  validateProjectMember(
    member: databaseTypes.IUser | string,
    workspace: databaseTypes.IWorkspace | string,
    project: databaseTypes.IProject | string
  ): Promise<string>;
  validateProject(input: databaseTypes.IProject | string): Promise<string>;
  updateMemberWithFilter(
    filter: Record<string, unknown>,
    member: Partial<databaseTypes.IMember>
  ): Promise<databaseTypes.IMember>;
  validateUpdateObject(member: Omit<Partial<databaseTypes.IMember>, '_id'>): Promise<boolean>;
}

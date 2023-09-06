import {Types as mongooseTypes, Model} from 'mongoose';
import {databaseTypes, IQueryResult} from 'types';
import {IMemberMethods} from './iMemberMethods';
import {IMemberCreateInput} from './iMemberCreateInput';

export interface IMemberStaticMethods extends Model<databaseTypes.IMember, {}, IMemberMethods> {
  memberIdExists(memberId: mongooseTypes.ObjectId): Promise<boolean>;
  memberExists(
    memberEmail: string,
    type: databaseTypes.constants.MEMBERSHIP_TYPE,
    workspaceId: mongooseTypes.ObjectId,
    projectId?: mongooseTypes.ObjectId
  ): Promise<boolean>;
  allMemberIdsExist(memberIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createWorkspaceMember(input: IMemberCreateInput): Promise<databaseTypes.IMember>;
  createProjectMember(input: IMemberCreateInput): Promise<databaseTypes.IMember>;
  getMemberById(memberId: mongooseTypes.ObjectId, hasProject?: boolean): Promise<databaseTypes.IMember>;
  queryMembers(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IMember>>;
  updateMemberById(id: mongooseTypes.ObjectId, member: Partial<databaseTypes.IMember>): Promise<databaseTypes.IMember>;
  deleteMemberById(id: mongooseTypes.ObjectId): Promise<void>;
  validateWorkspace(input: databaseTypes.IWorkspace | mongooseTypes.ObjectId): Promise<mongooseTypes.ObjectId>;
  validateWorkspaceMember(
    member: databaseTypes.IUser | mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  validateProjectMember(
    member: databaseTypes.IUser | mongooseTypes.ObjectId,
    workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId,
    project: databaseTypes.IProject | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  validateProject(input: databaseTypes.IProject | mongooseTypes.ObjectId): Promise<mongooseTypes.ObjectId>;
  updateMemberWithFilter(
    filter: Record<string, unknown>,
    member: Partial<databaseTypes.IMember>
  ): Promise<databaseTypes.IMember>;
  validateUpdateObject(member: Omit<Partial<databaseTypes.IMember>, '_id'>): Promise<boolean>;
}

import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {IMemberMethods} from './iMemberMethods';
import {IMemberCreateInput} from './iMemberCreateInput';

export interface IMemberStaticMethods
  extends Model<databaseTypes.IMember, {}, IMemberMethods> {
  memberIdExists(memberId: mongooseTypes.ObjectId): Promise<boolean>;
  allMemberIdsExist(memberIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createMember(input: IMemberCreateInput): Promise<databaseTypes.IMember>;
  getMemberById(memberId: mongooseTypes.ObjectId): Promise<databaseTypes.IMember>;
  queryMembers(filter?: Record<string, unknown>, page?: number, itemsPerPage?: number): Promise<IQueryResult<databaseTypes.IMember>>;
  updateMemberWithFilter(filter: Record<string, unknown>, member: Omit<Partial<databaseTypes.IMember>, '_id'>): Promise<databaseTypes.IMember>;
  updateMemberById(memberId: mongooseTypes.ObjectId, member: Omit<Partial<databaseTypes.IMember>, '_id'>): Promise<databaseTypes.IMember>;
  deleteMemberById(memberId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(member: Omit<Partial<databaseTypes.IMember>, '_id'>): Promise<void>;
      addMember(
        memberId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IMember>;
      removeMember(
        memberId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IMember>;
      validateMember(
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
          addInvitedBy(
        memberId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IMember>;
      removeInvitedBy(
        memberId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IMember>;
      validateInvitedBy(
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
          addWorkspace(
        memberId: mongooseTypes.ObjectId, 
        workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IMember>;
      removeWorkspace(
        memberId: mongooseTypes.ObjectId, 
        workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IMember>;
      validateWorkspace(
        workspace: databaseTypes.IWorkspace | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
          addProject(
        memberId: mongooseTypes.ObjectId, 
        project: databaseTypes.IProject | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IMember>;
      removeProject(
        memberId: mongooseTypes.ObjectId, 
        project: databaseTypes.IProject | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IMember>;
      validateProject(
        project: databaseTypes.IProject | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
    }

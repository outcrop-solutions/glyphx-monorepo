import {Types as mongooseTypes, Model} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {IMemberMethods} from './iMemberMethods';

export interface IMemberStaticMethods
  extends Model<databaseTypes.IMember, {}, IMemberMethods> {
  memberIdExists(memberId: mongooseTypes.ObjectId): Promise<boolean>;
  allMemberIdsExist(memberIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createMember(input: databaseTypes.IMember): Promise<databaseTypes.IMember>;
  getMemberById(
    memberId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IMember>;
  getMembers(filter: Record<string, unknown>): Promise<databaseTypes.IMember[]>;
  updateMemberById(
    id: mongooseTypes.ObjectId,
    member: Partial<databaseTypes.IMember>
  ): Promise<databaseTypes.IMember>;
  deleteMemberById(id: mongooseTypes.ObjectId): Promise<void>;
  updateMemberWithFilter(
    filter: Record<string, unknown>,
    member: Partial<databaseTypes.IMember>
  ): Promise<databaseTypes.IMember>;
  validateUpdateObject(
    member: Omit<Partial<databaseTypes.IMember>, '_id'>
  ): boolean;
}

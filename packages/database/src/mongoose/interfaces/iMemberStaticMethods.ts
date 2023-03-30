import {Types as mongooseTypes, Model} from 'mongoose';
import {database as databaseTypes, IQueryResult} from '@glyphx/types';
import {IMemberMethods} from './iMemberMethods';
import {IMemberCreateInput} from './iMemberCreateInput';

export interface IMemberStaticMethods
  extends Model<databaseTypes.IMember, {}, IMemberMethods> {
  memberIdExists(memberId: mongooseTypes.ObjectId): Promise<boolean>;
  memberEmailExists(memberEmail: string): Promise<boolean>;
  allMemberIdsExist(memberIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createMember(input: IMemberCreateInput): Promise<databaseTypes.IMember>;
  getMemberById(
    memberId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IMember>;
  queryMembers(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IMember>>;
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

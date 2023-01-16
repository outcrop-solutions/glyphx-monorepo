import mongoose, {Types as mongooseTypes, Model} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {IOrganizationMethods} from './iOrganizationMethods';
export interface IOrganizationStaticMethods
  extends Model<databaseTypes.IOrganization, {}, IOrganizationMethods> {
  organizationIdExists(
    organizationId: mongooseTypes.ObjectId
  ): Promise<boolean>;
  allOrganizationIdsExist(
    organizationIds: mongooseTypes.ObjectId[]
  ): Promise<boolean>;
  createOrganization(
    input: Omit<databaseTypes.IOrganization, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<databaseTypes.IOrganization>;
  getOrganizationById(
    organizationId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IOrganization>;
  updateOrganizationByFilter(
    filter: Record<string, unknown>,
    input: Partial<databaseTypes.IOrganization>
  ): Promise<void>;
  updateOrganizationById(
    id: mongooseTypes.ObjectId,
    input: Partial<databaseTypes.IOrganization>
  ): Promise<databaseTypes.IOrganization>;
  deleteOrganizationById(organizationId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    input: Partial<databaseTypes.IOrganization>
  ): Promise<boolean>;
  validateMembers(
    members: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateProjects(
    members: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
}

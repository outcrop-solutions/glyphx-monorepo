// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectTemplateDocument
  extends Omit<databaseTypes.IProjectTemplate, 'projects' | 'tags'> {
  projects: mongooseTypes.ObjectId[];
  tags: mongooseTypes.ObjectId[];
}
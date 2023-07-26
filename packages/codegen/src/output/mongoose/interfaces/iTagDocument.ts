import { database as databaseTypes } from '@glyphx/types';
import { Types as mongooseTypes } from 'mongoose';

export interface ITagCreateInput extends Omit<databaseTypes.ITag> {}

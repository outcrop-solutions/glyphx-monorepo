// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IDocumentDocument
  extends Omit<databaseTypes.IDocument, 'presence' | 'annotations' | 'thresholds' | 'configs'> {
  presence: mongooseTypes.ObjectId[];
  annotations: mongooseTypes.ObjectId[];
  thresholds: mongooseTypes.ObjectId[];
  configs: mongooseTypes.ObjectId[];
}

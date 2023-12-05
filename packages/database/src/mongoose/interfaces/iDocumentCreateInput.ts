// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IDocumentCreateInput
  extends Omit<
    databaseTypes.IDocument,
    '_id' | 'createdAt' | 'updatedAt' | 'presence' | 'annotations' | 'thresholds' | 'configs'
  > {
  presence: (string | databaseTypes.IPresence)[];
  annotations: (string | databaseTypes.IAnnotation)[];
  thresholds: (string | databaseTypes.IThreshold)[];
  configs: (string | databaseTypes.IModelConfig)[];
}

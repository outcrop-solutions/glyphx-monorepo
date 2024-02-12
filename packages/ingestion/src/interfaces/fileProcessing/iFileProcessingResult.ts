import {FILE_PROCESSING_STATUS} from '../../util/constants';
import {IFileProcessingError} from './iFileProcessingError';
import {IJoinTableDefinition} from './iJoinTableDefinition';
import {fileIngestionTypes} from 'types';

export interface IFileProcessingResult {
  status: FILE_PROCESSING_STATUS;
  fileInformation: fileIngestionTypes.IFileStats[];
  fileProcessingErrors: IFileProcessingError[];
  joinInformation: IJoinTableDefinition[];
  viewName: string;
  info?: Record<any, any>;
}

import {FILE_PROCESSING_STATUS} from '@util/constants';
import {IFileProcessingError} from './iFileProcessingError';
import {IJoinTableDefinition} from './iJoinTableDefinition';
import {fileIngestion} from '@glyphx/types';

export interface IFileProcessingResult {
  status: FILE_PROCESSING_STATUS;
  fileInformation: fileIngestion.IFileStats[];
  fileProcessingErrors: IFileProcessingError[];
  joinInformation: IJoinTableDefinition[];
  viewName: string;
}

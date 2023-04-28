import {IFileStats} from '../../../fileIngestion';
/**
 * Renderable list of matching file stats
 */
export interface IMatchingFileStats {
  newFile: IFileStats;
  existingFile: IFileStats;
}

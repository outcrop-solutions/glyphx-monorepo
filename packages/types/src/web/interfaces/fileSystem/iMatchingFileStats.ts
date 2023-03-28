import {IFileStats} from '../../../fileIngestion';
/**
 * Renderable list of matching file stats
 */
export interface IMatchingFileStats {
  new: IFileStats;
  existing: IFileStats;
}

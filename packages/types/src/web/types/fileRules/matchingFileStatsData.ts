import {FILE_OPERATION} from '../../../fileIngestion/constants';
import {COLLISION_CASE} from '../../constants';
/**
 * Renderable list of matching file stats
 */
export type MatchingFileStatsData =
  | {
      newFile: string;
      existingFile: string;
      type: COLLISION_CASE;
      operations: FILE_OPERATION[];
    }[]
  | false;

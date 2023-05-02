import {File} from 'buffer';
import {FILE_OPERATION} from '../../../fileIngestion/constants';
import {COLLISION_CASE} from '../../constants';
import {IClientSidePayload} from '../../interfaces';
/**
 * Renderable list of matching file stats
 */
export type MatchingFileStatsData =
  | {
      collisions: {
        newFile: string;
        existingFile: string;
        type: COLLISION_CASE;
        operations: FILE_OPERATION[];
      }[];
      payload: IClientSidePayload;
      acceptedFiles: File[];
    }
  | false;

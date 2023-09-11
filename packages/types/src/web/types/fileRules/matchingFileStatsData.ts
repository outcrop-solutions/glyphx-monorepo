import {IClientSidePayload} from '../../interfaces';
import {Collision} from './collision';
/**
 * Renderable list of matching file stats
 */
export type MatchingFileStatsData =
  | {
      collisions: Collision[];
      payload: IClientSidePayload;
      acceptedFiles: Blob[];
    }
  | false;

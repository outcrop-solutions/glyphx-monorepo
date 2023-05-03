import {FILE_OPERATION} from '../../../fileIngestion/constants';
import {COLLISION_CASE} from '../../constants';

export type Collision = {
  newFile: string;
  existingFile: string;
  type: COLLISION_CASE;
  operations: FILE_OPERATION[];
};

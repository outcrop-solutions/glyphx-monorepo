import {ISdtPosition} from './iSdtPosition';
import {ISdtRotation} from './iSdtRotation';
import {ISdtWorldSize} from './iSdtWorldSize';
import {ISdtGridLine} from './iSdtGridline';

export interface ISdtBaseObject {
  Position: ISdtPosition;
  Rotation: ISdtRotation;
  WorldSize: ISdtWorldSize;
  GridLines: ISdtGridLine;
  '@_type': string;
  '@_default': string;
}

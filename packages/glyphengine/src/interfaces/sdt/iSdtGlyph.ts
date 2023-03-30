import {ISdtGlyphPosition} from './iSdtGlyphPosition';
import {ISdtGlyphRotation} from './iSdtGlyphRotation';
import {ISdtGlyphScale} from './iSdtGlyphScale';
import {ISdtGlyphColor} from './iSdtGlyphColor';
import {ISdtGlyphTag} from './iSdtGlyphTag';
import {ISdtGlyphDescription} from './iSdtGlyphDescription';
import {ISdtGlyphRotationRate} from './iSdtGlyphRotationRate';
import {ISdtGlyphGeometry} from './iSdtGlyphGeometry';
import {ISdtGlyphTopology} from './iSdtGlyphTopology';
import {ISdtGlyphUrl} from './iSdtGlyphUrl';

export interface ISdtGlyph {
  Position: ISdtGlyphPosition;
  Rotation: ISdtGlyphRotation;
  Scale: ISdtGlyphScale;
  Color: ISdtGlyphColor;
  Tag: ISdtGlyphTag;
  Description: ISdtGlyphDescription;
  RotationRate: ISdtGlyphRotationRate;
  Geometry: ISdtGlyphGeometry;
  VirtualTopology: ISdtGlyphTopology;
  URL: ISdtGlyphUrl;
  '@_label': string;
  '@_merge': string;
  '@_id': string;
}

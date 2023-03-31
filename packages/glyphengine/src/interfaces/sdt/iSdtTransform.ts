import {ISdtBaseObject} from './iSdtBaseObject';
import {ISdtDatasource} from './iSdtDatasource';
import {ISdtGlyph} from './iSdtGlyph';
import {ISdtDefaults} from './iSdtDefaults';
import {ISdtSceneProperties} from './iSdtSceneProperties';
import type {ISdtInputField} from './iSdtInputField';
import {ISdtElasticField} from './iSdtElasticField';

export interface ISdtTransform {
  BaseObjects: {
    BaseObject: ISdtBaseObject;
  };
  Datasources: {Datasource: ISdtDatasource};
  Glyphs: {Glyph: ISdtGlyph};
  Defaults: ISdtDefaults;
  SceneProperties: ISdtSceneProperties;
  FieldGroups: string;
  InputFields: {InputField: ISdtInputField[]};
  ElasticList: ISdtElasticField[];
  FieldPropertiesList: string;
  '@_id': string;
  '@_Timestamp': string;
}

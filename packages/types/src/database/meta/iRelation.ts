import {RELATION_TYPE} from './relationType';

export interface IRelation {
  type: RELATION_TYPE;
  sourceTable: string;
  referenceTable: string;
}

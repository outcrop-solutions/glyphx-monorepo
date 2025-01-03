import {RELATION_TYPE} from './relationType';

export interface IProperty {
  name: string;
  type: string;
  isRequired: boolean;
  isProtected: boolean;
  isRelation: boolean;
  default?: any;
  relationType?: RELATION_TYPE;
  enumValues?: string[];
  schemaProperties?: IProperty[];
  referenceTable?: string;
  cascadeOnDelete?: boolean;
  cascadeOnUpdate?: boolean;
  unique?: boolean;
  duplicates?: number;
}

import {IProperty} from './iProperty';
import {IRelation} from './iRelation';

export interface ITable {
  name: string;
  path: string; // Directory path to the file that represents this table
  properties: IProperty[]; // members of the interface
  relationships: IRelation[]; // table references
}

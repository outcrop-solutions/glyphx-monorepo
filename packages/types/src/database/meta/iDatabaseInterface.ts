import {IProperty} from './iProperty';
import {IRelation} from './iRelation';

export interface IDatabaseInterface {
  properties: IProperty[];
  relationships: IRelation[];
}

import {IProperty} from './iProperty';
import {IRole} from './iRole';

export interface ITable {
  name: string; //lowercase name with leading I stripped if it exists for ccircular reference check
  path: string; // Directory path to the file that represents this table for debugging and testing
  properties: IProperty[]; // members of the interface
  isPublic: boolean; // defaults to false, determines whether authentication is configured on business layer method [false === 'authenticated']
  roles?: IRole[]; // controls which roles can execute which business layer methods
}

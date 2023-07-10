import {IDatabaseInterface} from './iDatabaseInterface';

export interface ITable {
  name: string;
  path: string; // Directory path to the file that represents this table
  interface: IDatabaseInterface; // The actual data interface of this table
}

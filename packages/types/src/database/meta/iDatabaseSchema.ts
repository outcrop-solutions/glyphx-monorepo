import {ITable} from './iTable';

export interface IDatabaseSchema {
  tables: ITable[];
  filePath?: string;
}

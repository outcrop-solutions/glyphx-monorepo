// THIS CODE WAS AUTOMATICALLY GENERATED
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {IFileStatsDocument} from '../interfaces';
const UNIQUE_KEY = v4().replaceAll('-', '');
const RANDOM_NUMBER = Math.random();

export const MOCK_FILESTATS = {
  id: 'id',
  fileName: 'fileName',
  tableName: 'tableName',
  numberOfRows: 'numberOfRows',
  numberOfColumns: 'numberOfColumns',
  columns: [],
  fileSize: 'fileSize',
  dataGrid: {},
  open: 'open',
  selected: 'selected',
} as unknown as IFileStatsDocument;

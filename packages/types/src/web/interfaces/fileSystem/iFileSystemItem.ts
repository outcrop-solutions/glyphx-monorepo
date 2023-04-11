import {IFileStats} from '../../../fileIngestion';
import {IRenderableDataGrid} from './iRenderableDataGrid';

export interface IFileSystemItem extends IFileStats {
  dataGrid: IRenderableDataGrid;
  open: boolean;
}

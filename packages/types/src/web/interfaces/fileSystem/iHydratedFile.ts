import {IFileStats} from '../../../fileIngestion';
import {IRenderableDataGrid} from './iRenderableDataGrid';

export interface IHydratedFile extends IFileStats {
  selected: boolean | undefined;
  open: boolean | undefined;
  dataGrid: IRenderableDataGrid | undefined;
}

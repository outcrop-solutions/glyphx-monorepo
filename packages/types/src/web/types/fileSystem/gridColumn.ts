import {FIELD_TYPE} from '../../../fileIngestion/constants';

/**
 * Differs fromm IColumn for styling purposes in react-data-grid
 * */
export type GridColumn = {
  key: string;
  dataType: FIELD_TYPE;
  width: number;
  resizable: boolean;
  sortable: boolean;
};
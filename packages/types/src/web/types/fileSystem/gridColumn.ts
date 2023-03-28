import {FIELD_TYPE} from '../../../fileIngestion/constants';

/**
 * Differs fromm IColumn for styling purposes in react-data-grid
 * */
export type GridColumn = {
  key: string;
  dataType: FIELD_TYPE;
  name: string;
  width: number;
  resizable: boolean;
  sortable: boolean;
};

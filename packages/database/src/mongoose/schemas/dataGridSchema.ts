// THIS CODE WAS AUTOMATICALLY GENERATED 
import {Schema} from 'mongoose';

const DATAGRID_SCHEMA = new Schema({
    columns: {
      type:
      GridColumn[], required:
      true,
        default: false
        },
    rows: {
      type:
      any[], required:
      true,
        default: false
        }
}); 

export { DATAGRID_SCHEMA as dataGridSchema};
import {Schema} from 'mongoose';
import {columnStatsSchema} from './columnStats';
const fileStatsSchema = new Schema({
  fileName: {type: String, required: true},
  tableName: {type: String, required: true},
  numberOfRows: {type: Number, required: true},
  numberOfColumns: {type: Number, required: true},
  columns: {type: [columnStatsSchema], required: true, default: []},
  fileSize: {type: Number, required: true},
});

export {fileStatsSchema};

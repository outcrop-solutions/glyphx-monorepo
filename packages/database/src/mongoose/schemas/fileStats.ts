import {Schema} from 'mongoose';
import {columnStatsSchema} from './columnStats';
const FILE_STATS_SCHEMA = new Schema({
  fileName: {type: String, required: true},
  tableName: {type: String, required: true},
  numberOfRows: {type: Number, required: true},
  numberOfColumns: {type: Number, required: true},
  columns: {type: [columnStatsSchema], required: true, default: []},
  fileSize: {type: Number, required: true},
});

export {FILE_STATS_SCHEMA as fileStatsSchema};

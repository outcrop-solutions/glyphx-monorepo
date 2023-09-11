import {Schema} from 'mongoose';
import {fileIngestionTypes} from 'types';

const COLUMN_STATS_SCHEMA = new Schema({
  name: {type: String, required: true},
  fieldType: {
    type: Number,
    required: true,
    enum: fileIngestionTypes.constants.FIELD_TYPE,
  },
  longestString: {type: Number, required: false},
});

export {COLUMN_STATS_SCHEMA as columnStatsSchema};

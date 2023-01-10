import {Schema} from 'mongoose';
import {fileIngestion as fileIngestionTypes} from '@glyphx/types';
const columnStatsSchema = new Schema({
  name: {type: String, required: true},
  fieldType: {
    type: Number,
    required: true,
    enum: fileIngestionTypes.constants.FIELD_TYPE,
  },
  longestString: {type: Number, required: false},
});

export {columnStatsSchema};

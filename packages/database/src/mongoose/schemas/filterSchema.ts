import {Schema} from 'mongoose';
import {fileIngestion as fileIngestionTypes} from '@glyphx/types';

const FILTER_SCHEMA = new Schema({
  type: {
    type: Number,
    required: true,
    enum: fileIngestionTypes.constants.FIELD_TYPE,
  },
  name: {type: String, required: false},
  keywords: {type: [String], required: false},
  min: {type: Number, required: false},
  max: {type: Number, required: false},
});

export {FILTER_SCHEMA as filterSchema};

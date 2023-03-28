import {Schema} from 'mongoose';
import {
  web as webTypes,
  fileIngestion as fileIngestionTypes,
} from '@glyphx/types';

const PROPERTY_SCHEMA = new Schema({
  axis: {type: Number, required: true, enum: webTypes.constants.AXIS},
  accepts: {type: Number, required: true, enum: webTypes.constants.ACCEPTS},
  key: {type: String, required: true},
  dataType: {
    type: Number,
    required: true,
    enum: fileIngestionTypes.constants.FIELD_TYPE,
    default: fileIngestionTypes.constants.FIELD_TYPE[0],
  },
  interpolation: {
    type: Number,
    required: true,
    enum: webTypes.constants.INTERPOLATION_TYPE,
    default: webTypes.constants.INTERPOLATION_TYPE[0],
  },
  direction: {
    type: Number,
    required: true,
    enum: webTypes.constants.DIRECTION_TYPE,
    default: webTypes.constants.DIRECTION_TYPE[0],
  },
});

export {PROPERTY_SCHEMA as propertySchema};

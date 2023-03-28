import {Schema} from 'mongoose';
import {web as webTypes, database as databaseTypes} from '@glyphx/types';

const PROPERTY_SCHEMA = new Schema({
  axis: {type: Number, required: true, enum: webTypes.constants.AXIS},
  accepts: {type: Number, required: true, enum: webTypes.constants.ACCEPTS},
  key: {type: String, required: true},
  dataType: {
    type: Number,
    required: true,
    enum: databaseTypes.constants.FIELD_TYPE,
  },
  interpolation: {
    type: Number,
    required: true,
    enum: webTypes.constants.INTERPOLATION_TYPE,
  },
  direction: {
    type: Number,
    required: true,
    enum: webTypes.constants.DIRECTION_TYPE,
  },
});

export {PROPERTY_SCHEMA as propertySchema};

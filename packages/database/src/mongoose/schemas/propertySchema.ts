import {Schema} from 'mongoose';
import {webTypes, fileIngestionTypes} from 'types';
import {filterSchema} from './filterSchema';

const PROPERTY_SCHEMA = new Schema({
  axis: {type: String, required: true, enum: webTypes.constants.AXIS},
  accepts: {type: String, required: true, enum: webTypes.constants.ACCEPTS},
  key: {type: String, required: true},
  dataType: {
    type: Number,
    required: true,
    enum: fileIngestionTypes.constants.FIELD_TYPE,
    default: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
  },
  interpolation: {
    type: String,
    required: true,
    enum: webTypes.constants.INTERPOLATION_TYPE,
    default: webTypes.constants.INTERPOLATION_TYPE['LIN'],
  },
  direction: {
    type: String,
    required: true,
    enum: webTypes.constants.DIRECTION_TYPE,
    default: webTypes.constants.DIRECTION_TYPE['ASC'],
  },
  filter: {type: filterSchema, required: false},
});

export {PROPERTY_SCHEMA as propertySchema};

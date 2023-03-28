import {Schema} from 'mongoose';
import {filterSchema} from './filterSchema';
import {propertySchema} from './propertySchema';

const EMBEDDED_STATE_SCHEMA = new Schema({
  fileSystemHash: {type: String, required: true},
  filters: {type: [filterSchema], required: true, default: []},
  properties: {type: [propertySchema], required: true, default: []},
});

export {EMBEDDED_STATE_SCHEMA as embeddedStateSchema};

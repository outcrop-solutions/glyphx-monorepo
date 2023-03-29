import {Schema} from 'mongoose';
import {propertySchema} from './propertySchema';

const EMBEDDED_STATE_SCHEMA = new Schema({
  fileSystemHash: {type: String, required: true},
  properties: {type: [propertySchema], required: true, default: []},
});

export {EMBEDDED_STATE_SCHEMA as embeddedStateSchema};

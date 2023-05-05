import {Schema} from 'mongoose';

const FILTER_SCHEMA = new Schema({
  name: {type: String, required: false},
  keywords: {type: [String], required: false},
  min: {type: Number, required: false},
  max: {type: Number, required: false},
});

export {FILTER_SCHEMA as filterSchema};

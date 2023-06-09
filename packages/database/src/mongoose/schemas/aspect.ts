import {Schema} from 'mongoose';

const ASPECT_SCHEMA = new Schema({
  height: {type: Number, required: false},
  width: {type: Number, required: false},
});

export {ASPECT_SCHEMA as aspectSchema};

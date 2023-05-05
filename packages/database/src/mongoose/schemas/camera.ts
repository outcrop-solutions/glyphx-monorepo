import {Schema} from 'mongoose';

const CAMERA_SCHEMA = new Schema({
  x: {type: Number, required: false},
  y: {type: Number, required: false},
  z: {type: Number, required: false},
});

export {CAMERA_SCHEMA as cameraSchema};

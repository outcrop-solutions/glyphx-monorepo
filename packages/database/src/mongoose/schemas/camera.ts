import {Schema} from 'mongoose';

const CAMERA_SCHEMA = new Schema({
  yaw: {type: Number, required: false},
  pitch: {type: Number, required: false},
  distance: {type: Number, required: false},
  target: {
    x: {type: Number, required: false},
    y: {type: Number, required: false},
    z: {type: Number, required: false},
  },
  x_offset: {type: Number, required: false},
  y_offset: {type: Number, required: false},
  z_offset: {type: Number, required: false},
});

export {CAMERA_SCHEMA as cameraSchema};

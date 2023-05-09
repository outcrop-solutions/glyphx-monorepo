import {Schema} from 'mongoose';

const CAMERA_SCHEMA = new Schema({
  pos: {
    x: {type: Number, required: false},
    y: {type: Number, required: false},
    z: {type: Number, required: false},
  },
  dir: {
    x: {type: Number, required: false},
    y: {type: Number, required: false},
    z: {type: Number, required: false},
  },
});

export {CAMERA_SCHEMA as cameraSchema};

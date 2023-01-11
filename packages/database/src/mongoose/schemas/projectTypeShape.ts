import {Schema} from 'mongoose';

const projectTypeShapeSchema = new Schema({
  type: {type: String, required: true},
  required: {type: Boolean, required: true},
});

export {projectTypeShapeSchema};

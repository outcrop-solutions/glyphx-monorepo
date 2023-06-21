import {Schema} from 'mongoose';

const PROJECT_TEMPLATE_SHAPE_SCHEMA = new Schema({
  type: {type: String, required: true},
  required: {type: Boolean, required: true},
});

export {PROJECT_TEMPLATE_SHAPE_SCHEMA as projectTemplateShapeSchema};

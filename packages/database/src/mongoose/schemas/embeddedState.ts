import {Schema} from 'mongoose';

const EMBEDDED_STATE_SCHEMA = new Schema({
  properties: {type: Schema.Types.Mixed},
});

export {EMBEDDED_STATE_SCHEMA as embeddedStateSchema};

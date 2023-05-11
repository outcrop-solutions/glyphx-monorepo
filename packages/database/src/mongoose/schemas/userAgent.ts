import {Schema} from 'mongoose';

const USER_AGENT_SCHEMA = new Schema({
  userAgent: {type: String, required: false},
  platform: {type: String, required: false},
  appName: {type: String, required: false},
  appVersion: {type: String, required: false},
  vendor: {type: String, required: false},
  language: {type: String, required: false},
  cookiesEnabled: {type: String, required: false},
});

export {USER_AGENT_SCHEMA as userAgentSchema};

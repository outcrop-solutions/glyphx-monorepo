// Load the SDK and UUID
var AWS = require('aws-sdk');
// USED TO OVERRIDE CLI CONFIG WITH LOCAL JSON CREDS IF NECESSARY
AWS.config.loadFromPath('./config.json');

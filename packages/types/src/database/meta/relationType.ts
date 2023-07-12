// eslint-disable-next-line filename-rules/match
export enum RELATION_TYPE {
  ONE_TO_ONE = 'ONE_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY', // maps to add/remove logic on the model
  ENUM = 'ENUM', // required for update type validation
  SCHEMA = 'SCHEMA', // a subdocument requiring a schema/validator
}

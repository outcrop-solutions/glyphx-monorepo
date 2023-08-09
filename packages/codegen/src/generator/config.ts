import { database as databaseTypes } from '@glyphx/types';

// TODO: make these paths customizable from package.json
export const DEFAULT_CONFIG: databaseTypes.meta.ICodeGenConfig = {
  // base path configuration
  paths: {
    // where are your database interfaces defined?
    source: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/packages/codegen/src/__tests__/mocks',
    // where do i want to output my database files?
    destination: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/packages/codegen/src/output',
    // where do my templates with?
    templates: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/packages/codegen/src/templates',
    prettier: 'gts/.prettierrc.json',
  },
  // base output directory configuration
  output: {
    models: 'mongoose/models', // where do you want your models to live?
    schemas: 'mongoose/schemas', // where do you want your schemas (sub documents) to live?
    validators: 'mongoose/validators', // where do you want your schemas (sub documents) to live?
    interfaces: 'mongoose/interfaces', // where do you want your interfaces to live?
    unitTests: '__tests__', 
    integrationTests: '__integrationTests__' }, // where do you want your tests to live?
  },
  //   template file location configuration
  templates: {
    models: {
      model: 'database/models.model.hbs',
      index: 'database/models.index.hbs',
      unitTest: 'database/models.__tests__.hbs',
      integrationTest: 'database/models.__integrationTests__.hbs',
    },
    schemas: {
      schema: 'database/schemas.schema.hbs',
      index: 'database/schemas.index.hbs',
    },
    validators: {
      validator: 'database/validators.validator.hbs',
      index: 'database/validators.index.hbs',
    },
    interfaces: {
      createInput: 'database/interfaces.createInput.hbs',
      document: 'database/interfaces.document.hbs',
      index: 'database/interfaces.index.hbs',
      methods: 'database/interfaces.methods.hbs',
      staticMethods: 'database/interfaces.staticMethods.hbs',
    },
  },
};

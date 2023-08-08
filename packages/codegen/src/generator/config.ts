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
  output: {
    // base directory configuration
    models: 'mongoose/models', // where do you want your models to live?
    schemas: 'mongoose/schemas', // where do you want your schemas (sub documents) to live?
    interfaces: 'mongoose/interfaces', // where do you want your interfaces to live?
    tests: { unit: '__tests__', integration: '__integrationTests__' }, // where do you want your tests to live?
  },
  templates: {
    //   template file location configuration
    models: 'ModelTemplate.hbs',
    schemas: 'SchemaTemplate.hbs',
    interfaces: {
      createInput: 'CreateInputTemplate.hbs',
      document: 'DocumentTemplate.hbs',
      methods: 'MethodsTemplate.hbs',
      staticMethods: 'StaticMethodsTemplate.hbs',
    },
    tests: {
      unit: 'Model.tests.hbs',
      integration: 'Model.integrationTests.hbs',
    },
  },
};

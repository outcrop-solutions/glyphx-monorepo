import path from 'path';
import { database as databaseTypes } from '@glyphx/types';

// TODO: make these paths customizable from package.json
export const DEFAULT_CONFIG: databaseTypes.meta.ICodeGenConfig = {
  paths: {
    // base path configuration
    source: path.resolve(__dirname, './mocks'), // where are your database interfaces defined?
    destination: './packages/database/src', // which base directory do you want your database layer to live?
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
    models: './ModelTemplate.hbs',
    schemas: './SchemaTemplate.hbs',
    interfaces: {
      createInput: './CreateInputTemplate.hbs',
      document: './DocumentTemplate.hbs',
      methods: './MethodsTemplate.hbs',
      staticMethods: './StaticMethodsTemplate.hbs',
    },
    tests: {
      unit: './Model.tests.hbs',
      integration: './Model.integrationTests.hbs',
    },
  },
};

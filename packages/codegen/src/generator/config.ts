import { database as databaseTypes } from '@glyphx/types';

// TODO: make these paths customizable from package.json
export const DEFAULT_CONFIG: databaseTypes.meta.ICodeGenConfig = {
  // base path configuration
  paths: {
    // where are your database interfaces defined?
    source:
      '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/packages/codegen/src/__tests__/mocks/database.ts',
    // where do i want to output my database files?
    destination: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/packages/codegen/src/output',
    // where do my templates with?
    templates: '/Users/jamesmurdockgraham/Desktop/projects/glyphx/dev/monorepo/packages/codegen/src/templates',
    prettier: 'gts/.prettierrc.json',
  },
  // base output directory configuration
  output: {
    business: {
      services: 'business/services',
      unitTests: 'business/__tests__',
      integrationTests: 'business/__integrationTests__',
    },
    database: {
      interfaces: 'database/mongoose/interfaces', // where do you want your interfaces to live?
      mocks: 'database/mongoose/mocks',
      models: 'database/mongoose/models', // where do you want your models to live?
      validators: 'database/mongoose/validators', // where do you want your schemas (sub documents) to live?
      schemas: 'database/mongoose/schemas', // where do you want your schemas (sub documents) to live?
      unitTests: 'database/__tests__',
      integrationTests: 'database/__integrationTests__', // where do you want your tests to live?
    },
  },
  // where can I find the relevant template file?
  templates: {
    business: {
      services: {
        index: 'business/services.index.hbs',
        service: 'business/services.service.hbs',
        unitTest: 'business/services.__tests__.hbs',
        integrationTest: 'business/services.__integrationTests__.hbs',
      },
    },
    database: {
      interfaces: {
        createInput: 'database/interfaces.createInput.hbs',
        document: 'database/interfaces.document.hbs',
        index: 'database/interfaces.index.hbs',
        methods: 'database/interfaces.methods.hbs',
        staticMethods: 'database/interfaces.staticMethods.hbs',
      },
      mocks: {
        mock: 'database/mocks.mock.hbs',
        index: 'database/mocks.index.hbs',
      },
      models: {
        model: 'database/models.model.hbs',
        index: 'database/models.index.hbs',
        unitTest: 'database/models.__tests__.hbs',
        integrationTest: 'database/models.__integrationTests__.hbs',
      },
      validators: {
        validator: 'database/validators.validator.hbs',
        index: 'database/validators.index.hbs',
        unitTest: 'database/validators.__tests__.hbs',
        integrationTest: 'database/validators.__integrationTests__.hbs',
      },
      schemas: {
        schema: 'database/schemas.schema.hbs',
        index: 'database/schemas.index.hbs',
      },
    },
  },
};

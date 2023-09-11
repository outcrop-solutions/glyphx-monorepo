import {databaseTypes} from 'types';

// TODO: make these paths customizable from package.json
export const DEFAULT_CONFIG: databaseTypes.meta.ICodeGenConfig = {
  // base path configuration
  paths: {
    // where are your database interfaces defined?
    source: './src/__tests__/mocks/database.ts',
    // where do i want to output my database files?
    destination: './src/output',
    baseUrl: 'src/',
    // where do my templates with?
    templates: './src/templates',
    prettier: 'gts/.prettierrc.json',
  },
  // base output directory configuration
  output: {
    web: {
      hooks: 'web/src/lib/client/hooks',
      mutations: 'web/src/lib/client/mutations',
      states: 'web/src/states',
      routes: 'web/src/pages/api',
      actions: 'web/src/lib/server',
      unitTests: 'web/src/__tests__',
      integrationTests: 'web/src/__integrationTests__',
    },
    business: {
      services: 'business/src/services',
      unitTests: 'business/src/__tests__',
      integrationTests: 'business/src/__integrationTests__',
    },
    database: {
      interfaces: 'database/src/mongoose/interfaces', // where do you want your interfaces to live?
      mocks: 'database/src/mongoose/mocks',
      models: 'database/src/mongoose/models', // where do you want your models to live?
      validators: 'database/src/mongoose/validators', // where do you want your schemas (sub documents) to live?
      schemas: 'database/src/mongoose/schemas', // where do you want your schemas (sub documents) to live?
      unitTests: 'database/src/__tests__',
      integrationTests: 'database/src/__integrationTests__', // where do you want your tests to live?
    },
  },
  // where can I find the relevant template file?
  templates: {
    web: {
      hooks: {hook: 'web/hooks.hbs', index: 'web/hooks.index.hbs'},
      mutations: {mutation: 'web/mutations.hbs', index: 'web/mutations.index.hbs'},
      states: {
        state: 'web/states.hbs',
        index: 'web/states.index.hbs',
      },
      routes: 'web/routes.hbs',
      actions: {action: 'web/actions.hbs', index: 'web/actions.index.hbs'},
      unitTests: 'web/routes.__tests__.hbs',
      integrationTests: 'web/routes.__integrationTests__.hbs',
    },
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

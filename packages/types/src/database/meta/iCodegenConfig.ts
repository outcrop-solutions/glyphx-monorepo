export interface ICodeGenConfig {
  paths: {
    source: string;
    destination: string;
    baseUrl: string;
    templates: string;
    prettier: string;
  };
  output: {
    web: {
      hooks: string;
      actions: string;
      mutations: string;
      states: string;
      routes: string;
      unitTests: string;
      integrationTests: string;
    };
    business: {
      services: string;
      unitTests: string;
      integrationTests: string;
    };
    database: {
      interfaces: string;
      mocks: string;
      models: string;
      validators: string;
      schemas: string;
      unitTests: string;
      integrationTests: string;
    };
  };
  templates: {
    web: {
      hooks: {
        hook: string;
        index: string;
      };
      mutations: {
        mutation: string;
        index: string;
      };
      actions: {
        action: string;
        index: string;
      };
      states: {
        state: string;
        index: string;
      };
      routes: string;
      unitTests: string;
      integrationTests: string;
    };
    business: {
      services: {
        service: string;
        index: string;
        unitTest: string;
        integrationTest: string;
      };
    };
    database: {
      interfaces: {
        createInput: string;
        document: string;
        index: string;
        methods: string;
        staticMethods: string;
      };
      models: {
        model: string;
        index: string;
        unitTest: string;
        integrationTest: string;
      };
      validators: {
        validator: string;
        index: string;
        unitTest: string;
        integrationTest: string;
      };
      mocks: {
        mock: string;
        index: string;
      };
      schemas: {
        schema: string;
        index: string;
      };
    };
  };
}

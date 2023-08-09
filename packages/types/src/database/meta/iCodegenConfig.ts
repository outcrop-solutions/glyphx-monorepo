export interface ICodeGenConfig {
  paths: {
    source: string;
    destination: string;
    templates: string;
    prettier: string;
  };
  output: {
    models: string;
    schemas: string;
    interfaces: string;
    unitTests: string;
    integrationTests: string;
  };
  templates: {
    models: {
      model: string;
      index: string;
      unitTest: string;
      integationTest: string;
    };
    schemas: {
      schema: string;
      index: string;
    };
    validators: {
      validator: string;
      index: string;
    };
    interfaces: {
      createInput: string;
      document: string;
      index: string;
      methods: string;
      staticMethods: string;
    };
  };
}

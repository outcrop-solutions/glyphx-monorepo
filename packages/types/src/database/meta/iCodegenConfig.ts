export interface ICodeGenConfig {
  paths: {
    source: string;
    destination: string;
    templates: string;
  };
  output: {
    models: string;
    schemas: string;
    interfaces: string;
    tests: {
      unit: string;
      integration: string;
    };
  };
  templates: {
    models: string;
    schemas: string;
    interfaces: {
      createInput: string;
      document: string;
      methods: string;
      staticMethods: string;
    };
    tests: {
      unit: string;
      integration: string;
    };
  };
}

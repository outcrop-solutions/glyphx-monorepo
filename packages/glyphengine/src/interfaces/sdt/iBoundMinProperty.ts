export interface IBoundMinProperty {
  Min: string;
  Difference: string;
  Binding: {
    '@_fieldId': string;
  };
  Function: {
    MinMax: {
      Min: number;
      '@_type': string;
    };
    '@_type': string;
  };
}

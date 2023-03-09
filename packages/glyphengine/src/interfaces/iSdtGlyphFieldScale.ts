export interface ISdtGlyphFieldScale {
  Min: number;
  Difference: number;
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

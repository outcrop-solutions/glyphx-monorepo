import {ISdtTransform} from './iSdtTransform';

export interface ISdtDocument {
  '?xml': {
    '@_version': string;
    '@_encoding': string;
  };
  Transform: ISdtTransform;
}

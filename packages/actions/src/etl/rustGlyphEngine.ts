'use server';
import ModuleLoader from '../utils/moduleLoader';
import {error, constants} from 'core';
import {rustGlyphEngineTypes} from 'types';

interface IBindings {
  exports: {
    glyph_engine: (args: rustGlyphEngineTypes.IGlyphEngineArgs) => Promise<rustGlyphEngineTypes.IGlyphEngineResults>;
    convertNeonValue: (value: any) => string;
    convertJsonValue: (value: string) => any;
    convertGlyphxErrorToJsonObject: () => any;
  };
}

let internalModule: IBindings = {exports: {}} as IBindings;

class Bindings extends ModuleLoader<IBindings> {
  constructor() {
    super('index.node', internalModule);
  }

  public async runGlyphEngine(
    args: rustGlyphEngineTypes.IGlyphEngineArgs
  ): Promise<rustGlyphEngineTypes.IGlyphEngineResults | error.ActionError> {
    let result: rustGlyphEngineTypes.IGlyphEngineResults;
    try {
      result = await internalModule.exports.glyph_engine(args);
    } catch (e) {
      let er = new error.ActionError(
        'An error occurred while running the glyph_engine.  See the inner error for additional information',
        'glyph_engine',
        args,
        e
      );
      er.publish(constants.ERROR_SEVERITY.ERROR);
      return er;
    }
    return result;
  }
  // public hello(): string {
  //   return internalModule.exports.hello();
  // }

  public convertNeonValue(value: any): string {
    return internalModule.exports.convertNeonValue(value);
  }

  public convertJsonValue(value: string): any {
    return internalModule.exports.convertJsonValue(value);
  }

  public convertGlyphxErrorToJsonObject(): any {
    return internalModule.exports.convertGlyphxErrorToJsonObject();
  }
}

const bindings: Bindings = new Bindings();
export async function runGlyphEngine(
  args: rustGlyphEngineTypes.IGlyphEngineArgs
): Promise<rustGlyphEngineTypes.IGlyphEngineResults | error.ActionError> {
  return bindings.runGlyphEngine(args);
}

// export async function hello() {
//   return bindings.hello();
// }

export async function convertNeonValue(value: any): Promise<string> {
  return bindings.convertNeonValue(value);
}

export async function convertJsonValue(value: string): Promise<any> {
  return bindings.convertJsonValue(value);
}

export async function convertGlyphxError(): Promise<any> {
  return bindings.convertGlyphxErrorToJsonObject();
}

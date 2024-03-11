'use server';
import ModuleLoader from '../utils/moduleLoader';
import {error, constants} from 'core';
import {rustGlyphEngineTypes} from 'types';

interface IBindings {
  exports: {
    run: (args: rustGlyphEngineTypes.IGlyphEngineArgs) => Promise<rustGlyphEngineTypes.IGlyphEngineResults>;
    hello: () => string;
  };
}

let internalModule: IBindings = {exports: {}} as IBindings;

class Bindings extends ModuleLoader<IBindings> {
  constructor() {
    super('glyph_engine.node', internalModule);
  }

  public async runGlyphEngine(
    args: rustGlyphEngineTypes.IGlyphEngineArgs
  ): Promise<rustGlyphEngineTypes.IGlyphEngineResults | error.ActionError> {
    let result: rustGlyphEngineTypes.IGlyphEngineResults;
    try {
      result = await internalModule.exports.run(args);
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
  public hello(): string {
    return internalModule.exports.hello();
  }
}

const bindings: Bindings = new Bindings();

export async function runGlyphEngine(
  args: rustGlyphEngineTypes.IGlyphEngineArgs
): Promise<rustGlyphEngineTypes.IGlyphEngineResults | error.ActionError> {
  return bindings.runGlyphEngine(args);
}

export async function hello() {
  return bindings.hello();
}

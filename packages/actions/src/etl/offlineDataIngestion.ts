'use server';
import ModuleLoader from '../utils/moduleLoader';
import {error, constants} from 'core';

interface IBindings {
  exports: {
    hello: () => string;
  };
}

let internalModule: IBindings = {exports: {}} as IBindings;

class Bindings extends ModuleLoader<IBindings> {
  constructor() {
    super('offline_data_ingestion.node', internalModule);
  }

  hello() {
    return internalModule.exports.hello();
  }
}

const bindings = new Bindings();

export async function hello() {
  return bindings.hello();
}

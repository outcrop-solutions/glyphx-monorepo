//The module will be either:
//  .next/server/pkg localally
//  or
//  .next/serverless/chunks/server/pkg on vercel
import {existsSync, readdirSync} from 'node:fs';
//@ts-ignore
import {dlopen, cwd} from 'node:process';
import {constants} from 'node:os';

export default abstract class ModuleLoader<T> {
  private internalModule: T | unknown;
  private internalModulePath: string;

  constructor(moduleName: string, module: T) {
    this.internalModule = module;

    let processDir = cwd();
    let onServerDir = processDir + '/.next/server/chunks/server/pkg';
    let onLocalDir = processDir + '/.next/server/pkg';
    let onTestDir = processDir + '/pkg';
    let moduleDir = existsSync(onServerDir) ? onServerDir : existsSync(onLocalDir) ? onLocalDir : onTestDir;
    let modulePath = moduleDir + '/' + moduleName;
    this.internalModulePath = modulePath;
    let moduleExists = existsSync(modulePath);
    if (!moduleExists) {
      let files = readdirSync(processDir);
      throw new Error(
        `Module ${modulePath} does not exist.  Files in directory are: ${files.join(', ')}, currentDir: ${processDir}`
      );
    }
    this.internalModulePath = modulePath;
    //@ts-ignore
    dlopen(this.internalModule, modulePath, constants.dlopen.RTLD_NOW);
  }

  public get module(): T {
    if (this.internalModule === undefined) {
      throw new Error('Module has not been loaded');
    }
    return this.internalModule as T;
  }

  public get modulePath(): string {
    return this.internalModulePath;
  }
}

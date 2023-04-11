import {error} from '@glyphx/core';
interface IConfig {
  processId: string;
}

class Config {
  private processIdField: string;
  public get processId(): string {
    return this.processIdField;
  }

  private inited: boolean;

  constructor() {
    this.processIdField = '';
    this.inited = false;
  }

  public init(config: IConfig): void {
    this.processIdField = config.processId;
    this.inited = true;
  }
}

const CONFIG = new Config();
export {CONFIG as config};

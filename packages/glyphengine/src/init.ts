import athenaClient from './io/athenaClient';

export class Initializer {
  public static async init(): Promise<void> {
    await athenaClient.init();
  }
}

import 'mocha';
import {assert} from 'chai';
import {config} from '../config';

describe('#config', () => {
  context('init', () => {
    beforeEach(() => {
      (config as any).inited = false;
    });
    it('should initialize our config with the processId', () => {
      const processId = '123';
      config.init({processId});
      assert.equal(config.processId, processId);
    });

    it('should not throw an error if init is called more than once', () => {
      const processId = '123';
      config.init({processId});
      assert.doesNotThrow(() => {
        config.init({processId});
      });
    });
  });
});

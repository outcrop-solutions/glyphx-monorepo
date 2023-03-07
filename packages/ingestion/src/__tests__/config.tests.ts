import 'mocha';
import {assert} from 'chai';
import {config} from '../config';
import {error} from '@glyphx/core';

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

    it('should throw an error if init is called more than once', () => {
      const processId = '123';
      config.init({processId});
      let errored = false;
      try {
        config.init({processId});
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
});

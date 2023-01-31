import 'mocha';
import {assert} from 'chai';

describe('#general', () => {
  context('Tests to make sure that tests are working', () => {
    it('should be true', () => {
      assert.isTrue(true);
    });

    it('should be false', () => {
      assert.isFalse(false);
    });
  });
});

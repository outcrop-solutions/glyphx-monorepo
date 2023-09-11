import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';

describe('#lib/sessionCheck', () => {
  context('init', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('will check session', async () => {});
  });
});

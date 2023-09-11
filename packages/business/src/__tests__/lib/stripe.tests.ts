import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';

describe('#lib/stripe', () => {
  context('init', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('will initialize our middleware', async () => {});
  });
});

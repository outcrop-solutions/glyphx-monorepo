import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';

describe('#lib/hashFunctions', () => {
  context('hashFileSystem', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('will correctly hash a filesystem', async () => {});
  });
  context('hashPayload', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('will correctly hash a client payload', async () => {});
  });
});

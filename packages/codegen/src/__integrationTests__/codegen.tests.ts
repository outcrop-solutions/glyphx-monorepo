import 'mocha';
import path from 'node:path';
import { assert } from 'chai';
import { createSandbox } from 'sinon';
import { CodeGenerator } from '../generator/codeGenerator';
import { DEFAULT_CONFIG } from 'generator/config';

describe('#codegen/generator', () => {
  context('generator', () => {
    let codeGen: any;
    let sandbox: sinon.SinonSandbox;

    before(async () => {
      sandbox = createSandbox();
      codeGen = new CodeGenerator(DEFAULT_CONFIG);
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('generator/processFiles', () => {
      it('should generate the correct dbSchema', async () => {
        let errored = false;
        try {
          await codeGen.generate();
        } catch (error) {
          errored = true;
        }
        assert.isFalse(errored);
      });
    });
  });
});

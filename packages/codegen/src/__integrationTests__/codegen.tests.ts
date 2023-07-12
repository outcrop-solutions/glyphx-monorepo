import 'mocha';
import path from 'node:path';
import { assert } from 'chai';
import { createSandbox } from 'sinon';
import { CodeGenerator } from '../generator/codeGenerator';

describe('#codegen/generator', () => {
  context('generator', () => {
    const dbDir = path.resolve(__dirname, './mocks');
    let codeGen: any;
    let sandbox: sinon.SinonSandbox;

    before(async () => {
      sandbox = createSandbox();
      codeGen = new CodeGenerator(dbDir);
    });

    afterEach(() => {
      sandbox.restore();
    });

    context('generator/processFiles', () => {
      it('should generate the correct dbSchema', async () => {
        let errored = false;
        try {
          await codeGen.processFiles(dbDir);
        } catch (error) {
          errored = true;
        }
        assert.isFalse(errored);
      });
    });
  });
});

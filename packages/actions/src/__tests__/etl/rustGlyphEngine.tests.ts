import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import rewire from 'rewire';
import {error, constants} from 'core';
import {rustGlyphEngineTypes} from 'types';
describe('#etl/rustGlyphEngine', () => {
  context('runGlyphEngine', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('should return a IGlyphEngineResult when successful', async () => {
      let expectedResult: rustGlyphEngineTypes.IGlyphEngineResults = {
        x_axis_vectors_file_name: 'x_axis_vectors_file_name',
        y_axis_vectors_file_name: 'y_axis_vectors_file_name',
        glyphs_file_name: 'glyphs_file_name',
        statistics_file_name: 'statistics_file_name',
      };
      let GlyphEngine = rewire('../../etl/rustGlyphEngine');
      GlyphEngine.__set__('internalModule', {
        exports: {
          run: (args: any) => {
            return Promise.resolve(expectedResult);
          },
        },
      });
      let runner = GlyphEngine.__get__('bindings');
      let stub = sandbox.stub(error.GlyphxError.prototype, 'publish');

      const result = (await runner.runGlyphEngine({})) as rustGlyphEngineTypes.IGlyphEngineResults;
      assert(stub.notCalled);
      assert.deepEqual(result, expectedResult);
    });

    it('should return an ActionError when glyph_engine fails', async () => {
      let innerError = 'Hi Mom from Rewrire';
      let GlyphEngine = rewire('../../etl/rustGlyphEngine');
      GlyphEngine.__set__('internalModule', {
        exports: {
          run: (args: any) => {
            throw innerError;
          },
        },
      });
      let runner = GlyphEngine.__get__('bindings');
      let stub = sandbox.stub(error.GlyphxError.prototype, 'publish');

      const result = (await runner.runGlyphEngine({})) as error.ActionError;
      assert(stub.calledOnceWith(constants.ERROR_SEVERITY.ERROR));
      assert.instanceOf(result, error.ActionError);
      assert.equal(result.innerError, innerError);
      assert.equal((result.data as any).key, 'glyph_engine');
    });
  });
});

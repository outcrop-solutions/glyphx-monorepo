import 'mocha';
import {assert} from 'chai';
import * as interpolation from '../../util/interperolation';
import {error} from '@glyphx/core';
describe('#util/interpolation', () => {
  context('linearInterpolation', () => {
    it('will interpolate a value between two points', () => {
      const minX = 0;
      const maxX = 50;
      const minY = 0;
      const maxY = 100;
      const x = 25;

      const y = interpolation.linearInterpolation(x, minX, maxX, minY, maxY);
      assert.strictEqual(y, 50);
    });

    it('will interpolate a value when minX/maxX are equal', () => {
      const minX = 50;
      const maxX = 50;
      const minY = 0;
      const maxY = 100;
      const x = 50;

      const y = interpolation.linearInterpolation(x, minX, maxX, minY, maxY);
      assert.strictEqual(y, maxY);
    });

    it('will throw an InvalidArgumentError in x is outside the range of mixX to maxX', () => {
      const minX = 50;
      const maxX = 50;
      const minY = 0;
      const maxY = 100;
      const x = 10;
      assert.throws(() => {
        interpolation.linearInterpolation(x, minX, maxX, minY, maxY),
          error.InvalidArgumentError;
      });
    });
  });

  context('logorithmicInterpolation', () => {
    it('will interpolate a value between two points', () => {
      const minX = 0;
      const maxX = 50;
      const minY = 0;
      const maxY = 100;
      const x = 25;

      const y = interpolation.logaritmicInterpolation(
        x,
        minX,
        maxX,
        minY,
        maxY
      );

      assert.isAbove(y, 82);
      assert.isBelow(y, 83);
    });

    it('will interpolate a value when minX/maxX are equal', () => {
      const minX = 50;
      const maxX = 50;
      const minY = 0;
      const maxY = 100;
      const x = 50;

      const y = interpolation.logaritmicInterpolation(
        x,
        minX,
        maxX,
        minY,
        maxY
      );
      assert.strictEqual(y, maxY);
    });

    it('will throw an InvalidArgumentError in x is outside the range of mixX to maxX', () => {
      const minX = 50;
      const maxX = 50;
      const minY = 0;
      const maxY = 100;
      const x = 10;
      assert.throws(() => {
        interpolation.logaritmicInterpolation(x, minX, maxX, minY, maxY),
          error.InvalidArgumentError;
      });
    });
  });
});

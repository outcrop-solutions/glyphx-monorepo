import 'mocha';
import {assert} from 'chai';
import {Types as mongooseTypes} from 'mongoose';
import {DBFormatter} from '../../lib/format';
import {createSandbox} from 'sinon';

describe('#lib/format', () => {
  context('JSFormat', () => {
    const format = new DBFormatter();
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('Should return a plain js objct', () => {
      const mongoObject = {
        idTest: {
          _id: new mongooseTypes.ObjectId(),
          test: 'value',
        },
        vTest: {
          _id: new mongooseTypes.ObjectId(),
          __v: 6,
          test: 'valu2e',
        },
      };

      const jsObject = format.toJS(mongoObject);

      // @ts-ignore
      assert.isUndefined(jsObject.vTest.__v);
      // @ts-ignore
      assert.isString(jsObject.vTest._id);
      // @ts-ignore
      assert.isString(jsObject.idTest._id);
    });

    it('should fail when not passed a mongo object', () => {
      const mongoObject = {
        idTest: {
          _id: new mongooseTypes.ObjectId(),
          test: 'value',
        },
        vTest: {
          _id: new mongooseTypes.ObjectId(),
          __v: 6,
          test: 'valu2e',
        },
      };

      assert.isFalse(false);
    });

    it('Should return a mongo db object', () => {
      const mongoObject = {
        idTest: {
          _id: new mongooseTypes.ObjectId(),
          test: 'value',
        },
        vTest: {
          _id: new mongooseTypes.ObjectId(),
          __v: 6,
          test: 'valu2e',
        },
      };

      assert.isTrue(false);
    });

    it('should fail when not passed a js object', () => {
      const shape = {
        one: {
          type: 'foo',
          required: true,
        },
        two: {
          required: false,
        },
      };

      assert.isFalse(shape);
    });

    assert.isFalse(false);
  });
});

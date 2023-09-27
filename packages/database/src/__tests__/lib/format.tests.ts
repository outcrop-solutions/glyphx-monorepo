import 'mocha';
import {assert} from 'chai';
import {Types as mongooseTypes} from 'mongoose';
import {DBFormatter} from '../../lib/format';
import {createSandbox} from 'sinon';
import {error} from 'core';

describe('#lib/format', () => {
  context('DBFormatter', () => {
    const format = new DBFormatter();
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    describe('toJS method', () => {
      it('Should return a plain js object', () => {
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
        assert.isString(jsObject.vTest.id);
        // @ts-ignore
        assert.isUndefined(jsObject.vTest._id);
        // @ts-ignore
        assert.isString(jsObject.idTest.id);
        // @ts-ignore
        assert.isUndefined(jsObject.idTest._id);
      });

      it('Should return a plain js object when documents are nested', () => {
        const mongoObject = {
          idTest: {
            _id: new mongooseTypes.ObjectId(),
            test: 'value',
            recursive: {
              _id: new mongooseTypes.ObjectId(),
              __v: 6,
              test: 'nested value',
            },
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
        assert.isString(jsObject.vTest.id);
        // @ts-ignore
        assert.isUndefined(jsObject.vTest._id);
        // @ts-ignore
        assert.isString(jsObject.idTest.id);
        // @ts-ignore
        assert.isUndefined(jsObject.idTest._id);

        // @ts-ignore
        assert.isString(jsObject.idTest.recursive.id);
        // @ts-ignore
        assert.isUndefined(jsObject.idTest.recursive._id);
        // @ts-ignore
        assert.isUndefined(jsObject.idTest.recursive.__v);
      });

      it('should throw a DbFormatterError when toHexString fails', () => {
        const errMessage = 'to Hex failed';
        sandbox.stub(mongooseTypes.ObjectId.prototype, 'toHexString').throws(new Error(errMessage));

        const mongoObject = {
          idTest: {
            _id: new mongooseTypes.ObjectId(),
            test: 'value',
          },
          vTest: {
            _id: new mongooseTypes.ObjectId(),
            __v: 6,
            test: 'value2',
          },
        };

        let errorred = false;
        try {
          format.toJS(mongoObject);
        } catch (err) {
          assert.instanceOf(err, error.DbFormatterError);
          errorred = true;
        }
        assert.isTrue(errorred);
      });
    });

    describe('toMongo method', () => {
      it('Should replace id with _id', () => {
        const jsObject = {
          idTest: {
            id: '6513149f5f12ffb73c577f92',
            test: 'value',
          },
          vTest: {
            id: '6513149f5f12ff637c577f92',
            test: 'valu2e',
          },
        };

        const mongoObject = format.toMongo(jsObject);
        // @ts-ignore
        assert.instanceOf(mongoObject.idTest._id, mongooseTypes.ObjectId);
        // @ts-ignore
        assert.isUndefined(mongoObject.idTest.id);
        // @ts-ignore
        assert.instanceOf(mongoObject.vTest._id, mongooseTypes.ObjectId);
        // @ts-ignore
        assert.isUndefined(mongoObject.vTest.id);
      });

      it('should handle nested objects', () => {
        const result = format.toMongo({
          id: 'a'.repeat(24),
          nested: {
            id: 'b'.repeat(24),
            field: 'value',
          },
        });
        assert.instanceOf(result._id, mongooseTypes.ObjectId);
        assert.strictEqual(result._id.toString(), 'a'.repeat(24));
        assert.isUndefined(result.id);
        //  @ts-ignore
        assert.instanceOf(result.nested._id, mongooseTypes.ObjectId);
        //  @ts-ignore
        assert.strictEqual(result.nested._id.toString(), 'b'.repeat(24));
        //  @ts-ignore
        assert.isUndefined(result.nested.id);
        //  @ts-ignore
        assert.strictEqual(result.nested.field, 'value');
      });

      it('should leave other fields unchanged', () => {
        const result = format.toMongo({field1: 'value1', field2: 'value2'});
        assert.strictEqual(result.field1, 'value1');
        assert.strictEqual(result.field2, 'value2');
      });
    });

    describe('_id method', () => {
      it('should return a new ObjectId when no argument is provided', () => {
        const retval = format['_id']();
        assert.instanceOf(retval, mongooseTypes.ObjectId);
      });

      it('should return a new ObjectId when an incorrect length hex string is provided', () => {
        const retval = format['_id']('shortHex');
        assert.instanceOf(retval, mongooseTypes.ObjectId);
        assert.notStrictEqual(retval.toString(), 'shortHex');
      });

      it('should return an ObjectId matching the provided hex string when a correct length hex string is provided', () => {
        const validHex = 'a'.repeat(24); // a valid 24-char hex string
        const retval = format['_id'](validHex);
        assert.instanceOf(retval, mongooseTypes.ObjectId);
        assert.strictEqual(retval.toString(), validHex);
      });
    });
  });
});

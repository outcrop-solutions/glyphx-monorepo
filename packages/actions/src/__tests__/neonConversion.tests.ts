import 'mocha';
import {assert} from 'chai';
import {convertNeonValue, convertJsonValue, convertGlyphxError} from '../etl/rustGlyphEngine';

describe('#neonConversion', () => {
  context('ConvertNeonValueToSerdeValue', () => {
    it('should convert POJO to serde value', async () => {
      let input = {
        fieldA: 'valueA',
        fieldB: 123,
        fieldC: true,
        fieldD: {
          fieldE: 'valueE',
          fieldF: 456,
          fieldG: false,
        },
        fieldH: ['valueH', 789, true],
        fieldI: Date.now(),
        fieldJ: null,
        fieldk: {
          fieldL: 'valueL',
          fieldM: [123, 456, 789],
          fieldN: {
            fieldO: 'valueO',
            fieldP: 123,
          },
        },
        fieldQ: [{fieldQ1: 'valueQ1'}, {fieldQ2: 'valueQ2'}, {fieldQ3: 'valueQ3'}],
      };

      let result = await convertNeonValue(input);
      assert.isDefined(result);
      assert.isString(result);
      let converted = JSON.parse(result);
      assert.deepEqual(converted, input);
    });
  });

  context('ConvertJsonValueToNeonValue', () => {
    it('should convert serde value to POJO', async () => {
      let input = {
        fieldA: 'valueA',
        fieldB: 123,
        fieldC: true,
        fieldD: {
          fieldE: 'valueE',
          fieldF: 456,
          fieldG: false,
        },
        fieldH: ['valueH', 789, true],
        fieldI: Date.now(),
        fieldJ: null,
        fieldk: {
          fieldL: 'valueL',
          fieldM: [123, 456, 789],
          fieldN: {
            fieldO: 'valueO',
            fieldP: 123,
          },
        },
        fieldQ: [{fieldQ1: 'valueQ1'}, {fieldQ2: 'valueQ2'}, {fieldQ3: 'valueQ3'}],
      };

      let result = await convertJsonValue(JSON.stringify(input));
      assert.isDefined(result);
      assert.isObject(result);
      assert.deepEqual(result, input);
    });
  });
  context('ConvertGlyphxErrorToJsonObject', () => {
    it('should convert GlyphxError to POJO', async () => {
      let result = await convertGlyphxError();
      assert.isDefined(result);
      assert.isObject(result);
      let unexpected_error = result.UnexpectedError;
      assert.isDefined(unexpected_error);
      assert.strictEqual(unexpected_error.message, 'Invalid region');
      let data = unexpected_error.data;
      assert.isDefined(data);
      assert.strictEqual(data.region, 'us-west-2');

      let inner_error = unexpected_error.innerError;
      assert.isDefined(inner_error);
      let bucket_does_not_exist = inner_error.BucketDoesNotExist;
      assert.isDefined(bucket_does_not_exist);
      assert.strictEqual(bucket_does_not_exist.message, 'Bucket does not exist');
      data = bucket_does_not_exist.data;
      assert.isDefined(data);
      assert.strictEqual(data.bucket_name, 'foo');

      inner_error = bucket_does_not_exist.innerError;
      assert.isDefined(inner_error);
      assert.isString(inner_error);
      assert.strictEqual(inner_error, 'James, what have you done now');
    });
  });
});

import 'mocha';
import {assert} from 'chai';
import * as textConversion from '../../util/textConversion';

describe('#utl/textConversion', () => {
  context('convertTextToUtfForBuffer', () => {
    it('will convert our string to an unit8Array', () => {
      const testString = 'This is a test string';
      const result = textConversion.convertTextToUtfForBuffer(testString);
      assert.strictEqual(result.length, testString.length + 2);
      assert.strictEqual(result[1], testString.length);
    });
  });

  context('convertUtfForBufferToText', () => {
    it('will convert our unit8Array to a string', () => {
      const testString = 'This is a test string';
      const result = textConversion.convertTextToUtfForBuffer(testString);
      const resultString = textConversion.convertUtfForBufferToText(Buffer.from(result), 0);
      assert.strictEqual(resultString, testString);
    });
  });
});

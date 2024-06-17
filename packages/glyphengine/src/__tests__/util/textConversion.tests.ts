import 'mocha';
import {assert} from 'chai';
import * as textConversion from '../../util/textConversion';

export function generateLargeJsonString(): string {
  const largeArray = Array.from({length: 70000}, (_, i) => i); // Generate an array with 70000 elements
  const largeJson = {
    x: {place: 'United Kingdom'},
    y: {stock_code: '21731'},
    z: {amount: 'SUM(7049)'},
    rowId: largeArray,
  };
  return JSON.stringify(largeJson);
}

describe('#utl/textConversion', () => {
  context('convertTextToUtfForBuffer', () => {
    it('will convert our string to an unit8Array', () => {
      const testString = 'This is a test string';
      const result = textConversion.convertTextToUtfForBuffer(testString);
      assert.strictEqual(result.length, testString.length + 2);
      assert.strictEqual(result[1], testString.length);
    });
    it('will convert our string to a Uint8Array and handle large JSON', () => {
      const testString = generateLargeJsonString();
      const result = textConversion.convertTextToUtfForBuffer(testString);

      // Check if the length exceeds 65535
      assert.isTrue(testString.length > 65535, 'Test string should exceed 65535 characters');

      // Check if rowId is modified correctly
      const resultString = new TextDecoder().decode(result.slice(2));

      // does the length encoded match the result string
      const length = (result[0] << 8) | result[1];

      assert.strictEqual(resultString.length, length);
      const parsedResult = JSON.parse(resultString);
      assert.deepEqual(parsedResult.rowId, [9999, 0], 'rowId should be modified to [9999, 0]');
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

import 'mocha';
import {assert} from 'chai';
import {conversion} from '../../../util';
import {Buffer} from 'node:buffer';

describe.only('#fileProcessing/Latin1Decoder', () => {
  context('Converting Values', () => {
    it('will decode my ASCII string with', () => {
      const testString = 'a©£';
      let buffer = Buffer.from(testString, 'latin1');
      const decoder = new conversion.Latin1Decoder();
      let output = '';
      let usedBytes = 0;
      while (true) {
        let result = decoder.getChar(buffer, usedBytes) as [string, number];
        if (result === undefined) {
          break;
        }
        let [char, size] = result;
        output += char;
        usedBytes += size;
      }
      assert.equal(output, testString);
    });

    it('will return undefined because my buffer is empty', () => {
      const testString = '';
      let buffer = Buffer.from(testString, 'ascii');
      //pull off the last byte
      const decoder = new conversion.Latin1Decoder();
      let result = decoder.getChar(buffer, 0) as [string, number];
      assert.isUndefined(result);
    });
  });
});

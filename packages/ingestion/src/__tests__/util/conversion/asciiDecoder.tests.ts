import 'mocha';
import {assert} from 'chai';
import {conversion} from '../../../util';
import {Buffer} from 'node:buffer';

describe('#fileProcessing/AsciiDecoder', () => {
  context('Converting Values', () => {
    it('will decode my ASCII string with', () => {
      const testString = 'hi mom';
      let buffer = Buffer.from(testString, 'ascii');
      const decoder = new conversion.AsciiDecoder();
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
      const decoder = new conversion.Utf16Decoder();
      let result = decoder.getChar(buffer, 0) as [string, number];
      assert.isUndefined(result);
    });
    it('will throw when it encounters an outof bounds character', () => {
      const testString = 'hi mom';
      let buffer = Buffer.concat([Buffer.from(testString, 'ascii'), Buffer.from([0xfff])]);
      const decoder = new conversion.AsciiDecoder();
      let output = '';
      let usedBytes = 0;
      assert.throws(() => {
        while (true) {
          let result = decoder.getChar(buffer, usedBytes) as [string, number];
          if (result === undefined) {
            break;
          }
          let [char, size] = result;
          output += char;
          usedBytes += size;
        }
      }, 'The byteValue: 255 is not a valid ASCII character code');
      assert.equal(output, testString);
    });
  });
});

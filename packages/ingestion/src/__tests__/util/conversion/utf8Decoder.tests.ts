import 'mocha';
import {assert} from 'chai';
import {conversion} from '../../../util';
import {Buffer} from 'node:buffer';

describe('#fileProcessing/Utf8Decoder', () => {
  context('Converting Values', () => {
    it('will decode my utf8 string', () => {
      const testString = 'a©€';
      let buffer = Buffer.from(testString, 'utf8');
      const decoder = new conversion.Utf8Decoder();
      let result = decoder.getChar(buffer, 0) as [string, number];
      assert.isDefined(result);
      let [a, aSize] = result;
      result = decoder.getChar(buffer, aSize) as [string, number];
      assert.isDefined(result);
      let [copy, copySize] = result;
      result = decoder.getChar(buffer, aSize + copySize) as [string, number];
      assert.isDefined(result);
      let [euro, eSize] = result;
      assert.equal(a, 'a');
      assert.equal(copy, '©');
      assert.equal(euro, '€');
    });

    it('will return undefined because my character is incomplete', () => {
      const testString = 'a©€';
      let buffer = Buffer.from(testString, 'utf8');
      //pull off the last byte
      let subBuffer = buffer.subarray(0, buffer.length - 1);
      const decoder = new conversion.Utf8Decoder();
      let result = decoder.getChar(subBuffer, 0) as [string, number];
      assert.isDefined(result);
      let [a, aSize] = result;
      result = decoder.getChar(subBuffer, aSize) as [string, number];
      assert.isDefined(result);
      let [copy, copySize] = result;
      result = decoder.getChar(subBuffer, aSize + copySize) as [string, number];
      assert.isUndefined(result);
    });

    it('will return undefined because my buffer is empty', () => {
      const testString = '';
      let buffer = Buffer.from(testString, 'utf8');
      //pull off the last byte
      const decoder = new conversion.Utf8Decoder();
      let result = decoder.getChar(buffer, 0) as [string, number];
      assert.isUndefined(result);
    });
  });
});

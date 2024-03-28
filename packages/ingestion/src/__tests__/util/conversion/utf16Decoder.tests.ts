import 'mocha';
import {assert} from 'chai';
import {conversion} from '../../../util';
import {Buffer} from 'node:buffer';
import iconv from 'iconv-lite';

describe('#fileProcessing/Utf16Decoder', () => {
  context('Converting Values', () => {
    it('will decode my utf16le string with no BOM', () => {
      const testString = 'a©€';
      let buffer = Buffer.from(testString, 'utf16le');
      const decoder = new conversion.Utf16Decoder();
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

    it('will decode my utf16le string with  BOM', () => {
      const testString = 'a©€';
      let buffer = Buffer.concat([Buffer.from([0xff, 0xfe]), iconv.encode(testString, 'utf16le')]);
      const decoder = new conversion.Utf16Decoder();
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

    it('will decode my utf16be string with BOM', () => {
      const testString = 'a©€';
      let buffer = Buffer.concat([Buffer.from([0xfe, 0xff]), iconv.encode(testString, 'utf16be')]);
      const decoder = new conversion.Utf16Decoder();
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
      let buffer = Buffer.from(testString, 'utf16le');
      //pull off the last byte
      let subBuffer = buffer.subarray(0, buffer.length - 1);
      const decoder = new conversion.Utf16Decoder();
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
      let buffer = Buffer.from([0xff, 0xfe]);
      //pull off the last byte
      const decoder = new conversion.Utf16Decoder();
      let result = decoder.getChar(buffer, 0) as [string, number];
      assert.isUndefined(result);
    });

    it('will decode my utf16le string with a BOM on first buffer', () => {
      const testString = 'a©€';
      let buffer = Buffer.concat([Buffer.from([0xff, 0xfe]), iconv.encode(testString, 'utf16le')]);
      let buffer2 = iconv.encode(testString, 'utf16le');
      const decoder = new conversion.Utf16Decoder();
      let result = decoder.getChar(buffer, 0) as [string, number];
      assert.isDefined(result);

      let [a, aSize] = result;
      assert.equal(a, 'a');

      result = decoder.getChar(buffer2, 0) as [string, number];
      [a, aSize] = result;
      result = decoder.getChar(buffer2, aSize) as [string, number];
      assert.isDefined(result);
      let [copy, copySize] = result;
      result = decoder.getChar(buffer2, aSize + copySize) as [string, number];
      assert.isDefined(result);
      let [euro, eSize] = result;
      assert.equal(a, 'a');
      assert.equal(copy, '©');
      assert.equal(euro, '€');
    });
  });
});

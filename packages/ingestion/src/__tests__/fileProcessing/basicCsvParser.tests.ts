import 'mocha';
import {assert} from 'chai';
import {BasicCsvParser} from '../../fileProcessing';

import iconv from 'iconv-lite';
describe.only('#fileProcessing/BasicCsvParser', () => {
  context('Parsing Values', () => {
    it('will parse a utf8 file', () => {
      let csvStream = new BasicCsvParser({});
      let leftover: Buffer = Buffer.from('');

      for (let i = 0; i < 10; i++) {
        let chunk = Buffer.concat([leftover, Buffer.from(`This is pass : ${i} €`, 'utf8')]);
        let input: Buffer;
        if (i < 9) {
          leftover = chunk.subarray(-1);
          input = chunk.subarray(0, chunk.length - 1);
        } else {
          input = chunk;
        }
        csvStream.write(input, 'utf8', () => {});
      }
    });

    it.only('will parse a utf16le file', () => {
      let csvStream = new BasicCsvParser({});
      let leftover: Buffer = Buffer.from('');

      for (let i = 0; i < 10; i++) {
        let chunk = Buffer.concat([leftover, iconv.encode(`This is utf16le pass : ${i} €`, 'utf16le')]);
        let input: Buffer;
        if (i < 9) {
          leftover = chunk.subarray(-1);
          input = chunk.subarray(0, chunk.length - 1);
        } else {
          input = chunk;
        }
        if (i == 0) {
          input = Buffer.concat([Buffer.from([0xff, 0xfe]), input]);
        }
        csvStream.write(input, 'utf16le', () => {});
      }
    });
  });
});

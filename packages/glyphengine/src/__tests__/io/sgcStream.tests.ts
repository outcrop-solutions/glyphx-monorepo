import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {error} from '@glyphx/core';
import {MOCK_GLYPH_DATA} from './mockGlyphData';
import {Readable, Writable} from 'stream';
import {pipeline} from 'stream/promises';
import {SgcStream} from '../../io/sgcStream';
import fs from 'fs';

describe('#io/SgcStream', () => {
  context('transform', () => {
    it('Will take in our glyph data and transform it into a buffer', async () => {
      const rStream = new Readable({
        objectMode: true,
        read: () => {
          MOCK_GLYPH_DATA.forEach(data => rStream.push(data));
          rStream.push(null);
        },
      });

      let recordNumber = -1;

      const wStream = new Writable({
        objectMode: true,
        write: (chunk, encoding, callback) => {
          console.log(chunk);
          recordNumber++;
          callback();
        },
      });

      const sgcStream = new SgcStream();

      await pipeline(rStream, sgcStream, wStream);

      assert.strictEqual(recordNumber, 25);
    });
  });
});

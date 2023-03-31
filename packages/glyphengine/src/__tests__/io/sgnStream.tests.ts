import 'mocha';
import {assert} from 'chai';
import {SgnStream, MAGIC_NUMBER, FORMAT_VERSION} from '../../io/sgnStream';
import {Readable, Writable} from 'stream';
import {pipeline} from 'stream/promises';
import {MOCK_GLYPH_DATA} from './mockGlyphData';

describe('#io/sgnStream', () => {
  context('_transform', () => {
    it('Will read our data and create a sgn file', async () => {
      const rStream = new Readable({
        objectMode: true,
        read: () => {
          MOCK_GLYPH_DATA.forEach(data => rStream.push(data));
          rStream.push(null);
        },
      });

      let recordNumber = 0;
      const wStream = new Writable({
        objectMode: true,
        write: (chunk, encoding, callback) => {
          let offset = 0;
          assert.strictEqual(chunk.readUInt32BE(offset), MAGIC_NUMBER);
          offset += 4;
          assert.strictEqual(chunk.readUInt32BE(offset), FORMAT_VERSION);
          offset += 4;
          assert.strictEqual(chunk.readUInt32BE(offset), 1);
          offset += 4;
          assert.strictEqual(chunk.readUInt32BE(offset), 25);
          offset += 4;
          assert.strictEqual(chunk.readUInt32BE(offset), 0);
          offset += 4;
          recordNumber++;
          callback();
        },
      });

      const sgnStream = new SgnStream();

      await pipeline(rStream, sgnStream, wStream);

      assert.strictEqual(recordNumber, 1);
    });
  });
});

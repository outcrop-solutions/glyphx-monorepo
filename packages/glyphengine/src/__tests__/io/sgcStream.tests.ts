import 'mocha';
import {assert} from 'chai';
import {MOCK_GLYPH_DATA, MOCK_LARGE_DATA} from './mockGlyphData';
import {Readable, Writable} from 'stream';
import {pipeline} from 'stream/promises';
import {SgcStream, MAGIC_NUMBER, FORMAT_VERSION, OFFSET} from '../../io/sgcStream';
import {convertUtfForBufferToText} from '../../util/textConversion';
function checkHeader(buffer: Buffer) {
  let offset = 0;
  assert.strictEqual(buffer.length, 52); // SGC
  assert.strictEqual(buffer.readUInt32BE(offset), MAGIC_NUMBER);
  offset += 4;
  assert.strictEqual(buffer.readUInt32BE(offset), FORMAT_VERSION);
  offset += 4;
  assert.strictEqual(buffer.readUInt8(offset), 2); // textureId
  offset += 1;
  assert.strictEqual(buffer.readFloatBE(offset), 0.0); // positionX
  offset += 4;
  assert.strictEqual(buffer.readFloatBE(offset), 0.0); // positionY
  offset += 4;
  assert.strictEqual(buffer.readFloatBE(offset), 0.0); // positionZ
  offset += 4;
  assert.strictEqual(buffer.readFloatBE(offset), 0.0); // rotationX
  offset += 4;
  assert.strictEqual(buffer.readFloatBE(offset), 0.0); // rotationY
  offset += 4;
  assert.strictEqual(buffer.readFloatBE(offset), 0.0); // rotationZ
  offset += 4;
  assert.strictEqual(buffer.readUInt8(offset), 0); // colorR
  offset += 1;
  assert.strictEqual(buffer.readUInt8(offset), 0); // colorG
  offset += 1;
  assert.strictEqual(buffer.readUInt8(offset), 0); // colorB
  offset += 1;
  assert.strictEqual(buffer.readFloatBE(offset), 180.0); // GridLineCountX
  offset += 4;
  assert.strictEqual(buffer.readFloatBE(offset), 180.0); // GridLineCountY
  offset += 4;
  assert.strictEqual(buffer.readUInt32BE(offset), 1); // GridSegmentsX
  offset += 4;
  assert.strictEqual(buffer.readUInt32BE(offset), 1); // GridSegmentsY
  offset += 4;
}

function checkRecord(recordNumber: number, buffer: Buffer) {
  const record = MOCK_GLYPH_DATA[recordNumber];
  let offset = 0;
  assert.strictEqual(buffer.readUInt32BE(offset), OFFSET + recordNumber);
  offset += 4;
  assert.strictEqual(buffer.readUInt32BE(offset), record.label);
  offset += 4;
  assert.strictEqual(buffer.readUInt32BE(offset), 0);
  offset += 4;
  assert.strictEqual(buffer.readUInt32BE(offset), record.parent);
  offset += 4;
  assert.approximately(buffer.readFloatBE(offset), record.positionX, 0.1);
  offset += 4;
  assert.approximately(buffer.readFloatBE(offset), record.positionY, 0.1);
  offset += 4;
  assert.approximately(buffer.readFloatBE(offset), record.positionZ, 0.1);
  offset += 4;
  assert.approximately(buffer.readFloatBE(offset), record.rotationX, 0.1);
  offset += 4;
  assert.approximately(buffer.readFloatBE(offset), record.rotationY, 0.1);
  offset += 4;
  assert.approximately(buffer.readFloatBE(offset), record.rotationZ, 0.1);
  offset += 4;
  assert.approximately(buffer.readFloatBE(offset), record.scaleX, 0.1);
  offset += 4;
  assert.approximately(buffer.readFloatBE(offset), record.scaleY, 0.1);
  offset += 4;
  assert.approximately(buffer.readFloatBE(offset), record.scaleZ, 0.1);
  offset += 4;
  assert.strictEqual(buffer.readUInt8(offset), record.colorR);
  offset += 1;
  assert.strictEqual(buffer.readUInt8(offset), record.colorG);
  offset += 1;
  assert.strictEqual(buffer.readUInt8(offset), record.colorB);
  offset += 1;
  assert.strictEqual(buffer.readUInt8(offset), 255);
  offset += 1;
  assert.strictEqual(buffer.readUInt8(offset), record.geometry);
  offset += 1;
  assert.strictEqual(buffer.readUInt8(offset), record.topology);
  offset += 1;
  assert.approximately(buffer.readFloatBE(offset), record.ratio, 0.1);
  offset += 4;
  assert.approximately(buffer.readFloatBE(offset), record.rotationRateX, 0.1);
  offset += 4;
  assert.approximately(buffer.readFloatBE(offset), record.rotationRateY, 0.1);
  offset += 4;
  assert.approximately(buffer.readFloatBE(offset), record.rotationRateZ, 0.1);
  offset += 4;
  const tag = convertUtfForBufferToText(buffer, offset);
  assert.strictEqual(tag, record.tag);
  const tagSize = Buffer.byteLength(record.tag) + 2;
  offset += tagSize;
  const url = convertUtfForBufferToText(buffer, offset);
  assert.strictEqual(url, record.url);
  const urlSize = Buffer.byteLength(record.url) + 2;
  offset += urlSize;
  const description = convertUtfForBufferToText(buffer, offset);
  const descAsJson = JSON.parse(description);
  const expectedDescAsJson = JSON.parse(record.desc);
  assert.deepStrictEqual(descAsJson, expectedDescAsJson);
  const descSize = Buffer.byteLength(description) + 2;
  offset += descSize;
}

describe('#io/SgcStream', () => {
  context('transform', () => {
    it('Will take in our glyph data and transform it into a buffer', async () => {
      const rStream = new Readable({
        objectMode: true,
        read: () => {
          MOCK_GLYPH_DATA.forEach((data) => rStream.push(data));
          rStream.push(null);
        },
      });

      let recordNumber = -1;
      const wStream = new Writable({
        objectMode: true,
        write: (chunk, encoding, callback) => {
          if (recordNumber === -1) {
            checkHeader(chunk);
          } else {
            checkRecord(recordNumber, chunk);
          }
          recordNumber++;
          callback();
        },
      });

      const sgcStream = new SgcStream();

      await pipeline(rStream, sgcStream, wStream);

      assert.strictEqual(recordNumber, 25);
    });
    it('Will take in our glyph data and transform it into a buffer when the JSON is BIG', async () => {
      const rStream = new Readable({
        objectMode: true,
        read: () => {
          MOCK_LARGE_DATA.forEach((data) => rStream.push(data));
          rStream.push(null);
        },
      });

      let recordNumber = -1;
      const wStream = new Writable({
        objectMode: true,
        write: (chunk, encoding, callback) => {
          if (recordNumber === -1) {
            checkHeader(chunk);
          } else {
            checkRecord(recordNumber, chunk);
          }
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

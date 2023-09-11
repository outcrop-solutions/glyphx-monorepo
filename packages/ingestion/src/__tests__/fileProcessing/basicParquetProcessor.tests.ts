import {assert} from 'chai';
import {BasicParquetProcessor} from '@fileProcessing';
import {Writable, Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {ParquetEnvelopeReader, ParquetReader} from 'parquetjs';

describe('#fileProcessing/BasicParquetProcessor', () => {
  context('Basic Transform Tests', () => {
    it('Will process 100 rows setting page size', async () => {
      const numberOfRows = 100;
      const readStream = new Readable({
        objectMode: true,
        read: () => {
          //Push our schema
          readStream.push({
            name: {
              type: 'UTF8',
              encoding: 'PLAIN',
            },
            value: {
              type: 'DOUBLE',
              encoding: 'PLAIN',
            },
          });
          for (let i = 0; i < numberOfRows; i++) {
            readStream.push({name: `field${i}`, value: i});
          }

          readStream.push(null);
        },
      });

      //set our page size to 10 so we get predicstble chunks and
      //measureable output
      const parquetTransformer = new BasicParquetProcessor(10);
      const b: Buffer[] = [];
      await pipeline(
        readStream,
        parquetTransformer,
        new Writable({
          objectMode: true,
          write: (chunk, encoding, callback) => {
            b.push(chunk);
            callback();
          },
        })
      );

      const bufferSize = b.reduce((accum, b) => {
        return accum + b.byteLength;
      }, 0);

      const memBuffer = Buffer.concat(b, bufferSize);
      const parquetEnvelpeReader = new ParquetEnvelopeReader(
        async (pos, length) => {
          const outputBuffer = Buffer.alloc(length);
          memBuffer.copy(outputBuffer, 0, pos ?? 0, pos + length);
          return outputBuffer;
        },
        async () => {
          return null as unknown as Error;
        },
        bufferSize
      );
      await parquetEnvelpeReader.readHeader();
      const metadata = await parquetEnvelpeReader.readFooter();
      const parquetReader = new ParquetReader(metadata, parquetEnvelpeReader);

      const cursor = parquetReader.getCursor();
      let record = null;
      let currentRecord = 0;
      while ((record = await cursor.next())) {
        assert.strictEqual(record.name, `field${currentRecord}`);
        assert.strictEqual(record.value, currentRecord);
        currentRecord++;
      }
      assert.strictEqual(currentRecord, numberOfRows);
      await parquetReader.close();
    });
    it('Will process 100 rows using page size default', async () => {
      const numberOfRows = 100;
      const readStream = new Readable({
        objectMode: true,
        read: () => {
          //Push our schema
          readStream.push({
            name: {
              type: 'UTF8',
              encoding: 'PLAIN',
            },
            value: {
              type: 'DOUBLE',
              encoding: 'PLAIN',
            },
          });
          for (let i = 0; i < numberOfRows; i++) {
            readStream.push({name: `field${i}`, value: i});
          }

          readStream.push(null);
        },
      });

      //set our page size to 10 so we get predicstble chunks and
      //measureable output
      const parquetTransformer = new BasicParquetProcessor();
      const b: Buffer[] = [];
      await pipeline(
        readStream,
        parquetTransformer,
        new Writable({
          objectMode: true,
          write: (chunk, encoding, callback) => {
            b.push(chunk);
            callback();
          },
        })
      );

      const bufferSize = b.reduce((accum, b) => {
        return accum + b.byteLength;
      }, 0);

      const memBuffer = Buffer.concat(b, bufferSize);
      const parquetEnvelpeReader = new ParquetEnvelopeReader(
        async (pos, length) => {
          const outputBuffer = Buffer.alloc(length);
          memBuffer.copy(outputBuffer, 0, pos ?? 0, pos + length);
          return outputBuffer;
        },
        async () => {
          return null as unknown as Error;
        },
        bufferSize
      );
      await parquetEnvelpeReader.readHeader();
      const metadata = await parquetEnvelpeReader.readFooter();
      const parquetReader = new ParquetReader(metadata, parquetEnvelpeReader);

      const cursor = parquetReader.getCursor();
      let record = null;
      let currentRecord = 0;
      while ((record = await cursor.next())) {
        assert.strictEqual(record.name, `field${currentRecord}`);
        assert.strictEqual(record.value, currentRecord);
        currentRecord++;
      }
      assert.strictEqual(currentRecord, numberOfRows);
      await parquetReader.close();
    });
  });

  context('null value handling', () => {
    it('should be able to handle null numbers', async () => {
      const numberOfRows = 100;
      const readStream = new Readable({
        objectMode: true,
        read: () => {
          //Push our schema
          readStream.push({
            name: {
              type: 'UTF8',
              encoding: 'PLAIN',
            },
            value: {
              type: 'DOUBLE',
              encoding: 'PLAIN',
              optional: true,
            },
          });
          for (let i = 0; i < numberOfRows; i++) {
            if (!(i % 2)) readStream.push({name: `field${i}`, value: i});
            else readStream.push({name: `field${i}`, value: null});
          }

          readStream.push(null);
        },
      });

      //set our page size to 10 so we get predicstble chunks and
      //measureable output
      const parquetTransformer = new BasicParquetProcessor(10);
      const b: Buffer[] = [];
      await pipeline(
        readStream,
        parquetTransformer,
        new Writable({
          objectMode: true,
          write: (chunk, encoding, callback) => {
            b.push(chunk);
            callback();
          },
        })
      );

      const bufferSize = b.reduce((accum, b) => {
        return accum + b.byteLength;
      }, 0);

      const memBuffer = Buffer.concat(b, bufferSize);
      const parquetEnvelpeReader = new ParquetEnvelopeReader(
        async (pos, length) => {
          const outputBuffer = Buffer.alloc(length);
          memBuffer.copy(outputBuffer, 0, pos ?? 0, pos + length);
          return outputBuffer;
        },
        async () => {
          return null as unknown as Error;
        },
        bufferSize
      );
      await parquetEnvelpeReader.readHeader();
      const metadata = await parquetEnvelpeReader.readFooter();
      const parquetReader = new ParquetReader(metadata, parquetEnvelpeReader);

      const cursor = parquetReader.getCursor();
      let record = null;
      let currentRecord = 0;
      while ((record = await cursor.next())) {
        assert.strictEqual(record.name, `field${currentRecord}`);
        if (!(currentRecord % 2)) assert.strictEqual(record.value, currentRecord);
        else assert.isUndefined(record.value);
        currentRecord++;
      }
      assert.strictEqual(currentRecord, numberOfRows);
      await parquetReader.close();
    });
  });
});

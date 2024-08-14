import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {Utf8Decoder} from '../../util/conversion';
import {BasicCsvParser, BasicColumnNameProcessor} from '../../fileProcessing';
import {Readable, Writable, promises} from 'node:stream';
import iconv from 'iconv-lite';
import {error} from 'core';
describe('#fileProcessing/BasicCsvParser', () => {
  context('Parsing Values', () => {
    it('will parse a utf8 file \\n line terminator', () => {
      let csvStream = new BasicCsvParser({lineTerminator: '\n'});
      let leftover: Buffer = Buffer.from('');
      let headerRow = Buffer.from('field1,field2,field3,field4\n', 'utf8');
      csvStream.write(headerRow, 'utf8', () => {});
      for (let i = 0; i < 10; i++) {
        let chunk = Buffer.concat([leftover, Buffer.from(`This,is,pass : ${i},€\n`, 'utf8')]);
        let input: Buffer;
        if (i < 9) {
          leftover = chunk.subarray(-1);
          input = chunk.subarray(0, chunk.length - 1);
        } else {
          input = chunk;
        }
        csvStream.write(input, 'utf8', () => {});
      }

      let data = (csvStream as any).data;
      assert.equal((csvStream as any).data.length, 10);
      for (let i = 0; i < 10; i++) {
        assert.equal(data[i][0], `This`);
        assert.equal(data[i][1], `is`);
        assert.equal(data[i][2], `pass : ${i}`);
        assert.equal(data[i][3], `€`);
      }

      let headers: BasicColumnNameProcessor = (csvStream as any).headers;
      assert.equal(headers.getColumn(0).finalName, 'field1');
      assert.equal(headers.getColumn(1).finalName, 'field2');
      assert.equal(headers.getColumn(2).finalName, 'field3');
      assert.equal(headers.getColumn(3).finalName, 'field4');
    });

    it('will parse a utf8 file \\r line terminator', () => {
      let csvStream = new BasicCsvParser({lineTerminator: '\r'});
      let leftover: Buffer = Buffer.from('');
      let headerRow = Buffer.from('field1,field2,field3,field4\r', 'utf8');
      csvStream.write(headerRow, 'utf8', () => {});
      for (let i = 0; i < 10; i++) {
        let chunk = Buffer.concat([leftover, Buffer.from(`This,is,pass : ${i},€\r`, 'utf8')]);
        let input: Buffer;
        if (i < 9) {
          leftover = chunk.subarray(-1);
          input = chunk.subarray(0, chunk.length - 1);
        } else {
          input = chunk;
        }
        csvStream.write(input, 'utf8', () => {});
      }

      let data = (csvStream as any).data;
      assert.equal((csvStream as any).data.length, 10);
      for (let i = 0; i < 10; i++) {
        assert.equal(data[i][0], `This`);
        assert.equal(data[i][1], `is`);
        assert.equal(data[i][2], `pass : ${i}`);
        assert.equal(data[i][3], `€`);
      }

      let headers: BasicColumnNameProcessor = (csvStream as any).headers;
      assert.equal(headers.getColumn(0).finalName, 'field1');
      assert.equal(headers.getColumn(1).finalName, 'field2');
      assert.equal(headers.getColumn(2).finalName, 'field3');
      assert.equal(headers.getColumn(3).finalName, 'field4');
    });

    it('will parse a utf8 file \\r\\n line terminator', () => {
      let csvStream = new BasicCsvParser({lineTerminator: '\r\n'});
      let leftover: Buffer = Buffer.from('');
      let headerRow = Buffer.from('field1,field2,field3,field4\r\n', 'utf8');
      csvStream.write(headerRow, 'utf8', () => {});
      for (let i = 0; i < 10; i++) {
        let chunk = Buffer.concat([leftover, Buffer.from(`This,is,pass : ${i},€\r\n`, 'utf8')]);
        let input: Buffer;
        if (i < 9) {
          leftover = chunk.subarray(-1);
          input = chunk.subarray(0, chunk.length - 1);
        } else {
          input = chunk;
        }
        csvStream.write(input, 'utf8', () => {});
      }

      let data = (csvStream as any).data;
      assert.equal((csvStream as any).data.length, 10);
      for (let i = 0; i < 10; i++) {
        assert.equal(data[i][0], `This`);
        assert.equal(data[i][1], `is`);
        assert.equal(data[i][2], `pass : ${i}`);
        assert.equal(data[i][3], `€`);
      }

      let headers: BasicColumnNameProcessor = (csvStream as any).headers;
      assert.equal(headers.getColumn(0).finalName, 'field1');
      assert.equal(headers.getColumn(1).finalName, 'field2');
      assert.equal(headers.getColumn(2).finalName, 'field3');
      assert.equal(headers.getColumn(3).finalName, 'field4');
    });

    it('will parse a utf8 file \\n line terminator with extra \\r', () => {
      let csvStream = new BasicCsvParser({lineTerminator: '\n', trimWhitespace: false});
      let leftover: Buffer = Buffer.from('');
      let headerRow = Buffer.from('field1,field2,field3,field4\n', 'utf8');
      csvStream.write(headerRow, 'utf8', () => {});
      for (let i = 0; i < 10; i++) {
        let chunk = Buffer.concat([leftover, Buffer.from(`This,is,pass : ${i},€\r\n`, 'utf8')]);
        let input: Buffer;
        if (i < 9) {
          leftover = chunk.subarray(-1);
          input = chunk.subarray(0, chunk.length - 1);
        } else {
          input = chunk;
        }
        csvStream.write(input, 'utf8', () => {});
      }

      let data = (csvStream as any).data;
      assert.equal((csvStream as any).data.length, 10);
      for (let i = 0; i < 10; i++) {
        assert.equal(data[i][0], `This`);
        assert.equal(data[i][1], `is`);
        assert.equal(data[i][2], `pass : ${i}`);
        assert.equal(data[i][3], `€\r`);
      }

      let headers: BasicColumnNameProcessor = (csvStream as any).headers;
      assert.equal(headers.getColumn(0).finalName, 'field1');
      assert.equal(headers.getColumn(1).finalName, 'field2');
      assert.equal(headers.getColumn(2).finalName, 'field3');
      assert.equal(headers.getColumn(3).finalName, 'field4');
    });

    it('will parse a utf8 file not quoted', () => {
      let csvStream = new BasicCsvParser({lineTerminator: '\n', isQuoted: false, trimWhitespace: false});
      let leftover: Buffer = Buffer.from('');
      let headerRow = Buffer.from('"field1","field2,field3,field4\n', 'utf8');
      csvStream.write(headerRow, 'utf8', () => {});
      for (let i = 0; i < 10; i++) {
        let chunk = Buffer.concat([leftover, Buffer.from(`"This","is,pass : ${i},€\r\n`, 'utf8')]);
        let input: Buffer;
        if (i < 9) {
          leftover = chunk.subarray(-1);
          input = chunk.subarray(0, chunk.length - 1);
        } else {
          input = chunk;
        }
        csvStream.write(input, 'utf8', () => {});
      }

      let data = (csvStream as any).data;
      assert.equal((csvStream as any).data.length, 10);
      for (let i = 0; i < 10; i++) {
        assert.equal(data[i][0], `"This"`);
        assert.equal(data[i][1], `"is`);
        assert.equal(data[i][2], `pass : ${i}`);
        assert.equal(data[i][3], `€\r`);
      }

      let headers: BasicColumnNameProcessor = (csvStream as any).headers;
      assert.equal(headers.getColumn(0).finalName, 'field1');
      assert.equal(headers.getColumn(1).finalName, 'field2');
      assert.equal(headers.getColumn(2).finalName, 'field3');
      assert.equal(headers.getColumn(3).finalName, 'field4');
    });

    it('will parse a utf8 file quoted', () => {
      let csvStream = new BasicCsvParser({lineTerminator: '\n', isQuoted: true, trimWhitespace: false});
      let leftover: Buffer = Buffer.from('');
      let headerRow = Buffer.from('"field1",field2,field3,field4\n', 'utf8');
      csvStream.write(headerRow, 'utf8', () => {});
      for (let i = 0; i < 10; i++) {
        let chunk = Buffer.concat([leftover, Buffer.from(`"Th,is","is","pass\n : ${i}",€\r\n`, 'utf8')]);
        let input: Buffer;
        if (i < 9) {
          leftover = chunk.subarray(-1);
          input = chunk.subarray(0, chunk.length - 1);
        } else {
          input = chunk;
        }
        csvStream.write(input, 'utf8', () => {});
      }

      let data = (csvStream as any).data;
      assert.equal((csvStream as any).data.length, 10);
      for (let i = 0; i < 10; i++) {
        assert.equal(data[i][0], `Th,is`);
        assert.equal(data[i][1], `is`);
        assert.equal(data[i][2], `pass\n : ${i}`);
        assert.equal(data[i][3], `€\r`);
      }

      let headers: BasicColumnNameProcessor = (csvStream as any).headers;
      assert.equal(headers.getColumn(0).finalName, 'field1');
      assert.equal(headers.getColumn(1).finalName, 'field2');
      assert.equal(headers.getColumn(2).finalName, 'field3');
      assert.equal(headers.getColumn(3).finalName, 'field4');
    });

    it('will parse a utf8 file with non escaped embeded quoted', () => {
      let csvStream = new BasicCsvParser({lineTerminator: '\n', isQuoted: true, trimWhitespace: false});
      let leftover: Buffer = Buffer.from('');
      let headerRow = Buffer.from('"field1",field2,field3,field4\n', 'utf8');
      csvStream.write(headerRow, 'utf8', () => {});
      for (let i = 0; i < 10; i++) {
        let chunk = Buffer.concat([leftover, Buffer.from(`"Th,is","is",pas"s : ${i},€\r\n`, 'utf8')]);
        let input: Buffer;
        if (i < 9) {
          leftover = chunk.subarray(-1);
          input = chunk.subarray(0, chunk.length - 1);
        } else {
          input = chunk;
        }
        csvStream.write(input, 'utf8', () => {});
      }

      let data = (csvStream as any).data;
      assert.equal((csvStream as any).data.length, 10);
      for (let i = 0; i < 10; i++) {
        assert.equal(data[i][0], `Th,is`);
        assert.equal(data[i][1], `is`);
        assert.equal(data[i][2], `pas"s : ${i}`);
        assert.equal(data[i][3], `€\r`);
      }

      let headers: BasicColumnNameProcessor = (csvStream as any).headers;
      assert.equal(headers.getColumn(0).finalName, 'field1');
      assert.equal(headers.getColumn(1).finalName, 'field2');
      assert.equal(headers.getColumn(2).finalName, 'field3');
      assert.equal(headers.getColumn(3).finalName, 'field4');
    });

    it('will parse a utf8 file quoted with literal', () => {
      let csvStream = new BasicCsvParser({lineTerminator: '\n', isQuoted: true, trimWhitespace: false});
      let leftover: Buffer = Buffer.from('');
      let headerRow = Buffer.from('"field1",field2,field3,field4\n', 'utf8');
      csvStream.write(headerRow, 'utf8', () => {});
      for (let i = 0; i < 10; i++) {
        let chunk = Buffer.concat([leftover, Buffer.from(`"Th\\"is","is","pass\n : ${i}",\\,€\r\n`, 'utf8')]);
        let input: Buffer;
        if (i < 9) {
          leftover = chunk.subarray(-1);
          input = chunk.subarray(0, chunk.length - 1);
        } else {
          input = chunk;
        }
        csvStream.write(input, 'utf8', () => {});
      }

      let data = (csvStream as any).data;
      assert.equal((csvStream as any).data.length, 10);
      for (let i = 0; i < 10; i++) {
        assert.equal(data[i][0], `Th"is`);
        assert.equal(data[i][1], `is`);
        assert.equal(data[i][2], `pass\n : ${i}`);
        assert.equal(data[i][3], `,€\r`);
      }

      let headers: BasicColumnNameProcessor = (csvStream as any).headers;
      assert.equal(headers.getColumn(0).finalName, 'field1');
      assert.equal(headers.getColumn(1).finalName, 'field2');
      assert.equal(headers.getColumn(2).finalName, 'field3');
      assert.equal(headers.getColumn(3).finalName, 'field4');
    });

    it('will parse a utf8 file with broken terminator', () => {
      let csvStream = new BasicCsvParser({lineTerminator: '\r\n', isQuoted: true});
      let leftover: Buffer = Buffer.from('');
      let headerRow = Buffer.from('"field1",field2,field3,field4\r\n', 'utf8');
      csvStream.write(headerRow, 'utf8', () => {});
      for (let i = 0; i < 10; i++) {
        let chunk = Buffer.concat([leftover, Buffer.from(`"Th\\"is","is","pass\n : ${i}",\\,€\r\\,\r\n`, 'utf8')]);
        let input: Buffer;
        if (i < 9) {
          leftover = chunk.subarray(-1);
          input = chunk.subarray(0, chunk.length - 1);
        } else {
          input = chunk;
        }
        csvStream.write(input, 'utf8', () => {});
      }

      let data = (csvStream as any).data;
      assert.equal((csvStream as any).data.length, 10);
      for (let i = 0; i < 10; i++) {
        assert.equal(data[i][0], `Th"is`);
        assert.equal(data[i][1], `is`);
        assert.equal(data[i][2], `pass\n : ${i}`);
        assert.equal(data[i][3], `,€\r,`);
      }

      let headers: BasicColumnNameProcessor = (csvStream as any).headers;
      assert.equal(headers.getColumn(0).finalName, 'field1');
      assert.equal(headers.getColumn(1).finalName, 'field2');
      assert.equal(headers.getColumn(2).finalName, 'field3');
      assert.equal(headers.getColumn(3).finalName, 'field4');
    });

    it.skip('will parse a utf16le file', () => {
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

  context('processing data', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    it('Will process our data in a pipeline and let flush get called to push the data out', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\n');
          for (let i = 0; i < 10; i++) {
            this.push(`This,is,pass : ${i},€\n`);
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({lineTerminator: '\n'}) as any;
      await promises.pipeline(readStream, csvStream, writeStream);
      assert.equal(writeCount, 10);
      assert.isTrue(csvStream.isFlushed);
      assert.isFalse(csvStream.processedBufferBeforeFlush);
    });

    it('Will process our data in a pipeline and overrun the buffer size', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\n');
          for (let i = 0; i < 10; i++) {
            this.push(`This,is,pass : ${i},€\n`);
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({lineTerminator: '\n', bufferSize: 1}) as any;
      await promises.pipeline(readStream, csvStream, writeStream);
      assert.equal(writeCount, 10);
      assert.isFalse(csvStream.isFlushed);
      assert.isTrue(csvStream.processedBufferBeforeFlush);
    });

    it('Will process our data in a pipeline with a last row that does not have a line terminator', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\n');
          for (let i = 0; i < 10; i++) {
            if (i < 9) {
              this.push(`This,is,pass : ${i},€\n`);
            } else {
              this.push(`This,is,pass : ${i},€`);
            }
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({lineTerminator: '\n', bufferSize: 1}) as any;
      await promises.pipeline(readStream, csvStream, writeStream);
      assert.equal(writeCount, 10);
      assert.isFalse(csvStream.isFlushed);
      assert.isTrue(csvStream.processedBufferBeforeFlush);
    });

    it('will process our data in a pipeline with duplicate column names', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field1,field3,field4\n');
          for (let i = 0; i < 10; i++) {
            if (i < 9) {
              this.push(`This,is,pass : ${i},€\n`);
            } else {
              this.push(`This,is,pass : ${i},€`);
            }
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field1_1, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({lineTerminator: '\n', bufferSize: 1}) as any;
      await promises.pipeline(readStream, csvStream, writeStream);
      assert.equal(writeCount, 10);
      assert.isFalse(csvStream.isFlushed);
      assert.isTrue(csvStream.processedBufferBeforeFlush);
    });

    it('will process our data in a pipeline with empty columns', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field1,,field3,,field4,\n');
          for (let i = 0; i < 10; i++) {
            if (i < 9) {
              this.push(`This,is,,pass : ${i},,€,\n`);
            } else {
              this.push(`This,is,,pass : ${i},,€,`);
            }
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field1_1, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({lineTerminator: '\n', bufferSize: 1}) as any;
      await promises.pipeline(readStream, csvStream, writeStream);
      assert.equal(writeCount, 10);
      assert.isFalse(csvStream.isFlushed);
      assert.isTrue(csvStream.processedBufferBeforeFlush);
    });

    it('Will discard emtpy rows', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\n');
          this.push('\n');
          for (let i = 0; i < 10; i++) {
            this.push(`This,is,pass : ${i},€\n`);
            this.push(`\n`);
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({lineTerminator: '\n', bufferSize: 1}) as any;
      await promises.pipeline(readStream, csvStream, writeStream);
      assert.equal(writeCount, 10);
      assert.isFalse(csvStream.isFlushed);
      assert.isTrue(csvStream.processedBufferBeforeFlush);
    });

    it('will throw an error when an underlying decoder throws', async () => {
      let stub = sandbox.stub(Utf8Decoder.prototype, 'getChar');
      stub.throws(new Error('something bad happened'));

      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\n');
          this.push('\n');
          for (let i = 0; i < 10; i++) {
            this.push(`This,is,pass : ${i},€\n`);
            this.push(`\n`);
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({lineTerminator: '\n', bufferSize: 1}) as any;
      let errored = false;
      try {
        await promises.pipeline(readStream, csvStream, writeStream);
      } catch (err) {
        errored = true;
        assert.instanceOf(err, error.FileParseError);
      }
      assert.isTrue(errored);
    });

    it('will throw an error when there are not enough columns to model', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\n');
          for (let i = 0; i < 10; i++) {
            this.push('this,,,\n');
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({lineTerminator: '\n', bufferSize: 1}) as any;
      let errored = false;
      try {
        await promises.pipeline(readStream, csvStream, writeStream);
      } catch (err) {
        errored = true;
        assert.instanceOf(err, error.FileParseError);
      }
      assert.isTrue(errored);
    });

    it('will throw an error when the column count is less than the number of headers', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\n');
          for (let i = 0; i < 10; i++) {
            this.push('this\n');
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({lineTerminator: '\n', bufferSize: 1}) as any;
      let errored = false;
      try {
        await promises.pipeline(readStream, csvStream, writeStream);
      } catch (err) {
        errored = true;
        assert.instanceOf(err, error.FileParseError);
      }
      assert.isTrue(errored);
    });

    it('will throw an error when the column count is greater than the number of headers', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\n');
          for (let i = 0; i < 10; i++) {
            this.push(`this,is,pass,number,${i}\n`);
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({lineTerminator: '\n', bufferSize: 1}) as any;
      let errored = false;
      try {
        await promises.pipeline(readStream, csvStream, writeStream);
      } catch (err) {
        errored = true;
        assert.instanceOf(err, error.FileParseError);
      }
      assert.isTrue(errored);
    });

    it('Will automatically trim off whitespace', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1 ,field2 ,field3 ,field4 \n');
          for (let i = 0; i < 10; i++) {
            this.push(` This , is , pass : ${i} , € \n`);
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({lineTerminator: '\n'}) as any;
      await promises.pipeline(readStream, csvStream, writeStream);
      assert.equal(writeCount, 10);
      assert.isTrue(csvStream.isFlushed);
      assert.isFalse(csvStream.processedBufferBeforeFlush);
    });

    it('Will not automatically trim off whitespace when set', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\n');
          for (let i = 0; i < 10; i++) {
            this.push(` This , is , pass : ${i} , € \n`);
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, ' This ');
          assert.equal(chunk.field2, ' is ');
          assert.equal(chunk.field3, ` pass : ${writeCount} `);
          assert.equal(chunk.field4, ' € ');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({lineTerminator: '\n', trimWhitespace: false}) as any;
      await promises.pipeline(readStream, csvStream, writeStream);
      assert.equal(writeCount, 10);
      assert.isTrue(csvStream.isFlushed);
      assert.isFalse(csvStream.processedBufferBeforeFlush);
    });

    it('will trim whitespace treating " " as an empty column and throw an error becauset here are not enough columns to model', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\n');
          for (let i = 0; i < 10; i++) {
            this.push('this, , , \n');
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({lineTerminator: '\n', bufferSize: 1}) as any;
      let errored = false;
      try {
        await promises.pipeline(readStream, csvStream, writeStream);
      } catch (err) {
        errored = true;
        assert.instanceOf(err, error.FileParseError);
      }
      assert.isTrue(errored);
    });

    it('Will let the parser use our smart terminator functionality to determine that \n is the terminator', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\n');
          for (let i = 0; i < 10; i++) {
            this.push(`This,is,pass : ${i},€\n`);
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({}) as any;
      await promises.pipeline(readStream, csvStream, writeStream);
      assert.equal(writeCount, 10);
      assert.isTrue(csvStream.isFlushed);
      assert.isFalse(csvStream.processedBufferBeforeFlush);
    });

    it('Will let the parser use our smart terminator functionality to determine that \r is the terminator', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\r');
          for (let i = 0; i < 10; i++) {
            this.push(`This,is,pass : ${i},€\r`);
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({}) as any;
      await promises.pipeline(readStream, csvStream, writeStream);
      assert.equal(writeCount, 10);
      assert.isTrue(csvStream.isFlushed);
      assert.isFalse(csvStream.processedBufferBeforeFlush);
    });

    it('Will let the parser use our smart terminator functionality to determine that \r\n is the terminator', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\r\n');
          for (let i = 0; i < 10; i++) {
            this.push(`This,is,pass : ${i},€\r\n`);
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({}) as any;
      await promises.pipeline(readStream, csvStream, writeStream);
      assert.equal(writeCount, 10);
      assert.isTrue(csvStream.isFlushed);
      assert.isFalse(csvStream.processedBufferBeforeFlush);
    });

    it('Will let the parser use our smart terminator functionality to determine that there is a mix of terminators in the data', async () => {
      let readStream = new Readable({
        read(size) {
          this.push('field1,field2,field3,field4\r\n');
          for (let i = 0; i < 10; i++) {
            if (!(i % 2)) {
              this.push(`This,is,pass : ${i},€\n`);
            } else {
              this.push(`This,is,pass : ${i},€\r`);
            }
          }
          this.push(null);
        },
      });
      let writeCount = 0;
      let writeStream = new Writable({
        objectMode: true,
        write(chunk: any, encoding, callback) {
          assert.equal(chunk.field1, 'This');
          assert.equal(chunk.field2, 'is');
          assert.equal(chunk.field3, `pass : ${writeCount}`);
          assert.equal(chunk.field4, '€');
          writeCount++;
          callback();
        },
      });
      //cast to any so we can get at the private properties
      let csvStream = new BasicCsvParser({}) as any;
      await promises.pipeline(readStream, csvStream, writeStream);
      assert.equal(writeCount, 10);
      assert.isTrue(csvStream.isFlushed);
      assert.isFalse(csvStream.processedBufferBeforeFlush);
    });
  });
});

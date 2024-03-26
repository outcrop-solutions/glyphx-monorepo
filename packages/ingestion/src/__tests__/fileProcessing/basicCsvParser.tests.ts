import 'mocha';
import {assert} from 'chai';
import {BasicCsvParser, BasicColumnNameProcessor} from '../../fileProcessing';

import iconv from 'iconv-lite';
describe.only('#fileProcessing/BasicCsvParser', () => {
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
      let csvStream = new BasicCsvParser({lineTerminator: '\n'});
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
      let csvStream = new BasicCsvParser({lineTerminator: '\n', isQuoted: false});
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
      let csvStream = new BasicCsvParser({lineTerminator: '\n', isQuoted: true});
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

    it('will parse a utf8 file quoted with literal', () => {
      let csvStream = new BasicCsvParser({lineTerminator: '\n', isQuoted: true});
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
});

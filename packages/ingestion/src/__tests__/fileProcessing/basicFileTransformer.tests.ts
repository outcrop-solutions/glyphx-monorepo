import {assert} from 'chai';
import {BasicFileTransformer, BasicColumnNameCleaner} from '@fileProcessing';
import {BasicFieldTypeCalculator} from 'fieldProcessing';
import * as fileProcessingInterfaces from '@interfaces/fileProcessing';
import {FILE_PROCESSING_ERROR_TYPES} from '@util/constants';
import {Writable, Readable} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {fileIngestion} from '@glyphx/types';

describe('#fileProcessing/basicFileTransformer', () => {
  context('basic processing', () => {
    it('should process 1000 objects and return correct types and information', async () => {
      const fileName = 'testFileName';
      const fileSize = 99999;
      const outputFileName = `${fileName}.parquet`;
      const outputDirectory = 'dir1/';
      const tableName = fileName;
      const numberOfRows = 1000;
      let hasErrors = false;
      let firstRow = true;
      let done = false;
      const fileTransformer = new BasicFileTransformer(
        fileName,
        fileSize,
        outputFileName,
        outputDirectory,
        tableName,
        fileIngestion.constants.FILE_OPERATION.ADD,
        (info: fileProcessingInterfaces.IFileInformation) => {
          assert.strictEqual(info.fileName, fileName);
          assert.strictEqual(info.fileSize, fileSize);
          assert.strictEqual(info.tableName, tableName);
          assert.strictEqual(info.parquetFileName, outputFileName);
          assert.strictEqual(info.outputFileDirecotry, outputDirectory);
          assert.strictEqual(info.numberOfRows, numberOfRows);
          assert.strictEqual(info.numberOfColumns, 2);
          assert.strictEqual(
            info.fileOperationType,
            fileIngestion.constants.FILE_OPERATION.ADD
          );

          assert.strictEqual(info.columns[0].name, 'name');
          assert.strictEqual(info.columns[0].origionalName, 'name');
          assert.strictEqual(
            info.columns[0].fieldType,
            fileIngestion.constants.FIELD_TYPE.STRING
          );
          assert.strictEqual(info.columns[0].longestString, 8);

          assert.strictEqual(info.columns[1].name, 'value');
          assert.strictEqual(info.columns[1].origionalName, 'value');
          assert.strictEqual(
            info.columns[1].fieldType,
            fileIngestion.constants.FIELD_TYPE.NUMBER
          );
          done = true;
        },

        () => {
          hasErrors = true;
        },
        BasicFieldTypeCalculator,
        BasicColumnNameCleaner
      );
      const readStream = new Readable({
        objectMode: true,
        read: () => {
          for (let i = 0; i < numberOfRows; i++) {
            readStream.push({name: `field${i}`, value: i.toString()});
          }

          readStream.push(null);
        },
      });
      let seenRows = 0;
      await pipeline(
        readStream,
        fileTransformer,
        new Writable({
          objectMode: true,
          write: (chunk, encoding, callback) => {
            if (firstRow) {
              assert.isDefined(chunk.name);
              assert.strictEqual(chunk.name.type, 'UTF8');
              assert.strictEqual(chunk.name.encoding, 'PLAIN');
              assert.isFalse(chunk.name.optional);
              assert.isDefined(chunk.value);
              assert.strictEqual(chunk.value.type, 'DOUBLE');
              assert.strictEqual(chunk.value.encoding, 'PLAIN');
              assert.isTrue(chunk.value.optional);
              firstRow = false;
            } else {
              seenRows++;
              assert.isString(chunk.name);
              assert.isNumber(chunk.value);
            }
            callback();
          },
        })
      );
      assert.isFalse(hasErrors);
      assert.strictEqual(seenRows, numberOfRows);
      assert.isTrue(done);
    });
    it('should process 10 objects and return correct types and information', async () => {
      const fileName = 'testFileName';
      const outputFileName = `${fileName}.parquet`;
      const outputDirectory = 'dir1/';
      const tableName = fileName;
      const fileSize = 99999;
      const numberOfRows = 10;
      let hasErrors = false;
      let done = false;
      const fileTransformer = new BasicFileTransformer(
        fileName,
        fileSize,
        outputFileName,
        outputDirectory,
        tableName,
        fileIngestion.constants.FILE_OPERATION.ADD,
        () => {
          done = true;
        },

        () => {
          hasErrors = true;
        },
        BasicFieldTypeCalculator,
        BasicColumnNameCleaner
      );
      const readStream = new Readable({
        objectMode: true,
        read: () => {
          for (let i = 0; i < numberOfRows; i++) {
            readStream.push({name: `field${i}`, value: i.toString()});
          }

          readStream.push(null);
        },
      });
      let seenRows = -1; //this first row is a header which we do not count
      await pipeline(
        readStream,
        fileTransformer,
        new Writable({
          objectMode: true,
          write: (chunk, encoding, callback) => {
            seenRows++;
            callback();
          },
        })
      );
      assert.isFalse(hasErrors);

      assert.strictEqual(seenRows, numberOfRows);
      assert.isTrue(done);
    });
    it('should process 100 objects and return correct types and information', async () => {
      const fileName = 'testFileName';
      const outputFileName = `${fileName}.parquet`;
      const outputDirectory = 'dir1/';
      const tableName = fileName;
      const fileSize = 99999;
      const numberOfRows = 100;
      let hasErrors = false;
      let done = false;
      const fileTransformer = new BasicFileTransformer(
        fileName,
        fileSize,
        outputFileName,
        outputDirectory,
        tableName,
        fileIngestion.constants.FILE_OPERATION.ADD,
        () => {
          done = true;
        },

        () => {
          hasErrors = true;
        },
        BasicFieldTypeCalculator,
        BasicColumnNameCleaner
      );
      const readStream = new Readable({
        objectMode: true,
        read: () => {
          for (let i = 0; i < numberOfRows; i++) {
            readStream.push({name: `field${i}`, value: i.toString()});
          }

          readStream.push(null);
        },
      });
      let seenRows = -1; //this first row is a header which we do not count
      await pipeline(
        readStream,
        fileTransformer,
        new Writable({
          objectMode: true,
          write: (chunk, encoding, callback) => {
            seenRows++;
            callback();
          },
        })
      );
      assert.isFalse(hasErrors);

      assert.strictEqual(seenRows, numberOfRows);
      assert.isTrue(done);
    });
    it('should process 123 objects and return correct types and information', async () => {
      const fileName = 'testFileName';
      const outputFileName = `${fileName}.parquet`;
      const outputDirectory = 'dir1/';
      const tableName = fileName;
      const fileSize = 99999;
      const numberOfRows = 123;
      let hasErrors = false;
      let done = false;
      const fileTransformer = new BasicFileTransformer(
        fileName,
        fileSize,
        outputFileName,
        outputDirectory,
        tableName,
        fileIngestion.constants.FILE_OPERATION.ADD,
        () => {
          done = true;
        },

        () => {
          hasErrors = true;
        },
        BasicFieldTypeCalculator,
        BasicColumnNameCleaner
      );
      const readStream = new Readable({
        objectMode: true,
        read: () => {
          for (let i = 0; i < numberOfRows; i++) {
            readStream.push({name: `field${i}`, value: i.toString()});
          }

          readStream.push(null);
        },
      });
      let seenRows = -1; //this first row is a header which we do not count
      await pipeline(
        readStream,
        fileTransformer,
        new Writable({
          objectMode: true,
          write: (chunk, encoding, callback) => {
            seenRows++;
            callback();
          },
        })
      );
      assert.isFalse(hasErrors);

      assert.strictEqual(seenRows, numberOfRows);
      assert.isTrue(done);
    });
  });

  context('Transform Data with Errors', () => {
    it('should process 100 rows with 50 errors', async () => {
      try {
        const fileName = 'testFileName';
        const outputFileName = `${fileName}.parquet`;
        const outputDirectory = 'dir1/';
        const tableName = fileName;
        const fileSize = 99999;
        const numberOfRows = 100;
        let hasErrors = false;
        let numberOfErrors = 0;
        let done = false;
        const fileTransformer = new BasicFileTransformer(
          fileName,
          fileSize,
          outputFileName,
          outputDirectory,
          tableName,
          fileIngestion.constants.FILE_OPERATION.ADD,
          () => {
            done = true;
          },

          (err: fileProcessingInterfaces.IFileProcessingError) => {
            hasErrors = true;
            numberOfErrors++;
            assert.strictEqual(err.columnIndex, 1);
            assert.strictEqual(err.columnName, 'value');
            assert.strictEqual(
              err.errorType,
              FILE_PROCESSING_ERROR_TYPES.INVALID_FIELD_VALUE
            );
            assert.isAtLeast(err.rowIndex ?? -1, 11);
            assert.isAtMost(err.rowIndex ?? -1, 60);
          },
          BasicFieldTypeCalculator,
          BasicColumnNameCleaner,
          10
        );
        const readStream = new Readable({
          objectMode: true,
          read: () => {
            for (let i = 0; i < numberOfRows; i++) {
              if (i < 10 || i >= 60)
                readStream.push({name: `field${i}`, value: i.toString()});
              else
                readStream.push({
                  name: `field${i}`,
                  value: 'I am not a number',
                });
            }

            readStream.push(null);
          },
        });
        let seenRows = -1; //this first row is a header which we do not count
        await pipeline(
          readStream,
          fileTransformer,
          new Writable({
            objectMode: true,
            write: (chunk, encoding, callback) => {
              seenRows++;
              if (seenRows > 10 && seenRows <= 60) {
                assert.isNull(chunk.value);
              }
              callback();
            },
          })
        );
        assert.isTrue(hasErrors);
        assert.strictEqual(numberOfErrors, 50);
        assert.strictEqual(seenRows, numberOfRows);
        assert.isTrue(done);
      } catch (err) {
        console.log(err);
      }
    });
  });
});
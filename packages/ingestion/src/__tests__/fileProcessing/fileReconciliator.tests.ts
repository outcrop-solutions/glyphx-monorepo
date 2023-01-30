import {assert} from 'chai';
import {FileReconciliator} from '@fileProcessing';
import {IFileInformation} from '@interfaces/fileProcessing';
import {fileIngestion} from '@glyphx/types';

/*
 * this is a pretty hairy test that has some built in assumptions that I won't explain here,
 * before you start making changes you should review the logic of the FileReconciliator
 * so that you can understand how this is working.  PLease do not modify the data structures
 * or the tests unless you realy know what you are doing.
 */
const fileInfo = [
  {
    tableName: 'table1',
    fileName: 'file1.csv',
    operation: fileIngestion.constants.FILE_OPERATION.ADD,
  },
  {
    tableName: 'table1',
    fileName: 'file1-1.csv',
    operation: fileIngestion.constants.FILE_OPERATION.APPEND,
  },
  {
    tableName: 'table2',
    fileName: 'file2.csv',
    operation: fileIngestion.constants.FILE_OPERATION.REPLACE,
  },
  {
    tableName: 'table3',
    fileName: 'file3-1.csv',
    operation: fileIngestion.constants.FILE_OPERATION.APPEND,
  },
  {
    tableName: 'table4',
    fileName: 'file4.csv',
    operation: fileIngestion.constants.FILE_OPERATION.DELETE,
  },
] as unknown as fileIngestion.IFileInfo[];

const existingFiles = [
  {
    fileName: 'table2.csv',
    tableName: 'table2',
    numberOfRows: 63,
    numberOfColumns: 4,
    columns: [],
    fileSize: 6363,
  },
  {
    fileName: 'file3.csv',
    tableName: 'table3',
    numberOfRows: 63,
    numberOfColumns: 4,
    columns: [],
    fileSize: 6363,
  },
  {
    fileName: 'file4.csv',
    tableName: 'table4',
    numberOfRows: 63,
    numberOfColumns: 4,
    columns: [],
    fileSize: 6363,
  },
];

const processedFiles = [
  {
    fileName: 'file1.csv',
    parquetFileName: 'file1.parquet',
    tableName: 'table1',
    outputFileDirecotry: 'table1',
    numberOfRows: 10,
    numberOfColumns: 4,
    columns: [],
    fileSize: 9999,
    fileOperationType: fileIngestion.constants.FILE_OPERATION.ADD,
  },
  {
    fileName: 'file1-1.csv',
    parquetFileName: 'file1-1.parquet',
    tableName: 'table1',
    outputFileDirecotry: 'table1',
    numberOfRows: 10,
    numberOfColumns: 4,
    columns: [],
    fileSize: 9999,
    fileOperationType: fileIngestion.constants.FILE_OPERATION.APPEND,
  },
  {
    fileName: 'file2.csv',
    parquetFileName: 'file2.parquet',
    tableName: 'table2',
    outputFileDirecotry: 'table2',
    numberOfRows: 10,
    numberOfColumns: 4,
    columns: [],
    fileSize: 9999,
    fileOperationType: fileIngestion.constants.FILE_OPERATION.REPLACE,
  },
  {
    fileName: 'file3-1.csv',
    parquetFileName: 'file3-1.parquet',
    tableName: 'table3',
    outputFileDirecotry: 'table2',
    numberOfRows: 10,
    numberOfColumns: 4,
    columns: [],
    fileSize: 9999,
    fileOperationType: fileIngestion.constants.FILE_OPERATION.APPEND,
  },
];

describe('#fileProcessing/FileReconciliator', () => {
  context('reconcileFileInformation', () => {
    it('will recocile our fileInformation', () => {
      const clientId = 'testClientId';
      const modelId = 'testModelId';

      const reconciledResults = FileReconciliator.reconcileFileInformation(
        clientId,
        modelId,
        fileInfo,
        processedFiles,
        existingFiles
      );
      //file1.csv, file1-1.csv, file2.csv, file3-1.csv, file3-csv
      assert.strictEqual(reconciledResults.allFiles.length, 5);
      assert.isOk(
        reconciledResults.allFiles.find(f => (f.fileName = 'file1.csv'))
      );
      assert.isOk(
        reconciledResults.allFiles.find(f => (f.fileName = 'file1-1.csv'))
      );
      assert.isOk(
        reconciledResults.allFiles.find(f => (f.fileName = 'file2.csv'))
      );
      assert.isOk(
        reconciledResults.allFiles.find(f => (f.fileName = 'file3.csv'))
      );
      assert.isOk(
        reconciledResults.allFiles.find(f => (f.fileName = 'file3-1.csv'))
      );

      //table1, table2, table3
      assert.strictEqual(reconciledResults.accumFiles.length, 3);
      const table1Name = `${clientId}_${modelId}_table1`.toLowerCase();
      const table1 = reconciledResults.accumFiles.find(
        f => f.tableName === table1Name
      );

      const processedTable1 = processedFiles.filter(
        t => t.tableName === 'table1'
      );
      const numberOfRows1 =
        processedTable1?.reduce((accum, t) => {
          return (accum += t.numberOfRows);
        }, 0) ?? 0;
      const fileSize1 =
        processedTable1?.reduce((accum, t) => {
          return (accum += t.fileSize);
        }, 0) ?? 0;

      assert.isOk(table1);
      assert.strictEqual(table1?.numberOfRows, numberOfRows1);
      assert.strictEqual(table1?.fileSize, fileSize1);

      const table2Name = `${clientId}_${modelId}_table2`.toLowerCase();
      const table2 = reconciledResults.accumFiles.find(
        f => f.tableName === table2Name
      );
      const processedTable2 = processedFiles.filter(
        t => t.tableName === 'table2'
      );
      const numberOfRows2 =
        processedTable2?.reduce((accum, t) => {
          return (accum += t.numberOfRows);
        }, 0) ?? 0;
      const fileSize2 =
        processedTable2?.reduce((accum, t) => {
          return (accum += t.fileSize);
        }, 0) ?? 0;
      assert.isOk(table2);
      assert.strictEqual(table2?.numberOfRows, numberOfRows2);
      assert.strictEqual(table2?.fileSize, fileSize2);

      const table3Name = `${clientId}_${modelId}_table3`.toLowerCase();
      const table3 = reconciledResults.accumFiles.find(
        f => f.tableName === table3Name
      );
      const processedTable3 = processedFiles.filter(
        t => t.tableName === 'table3'
      );

      const existingTable3 = existingFiles.filter(
        t => t.tableName === 'table3'
      );
      const numberOfRows3 =
        (processedTable3?.reduce((accum, t) => {
          return (accum += t.numberOfRows);
        }, 0) ?? 0) +
        (existingTable3?.reduce((accum, t) => {
          return (accum += t.numberOfRows);
        }, 0) ?? 0);

      const fileSize3 =
        (processedTable3.reduce((accum, t) => {
          return (accum += t.fileSize);
        }, 0) ?? 0) +
        (existingTable3.reduce((accum, t) => {
          return (accum += t.fileSize);
        }, 0) ?? 0);
      assert.isOk(table3);
      assert.strictEqual(table3?.numberOfRows, numberOfRows3);
      assert.strictEqual(table3?.fileSize, fileSize3);
      console.log(reconciledResults);
    });
  });
});

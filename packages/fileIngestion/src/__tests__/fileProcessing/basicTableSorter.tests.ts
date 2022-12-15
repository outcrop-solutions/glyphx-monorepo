import {assert} from 'chai';
import * as fileProcessingInterfaces from '@interfaces/fileProcessing';
import {BasicTableSorter} from '@fileProcessing';
import {error} from '@glyphx/core';
import {fileIngestion} from '@glyphx/types';

describe('#fileProcessing/BasicTableSorter', () => {
  const table1: fileProcessingInterfaces.IFileInformation = {
    fileName: 'table1',
    parquetFileName: 'table1.parquet',
    tableName: 'table1',
    outputFileDirecotry: 'output/',
    numberOfRows: 100,
    numberOfColumns: 10,
    columns: [],
    fileSize: 1000,
    fileOperationType: fileIngestion.constants.FILE_OPERATION.ADD,
  };
  const table2: fileProcessingInterfaces.IFileInformation = {
    fileName: 'table2',
    parquetFileName: 'table2.parquet',
    tableName: 'table2',
    outputFileDirecotry: 'output/',
    numberOfRows: 100,
    numberOfColumns: 10,
    columns: [],
    fileSize: 500,
    fileOperationType: fileIngestion.constants.FILE_OPERATION.ADD,
  };
  const table3: fileProcessingInterfaces.IFileInformation = {
    fileName: 'table3',
    parquetFileName: 'table3.parquet',
    tableName: 'table3',
    outputFileDirecotry: 'output/',
    numberOfRows: 10,
    numberOfColumns: 10,
    columns: [],
    fileSize: 5000,
    fileOperationType: fileIngestion.constants.FILE_OPERATION.ADD,
  };

  context('sortTables', () => {
    it('should sort table1, table2, table3 as table1, table2, table3', () => {
      const tableSorter = new BasicTableSorter();
      const results = tableSorter.sortTables([table1, table2, table3]);

      assert.strictEqual(results.length, 3);
      assert.strictEqual(results[0], table1);
      assert.strictEqual(results[1], table2);
      assert.strictEqual(results[2], table3);
    });
    it('should sort table3, table2, table1 as table1, table2, table3', () => {
      const tableSorter = new BasicTableSorter();
      const results = tableSorter.sortTables([table3, table2, table1]);

      assert.strictEqual(results.length, 3);
      assert.strictEqual(results[0], table1);
      assert.strictEqual(results[1], table2);
      assert.strictEqual(results[2], table3);
    });
    it('should sort table2, table3, table1 as table1, table2, table3', () => {
      const tableSorter = new BasicTableSorter();
      const results = tableSorter.sortTables([table2, table3, table1]);

      assert.strictEqual(results.length, 3);
      assert.strictEqual(results[0], table1);
      assert.strictEqual(results[1], table2);
      assert.strictEqual(results[2], table3);
    });
  });
  context('accessors', () => {
    it('should return the sorted tables calling sortedTables', () => {
      const tableSorter = new BasicTableSorter();
      const results = tableSorter.sortTables([table1, table2, table3]);

      assert.strictEqual(tableSorter.sortedTables, results);
    });
    it('should throw an InvalidOperationException if I have made a call to sortTables before calling sortTables', () => {
      const tableSorter = new BasicTableSorter();
      let hasError = false;
      try {
        tableSorter.sortedTables;
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        hasError = true;
      }

      assert.isTrue(hasError);
    });
  });
});

import 'mocha';
import {assert} from 'chai';
import * as fileIngestionFunctions from '../../generalPurposeFunctions/fileIngestion';

describe('#generalPurposeFunctions/fileIngestion', () => {
  const clientId = 'testClientId';
  const modelId = 'testModelId';
  const tableName = 'testTableName';
  context('getFullTableName', () => {
    it('will return the full table name', () => {
      const fileName = fileIngestionFunctions.getFullTableName(
        clientId,
        modelId,
        tableName
      );
      assert.isNotEmpty(fileName);
    });
  });

  context('getViewName', () => {
    it('will return the viewName', () => {
      const viewName = fileIngestionFunctions.getViewName(clientId, modelId);
      assert.isNotEmpty(viewName);
    });
  });

  context('getTableCsvPath', () => {
    it('will get the csv file path', () => {
      const path = fileIngestionFunctions.getTableCsvPath(
        clientId,
        modelId,
        tableName
      );
      assert.isNotEmpty(path);
    });
  });

  context('getTableParquetPath', () => {
    it('will get the prquet file path', () => {
      const path = fileIngestionFunctions.getTableParquetPath(
        clientId,
        modelId,
        tableName
      );
      assert.isNotEmpty(path);
    });
  });

  context('getArchiveFilePath', () => {
    it('will get the archived file path', () => {
      const key =
        fileIngestionFunctions.getTableCsvPath(clientId, modelId, tableName) +
        'file.csv';
      const path = fileIngestionFunctions.getArchiveFilePath(
        clientId,
        modelId,
        key,
        '00000000000000'
      );
      assert.isNotNull(path);
    });
  });
});

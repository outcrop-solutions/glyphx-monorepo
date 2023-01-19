import {assert} from 'chai';
import {generalPurposeFunctions} from '@util';

describe('#util/generalPurposeFunctions', () => {
  const clientId = 'testClientId';
  const modelId = 'testModelId';
  const tableName = 'testTableName';
  context('getFullTableName', () => {
    it('will return the full table name', () => {
      const fileName = generalPurposeFunctions.getFullTableName(
        clientId,
        modelId,
        tableName
      );
      assert.isNotEmpty(fileName);
    });
  });

  context('getViewName', () => {
    it('will return the viewName', () => {
      const viewName = generalPurposeFunctions.getViewName(clientId, modelId);
      assert.isNotEmpty(viewName);
    });
  });

  context('getTableCsvPath', () => {
    it('will get the csv file path', () => {
      const path = generalPurposeFunctions.getTableCsvPath(
        clientId,
        modelId,
        tableName
      );
      assert.isNotEmpty(path);
    });
  });

  context('getTableParquetPath', () => {
    it('will get the prquet file path', () => {
      const path = generalPurposeFunctions.getTableParquetPath(
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
        generalPurposeFunctions.getTableCsvPath(clientId, modelId, tableName) +
        'file.csv';
      const path = generalPurposeFunctions.getArchiveFilePath(
        clientId,
        modelId,
        key,
        '00000000000000'
      );
      assert.isNotNull(path);
    });
  });
});

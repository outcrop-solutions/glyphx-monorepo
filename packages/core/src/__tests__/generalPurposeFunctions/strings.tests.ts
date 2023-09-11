import {assert} from 'chai';
import {string} from '../../generalPurposeFunctions/';

describe('#generalPurposeFunctions/string', () => {
  context('checkAndAddTrailingSlash', () => {
    it('should not  add a trailing slash if one does not exist', () => {
      const input = 'testString/';
      const output = string.checkAndAddTrailingSlash(input);
      assert.strictEqual(input, output);
    });

    it('should  add a trailing slash if one does not exist', () => {
      const input = 'testString';
      const output = string.checkAndAddTrailingSlash(input);
      assert.strictEqual(input + '/', output);
    });
  });

  context('getFileNameMinusExtension', () => {
    it('should strip the .parquet from the fileName', () => {
      const tablePrefix = 'table1';

      const modifiedTableName = string.getFileNameMinusExtension(`${tablePrefix}.parquet`);
      assert.strictEqual(modifiedTableName, tablePrefix);
    });
    it('should strip the .parquet.gz from the fileName', () => {
      const tablePrefix = 'table1';

      const modifiedTableName = string.getFileNameMinusExtension(`${tablePrefix}.parquet.gz`);
      assert.strictEqual(modifiedTableName, tablePrefix);
    });
    it('should pass through a file without an extension', () => {
      const tablePrefix = 'table1';

      const modifiedTableName = string.getFileNameMinusExtension(`${tablePrefix}`);
      assert.strictEqual(modifiedTableName, tablePrefix);
    });
  });
  context('getFileNameExtension', () => {
    it('should strip the fileName from the .parquet fileName', () => {
      const tablePrefix = 'table1';
      const tableExtension = 'parquet';

      const extension = string.getFileNameExtension(`${tablePrefix}.${tableExtension}`);
      assert.strictEqual(extension, tableExtension);
    });
    it('should strip the filename from a .parquet.gz fileName', () => {
      const tablePrefix = 'table1';
      const tableExtension = 'parquet.gz';

      const extension = string.getFileNameExtension(`${tablePrefix}.${tableExtension}`);
      assert.strictEqual(extension, tableExtension);
    });
    it('should return empty sring if no extension', () => {
      const tablePrefix = 'table1';

      const extension = string.getFileNameExtension(`${tablePrefix}`);
      assert.strictEqual(extension, '');
    });
  });
  context('deconstructFilePath', () => {
    it('should deconstruct the file path client/123456/34567/input/table1/table1.csv', () => {
      const prefix = 'client';
      const clientId = '123456';
      const modelId = '34567';
      const source = 'input';
      const tableName = 'table1';
      const fileName = 'table1';
      const extension = 'csv';

      const path = `${prefix}/${clientId}/${modelId}/${source}/${tableName}/${fileName}.${extension}`;

      const deconstructedFilePath = string.deconstructFilePath(path);
      assert.strictEqual(deconstructedFilePath.pathParts.length, 5);
      assert.strictEqual(deconstructedFilePath.pathParts[0], prefix);
      assert.strictEqual(deconstructedFilePath.pathParts[1], clientId);
      assert.strictEqual(deconstructedFilePath.pathParts[2], modelId);
      assert.strictEqual(deconstructedFilePath.pathParts[3], source);
      assert.strictEqual(deconstructedFilePath.pathParts[4], tableName);
      assert.strictEqual(deconstructedFilePath.baseName, fileName);
      assert.strictEqual(deconstructedFilePath.extension, extension);
      assert.strictEqual(deconstructedFilePath.fileName, `${fileName}.${extension}`);
    });
    it('should deconstruct the file path table1.csv', () => {
      const fileName = 'table1';
      const extension = 'csv';

      const path = `${fileName}.${extension}`;

      const deconstructedFilePath = string.deconstructFilePath(path);
      assert.strictEqual(deconstructedFilePath.pathParts.length, 0);
      assert.strictEqual(deconstructedFilePath.baseName, fileName);
      assert.strictEqual(deconstructedFilePath.extension, extension);
      assert.strictEqual(deconstructedFilePath.fileName, `${fileName}.${extension}`);
    });
    it('should deconstruct the file path table1', () => {
      const fileName = 'table1';

      const path = `${fileName}`;

      const deconstructedFilePath = string.deconstructFilePath(path);
      assert.strictEqual(deconstructedFilePath.pathParts.length, 0);
      assert.strictEqual(deconstructedFilePath.baseName, fileName);
      assert.strictEqual(deconstructedFilePath.extension, '');
      assert.strictEqual(deconstructedFilePath.fileName, fileName);
    });
  });
});

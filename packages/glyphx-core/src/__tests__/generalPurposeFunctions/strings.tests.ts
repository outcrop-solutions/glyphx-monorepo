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

      const modifiedTableName = string.getFileNameMinusExtension(
        `${tablePrefix}.parquet`
      );
      assert.strictEqual(modifiedTableName, tablePrefix);
    });
    it('should strip the .parquet.gz from the fileName', () => {
      const tablePrefix = 'table1';

      const modifiedTableName = string.getFileNameMinusExtension(
        `${tablePrefix}.parquet.gz`
      );
      assert.strictEqual(modifiedTableName, tablePrefix);
    });
    it('should pass through a file without an extension', () => {
      const tablePrefix = 'table1';

      const modifiedTableName = string.getFileNameMinusExtension(
        `${tablePrefix}`
      );
      assert.strictEqual(modifiedTableName, tablePrefix);
    });
  });
});

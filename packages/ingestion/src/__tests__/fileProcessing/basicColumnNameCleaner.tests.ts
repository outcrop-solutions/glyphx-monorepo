import 'mocha';
import {assert} from 'chai';
import {BasicColumnNameCleaner} from '@fileProcessing';

describe('#fileProcessing/BasicColumnNameCleaner', () => {
  context('cleanColmnName', () => {
    it('will pass throug a column name with no special characters', () => {
      const columnName = 'IAmAGoodColumnName';
      const columnNameCleaner = new BasicColumnNameCleaner();

      const cleanName = columnNameCleaner.cleanColumnName(columnName);

      assert.strictEqual(columnName.toLowerCase(), cleanName);
    });
    it('will convert reserved characters to _', () => {
      const columnName = 'I-Am A(Good)ColumnName';
      const columnNameCleaner = new BasicColumnNameCleaner();

      const cleanName = columnNameCleaner.cleanColumnName(columnName);

      assert.strictEqual(cleanName, 'I_Am_A_Good_ColumnName'.toLowerCase());
    });
    it('will remove unwanted characters', () => {
      let columnName = '';
      for (let i = 32; i <= 127; i++) {
        if (i === 32 || i === 40 || i === 41 || i === 45) continue;
        columnName += String.fromCharCode(i);
      }
      const columnNameCleaner = new BasicColumnNameCleaner();

      const cleanName = columnNameCleaner.cleanColumnName(columnName);
      for (let i = 0; i < cleanName.length; i++) {
        const charValue = cleanName.charCodeAt(i);
        assert.isTrue(
          charValue === 95 || //_
            (charValue >= 48 && charValue <= 57) || //0-9
            (charValue >= 97 && charValue <= 122), //a-z
          `${i} - ${cleanName[i]} - ${charValue}`
        );
      }
    });
    it('will remove leading underscores no matter how many there are', () => {
      const columnName = '_____leadingunderscoreColumnName';
      const columnNameCleaner = new BasicColumnNameCleaner();

      const cleanName = columnNameCleaner.cleanColumnName(columnName);
      const charValue = cleanName.charCodeAt(0);
      assert.isTrue(
        charValue !== 95 //_
      );
    });
    it('will create a default name when the clean column name equals an empty string', () => {
      const columnName = '0';
      const columnNameCleaner = new BasicColumnNameCleaner();

      const result = columnNameCleaner.cleanColumnName(columnName);
      assert.strictEqual(result, 'invalid_0');
    });
  });
});

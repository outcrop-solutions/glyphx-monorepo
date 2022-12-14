import {assert} from 'chai';
import {BasicColumnNameCleaner} from '@fileProcessing';

describe('#fileProcessing/BasicColumnNameCleaner', () => {
  context('cleanColmnName', () => {
    it('will pass throug a column name with no special characters', () => {
      const columnName = 'IAmAGoodColumnName';
      const columnNameCleaner = new BasicColumnNameCleaner();

      const cleanName = columnNameCleaner.cleanColumnName(columnName);

      assert.strictEqual(columnName, cleanName);
    });
    it('will convert reserved characters to _ ', () => {
      const columnName = 'I-Am A(Good)ColumnName';
      const columnNameCleaner = new BasicColumnNameCleaner();

      const cleanName = columnNameCleaner.cleanColumnName(columnName);

      assert.strictEqual(cleanName, 'I_Am_A_Good_ColumnName');
    });
    it('will remove unwanted characters ', () => {
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
  });
});

import 'mocha';
import {assert} from 'chai';
import {BasicColumnNameProcessor} from '../../fileProcessing/basicColumnNameProcesser';

describe('#fileProcessing/basicColumnNameProcesser', () => {
  context('cleanColumnName', () => {
    it('should pass though a name with no special characters', () => {
      let columnName = 'test';
      const processor = new BasicColumnNameProcessor();
      processor.AddColumn(columnName);
      let result = processor.getColumn(0).finalName;
      assert.equal(result, columnName);
    });

    it('should trim and lcase the name', () => {
      let columnName = ' Test ';
      const processor = new BasicColumnNameProcessor();
      processor.AddColumn(columnName);
      let result = processor.getColumn(0).finalName;
      assert.equal(result, columnName.trim().toLowerCase());
    });

    it('should convert names which begin with a number to the name of the number', () => {
      const columnName = '1Test2 ';
      const expectedOutput = 'one_test2';

      const processor = new BasicColumnNameProcessor();
      processor.AddColumn(columnName);
      let result = processor.getColumn(0).finalName;
      assert.equal(result, expectedOutput);
    });

    it('should convert special characters like @ and #', () => {
      const columnName = '@Test# ';
      const expectedOutput = 'at_test_number_';

      const processor = new BasicColumnNameProcessor();
      processor.AddColumn(columnName);
      let result = processor.getColumn(0).finalName;
      assert.equal(result, expectedOutput);
    });

    it('should remove leading underscores', () => {
      const columnName = '__Test ';
      const expectedOutput = 'test';

      const processor = new BasicColumnNameProcessor();
      processor.AddColumn(columnName);
      let result = processor.getColumn(0).finalName;
      assert.equal(result, expectedOutput);
    });

    it('should remove leading underscores even if they were created by cleaning special characters', () => {
      const columnName = '///Test ';
      const expectedOutput = 'test';

      const processor = new BasicColumnNameProcessor();
      processor.AddColumn(columnName);
      let result = processor.getColumn(0).finalName;
      assert.equal(result, expectedOutput);
    });

    it('should add a _number to duplicate names to make them unique', () => {
      const columnName = 'Test ';
      const expectedOutput = 'test';

      const processor = new BasicColumnNameProcessor();
      processor.AddColumn(columnName);
      let result = processor.getColumn(0).finalName;
      assert.equal(result, expectedOutput);
      processor.AddColumn(columnName);
      result = processor.getColumn(1).finalName;
      assert.equal(result, `${expectedOutput}_1`);
      processor.AddColumn(columnName);
      result = processor.getColumn(2).finalName;
      assert.equal(result, `${expectedOutput}_2`);
    });
  });
});

import {assert} from 'chai';
import {ResultsetConverter} from '../../../aws/util';
import ResultSetMock from './resultSetMocks.json';

describe('#aws/util/ResultsetConverter', () => {
  context('fromResultSet', () => {
    it('Should convert the resultSet to a POJSO', () => {
      const convertedData = ResultsetConverter.fromResultset(
        ResultSetMock.ResultSet
      );
      assert.strictEqual(
        convertedData.length,
        ResultSetMock.ResultSet.Rows.length - 1
      );

      const randomIdx =
        Math.floor(Math.random() * (ResultSetMock.ResultSet.Rows.length - 1)) +
        1;

      const inputRow = ResultSetMock.ResultSet.Rows[randomIdx];
      const convertedRow = convertedData[randomIdx - 1];

      assert.isOk(inputRow);
      assert.isOk(convertedRow);

      assert.isNumber(convertedRow.col1);
      assert.strictEqual(
        convertedRow.col1,
        Number(inputRow.Data[0].VarCharValue)
      );

      assert.isString(convertedRow.col2);
      assert.strictEqual(convertedRow.col2, inputRow.Data[1].VarCharValue);

      assert.isString(convertedRow.col3);
      assert.strictEqual(convertedRow.col3, inputRow.Data[2].VarCharValue);

      assert.isNumber(convertedRow.col4);
      assert.strictEqual(
        convertedRow.col4,
        Number(inputRow.Data[3].VarCharValue)
      );
    });
    it('Should convert the resultSet with undefined numbers to a POJSO', () => {
      const mockDataCopy = JSON.parse(JSON.stringify(ResultSetMock));
      mockDataCopy.ResultSet.Rows.forEach((r: any, index: number) => {
        if (index % 2) r.Data[3].VarCharValue = undefined;
      });

      const convertedData = ResultsetConverter.fromResultset(
        mockDataCopy.ResultSet
      );
      assert.strictEqual(
        convertedData.length,
        ResultSetMock.ResultSet.Rows.length - 1
      );

      convertedData.forEach((d, index) => {
        if (!(index % 2)) assert.isUndefined(d.col4);
        else assert.isNumber(d.col4);
      });
      assert.isUndefined(convertedData[0].col4);
    });
  });
});

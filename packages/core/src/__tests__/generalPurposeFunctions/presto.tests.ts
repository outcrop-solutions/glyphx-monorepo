import 'mocha';
import {assert} from 'chai';
import {glyphEngineTypes} from 'types';
import {generatePrestoDateConversionStatement} from '../../generalPurposeFunctions/presto';

describe.only('#generalPurposeFunctions/presto', () => {
  context('generatePrestoDateConversionStatement', () => {
    it('will convert QUALIFIED_DAY_OF_YEAR', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR;
      const expectedResult = `(year(from_unixtime("foo"/1000)) * 1000) + day_of_year(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    it('will convert DAY_OF_YEAR', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      const expectedResult = `day_of_year(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    it('will convert QUALIFIED_MONTH', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_MONTH;
      const expectedResult = `(year(from_unixtime("foo"/1000)) * 100) + month(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    it('will convert MONTH', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.MONTH;
      const expectedResult = `month(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    // QUALIFIED_DAY_OF_MONTH, YEAR_DAY_OF_MONTH, etc.
    it('will convert QUALIFIED_DAY_OF_MONTH', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_MONTH;
      const expectedResult = `(year(from_unixtime("foo"/1000)) * 10000) + (month(from_unixtime("foo"/1000)) * 100) + day_of_month(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    it('will convert YEAR_DAY_OF_MONTH', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.YEAR_DAY_OF_MONTH;
      const expectedResult = `(year(from_unixtime("foo"/1000)) * 100) + day_of_month(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    it('will convert MONTH_DAY_OF_MONTH', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.MONTH_DAY_OF_MONTH;
      const expectedResult = `(month(from_unixtime("foo"/1000)) * 100) + day_of_month(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    it('will convert DAY_OF_MONTH', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_MONTH;
      const expectedResult = `day(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    // QUALIFIED_DAY_OF_WEEK, YEAR_DAY_OF_WEEK, etc.
    it('will convert QUALIFIED_DAY_OF_WEEK', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_WEEK;
      const expectedResult = `(year_of_week(from_unixtime("foo"/1000)) * 1000) + (week_of_year(from_unixtime("foo"/1000)) * 10) + day_of_week(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    it('will convert YEAR_DAY_OF_WEEK', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.YEAR_DAY_OF_WEEK;
      const expectedResult = `(year_of_week(from_unixtime("foo"/1000)) * 100) + day_of_week(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    it('will convert WEEK_DAY_OF_WEEK', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.WEEK_DAY_OF_WEEK;
      const expectedResult = `(week_of_year(from_unixtime("foo"/1000)) * 10) + day_of_week(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    it('will convert DAY_OF_WEEK', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_WEEK;
      const expectedResult = `day_of_week(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    // QUALIFIED_WEEK_OF_YEAR & WEEK_OF_YEAR
    it('will convert QUALIFIED_WEEK_OF_YEAR', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_WEEK_OF_YEAR;
      const expectedResult = `(year_of_week(from_unixtime("foo"/1000)) * 100) + (week_of_year(from_unixtime("foo"/1000)))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    it('will convert WEEK_OF_YEAR', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.WEEK_OF_YEAR;
      const expectedResult = `week_of_year(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    // YEAR_OF_WEEK & YEAR
    it('will convert YEAR_OF_WEEK', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.YEAR_OF_WEEK;
      const expectedResult = `year_of_week(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    it('will convert YEAR', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.YEAR;
      const expectedResult = `year(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    // QUALIFIED_QUARTER & QUARTER
    it('will convert QUALIFIED_QUARTER', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_QUARTER;
      const expectedResult = `(year(from_unixtime("foo"/1000)) * 10) + quarter(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    it('will convert QUARTER', () => {
      const conversion = glyphEngineTypes.constants.DATE_GROUPING.QUARTER;
      const expectedResult = `quarter(from_unixtime("foo"/1000))`;
      assert.equal(generatePrestoDateConversionStatement('foo', conversion), expectedResult);
    });

    // Default (No Conversion)
    it('will return the column name for unknown date types', () => {
      const columnName = 'foo';
      assert.equal(generatePrestoDateConversionStatement(columnName, 'unknown'), `"${columnName}"`);
    });
  });
});

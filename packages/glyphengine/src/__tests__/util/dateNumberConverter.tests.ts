import 'mocha';
import {assert} from 'chai';
import dateNumberConverter from '../../util/dateNumberConverter';
import {glyphEngineTypes} from 'types';

describe('dateNumberConverter', () => {
  it('will convert a qualified_day', () => {
    let value = 2024001;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR;
    let expected = '2024-001';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a day_of_year', () => {
    let value = 364;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
    let expected = '364';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a qualified_month', () => {
    let value = 202411;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_MONTH;
    let expected = '2024-11';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a month', () => {
    let value = 11;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.MONTH;
    let expected = '11';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a month single digit', () => {
    let value = 9;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.MONTH;
    let expected = '9';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a qualified_day_of_month', () => {
    let value = 20241123;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_MONTH;
    let expected = '2024-11-23';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a year_day_of_month', () => {
    let value = 202423;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.YEAR_DAY_OF_MONTH;
    let expected = '2024-23';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a month_day_of_month', () => {
    let value = 1223;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.MONTH_DAY_OF_MONTH;
    let expected = '12-23';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a month_day_of_month single digit month', () => {
    let value = 223;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.MONTH_DAY_OF_MONTH;
    let expected = '2-23';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a day_of_month', () => {
    let value = 11;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_MONTH;
    let expected = '11';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a qualified_day_of_week', () => {
    let value = 2024113;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_WEEK;
    let expected = '2024-11-3';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a day_of_week', () => {
    let value = 1;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_WEEK;
    let expected = '1';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a year_of_week', () => {
    let value = 2024;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.WEEK_OF_YEAR;
    let expected = '2024';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a year', () => {
    let value = 2024;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.YEAR;
    let expected = '2024';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a qualified_quarter', () => {
    let value = 20241;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_QUARTER;
    let expected = '2024-1';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });

  it('will convert a quarter', () => {
    let value = 2;
    let dateType = glyphEngineTypes.constants.DATE_GROUPING.QUARTER;
    let expected = '2';
    let actual = dateNumberConverter(value, dateType);
    assert.equal(actual, expected);
  });
});

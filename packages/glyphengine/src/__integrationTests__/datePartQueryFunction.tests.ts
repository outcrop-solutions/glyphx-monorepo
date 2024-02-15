import * as core from 'core';
import {GlyphEngine} from '../glyphEngine';
import {glyphEngineTypes} from 'types';
import {assert} from 'chai';
import 'mocha';

describe('getDateGroupingFunction', () => {
  let athenaManager: core.aws.AthenaManager;

  before(async () => {
    athenaManager = new core.aws.AthenaManager('glyphxdev');
    await athenaManager.init();
  });
  context('getDateGroupingFunction', () => {
    it('QUALIFIED_DAY_OF_YEAR', async () => {
      let date = new Date();
      let year = date.getFullYear();
      let day = Math.floor(((date as any) - (new Date(year, 0, 0) as any)) / 1000 / 60 / 60 / 24);
      let expected_result = year * 1000 + day;
      let query = GlyphEngine.getDateGroupingFunction(
        'foo',
        glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR
      );
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, expected_result);
    });

    it('DAY_OF_YEAR', async () => {
      let date = new Date();
      let year = date.getFullYear();
      let day = Math.floor(((date as any) - (new Date(year, 0, 0) as any)) / 1000 / 60 / 60 / 24);
      let expected_result = day;
      let query = GlyphEngine.getDateGroupingFunction('foo', glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR);
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, expected_result);
    });

    it('QUALIFIED_MONTH', async () => {
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let expected_result = year * 100 + month;
      let query = GlyphEngine.getDateGroupingFunction('foo', glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_MONTH);
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, expected_result);
    });

    it('MONTH', async () => {
      let date = new Date();
      let month = date.getMonth() + 1;
      let query = GlyphEngine.getDateGroupingFunction('foo', glyphEngineTypes.constants.DATE_GROUPING.MONTH);
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, month);
    });

    it('QUALIFIED_DAY_OF_MONTH', async () => {
      let date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let expected_result = year * 10000 + month * 100 + day;
      let query = GlyphEngine.getDateGroupingFunction(
        'foo',
        glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_MONTH
      );
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, expected_result);
    });

    it('YEAR_DAY_OF_MONTH', async () => {
      let date = new Date();
      let year = date.getFullYear();
      let day = date.getDate();
      let expected_result = year * 100 + day;
      let query = GlyphEngine.getDateGroupingFunction(
        'foo',
        glyphEngineTypes.constants.DATE_GROUPING.YEAR_DAY_OF_MONTH
      );
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, expected_result);
    });

    it('MONTH_DAY_OF_MONTH', async () => {
      let date = new Date();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let expected_result = month * 100 + day;
      let query = GlyphEngine.getDateGroupingFunction(
        'foo',
        glyphEngineTypes.constants.DATE_GROUPING.MONTH_DAY_OF_MONTH
      );
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, expected_result);
    });

    it('DAY_OF_MONTH', async () => {
      let date = new Date();
      let day = date.getDate();
      let query = GlyphEngine.getDateGroupingFunction('foo', glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_MONTH);
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, day);
    });

    it('QUALIFIED_DAY_OF_WEEK', async () => {
      const date = new Date();
      const year = date.getFullYear();
      const startDate = new Date(year, 0, 1);
      const days = Math.floor(((date as any) - (startDate as any)) / (24 * 60 * 60 * 1000));
      const weekOfYear = Math.ceil(days / 7);
      const dayOfWeek = date.getDay();
      let expected_result = year * 1000 + weekOfYear * 10 + dayOfWeek;
      let query = GlyphEngine.getDateGroupingFunction(
        'foo',
        glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_WEEK
      );
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, expected_result);
    });

    it('DAY_OF_WEEK', async () => {
      const date = new Date();
      const dayOfWeek = date.getDay();
      let query = GlyphEngine.getDateGroupingFunction('foo', glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_WEEK);
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, dayOfWeek);
    });

    it('QUALIFIED_WEEK_OF_YEAR', async () => {
      const date = new Date();
      const year = date.getFullYear();
      const startDate = new Date(year, 0, 1);
      const days = Math.floor(((date as any) - (startDate as any)) / (24 * 60 * 60 * 1000));
      const weekOfYear = Math.ceil(days / 7);
      let expected_result = year * 100 + weekOfYear;
      let query = GlyphEngine.getDateGroupingFunction(
        'foo',
        glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_WEEK_OF_YEAR
      );
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, expected_result);
    });

    it('WEEK_OF_YEAR', async () => {
      const date = new Date();
      const year = date.getFullYear();
      const startDate = new Date(year, 0, 1);
      const days = Math.floor(((date as any) - (startDate as any)) / (24 * 60 * 60 * 1000));
      const weekOfYear = Math.ceil(days / 7);
      let query = GlyphEngine.getDateGroupingFunction('foo', glyphEngineTypes.constants.DATE_GROUPING.WEEK_OF_YEAR);
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, weekOfYear);
    });

    it('YEAR_OF_WEEK', async () => {
      const date = new Date();
      const year = date.getFullYear();
      let query = GlyphEngine.getDateGroupingFunction('foo', glyphEngineTypes.constants.DATE_GROUPING.YEAR_OF_WEEK);
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, year);
    });

    it('YEAR', async () => {
      const date = new Date();
      const year = date.getFullYear();
      let query = GlyphEngine.getDateGroupingFunction('foo', glyphEngineTypes.constants.DATE_GROUPING.YEAR);
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, year);
    });

    it('QUALIFIED_QUARTER', async () => {
      let date = new Date();
      let year = date.getFullYear();
      let quarter = Math.ceil(date.getMonth() / 4) + 1;
      let expected_result = year * 10 + quarter;
      let query = GlyphEngine.getDateGroupingFunction(
        'foo',
        glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_QUARTER
      );
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, expected_result);
    });

    it('QUARTER', async () => {
      let date = new Date();
      let quarter = Math.ceil(date.getMonth() / 4) + 1;
      let query = GlyphEngine.getDateGroupingFunction(
        'foo',
        glyphEngineTypes.constants.DATE_GROUPING.QUARTER
      );
      query = 'SELECT ' + query.replaceAll('"foo"', date.getTime().toString());
      let result = await athenaManager.runQuery(query);
      let calculatedDate = result[0]._col0;
      assert.equal(calculatedDate, quarter);
    });
  });
});

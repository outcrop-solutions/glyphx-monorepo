import 'mocha';
import {assert} from 'chai';
import {DateFieldChecker} from '../../fieldProcessing/dateFieldChecker';
import {error} from 'core';

describe('#fieldProcessing/DateFieldChecker', () => {
  context('checkField', () => {
    it('05/15/1972 is a not a date within the accepted range', () => {
      const dateChecker = new DateFieldChecker();
      assert.isFalse(dateChecker.checkField('05/15/1972'));
    });
    it('05/15/1982 is a date within the accepted range', () => {
      const dateChecker = new DateFieldChecker();
      assert.isTrue(dateChecker.checkField('05/15/1982'));
    });
    it('5/15/1982 is a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.isTrue(dateChecker.checkField('5/15/1982'));
    });
    it('5/5/82 is a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.isTrue(dateChecker.checkField('5/5/82'));
    });
    it('5/5/82 12:15 AM is a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.isTrue(dateChecker.checkField('5/5/82 12:15 AM'));
    });
    it('15/05/1982 is not a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.isFalse(dateChecker.checkField('15/05/1982'));
    });
    it('15/05/1982 12:15:AM is  not a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.isFalse(dateChecker.checkField('15/05/1982 12:15 AM'));
    });
    it('15/05/82 is not a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.isFalse(dateChecker.checkField('15/05/82'));
    });
    it('1982-05-15 is a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.isTrue(dateChecker.checkField('1982-05-15'));
    });
    it('1982-05-15T12:13:12.000 is a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.isTrue(dateChecker.checkField('1982-05-15T12:13:12.000'));
    });
    it('1982-06-15T17:34:54.000Z is a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.isTrue(dateChecker.checkField('1982-06-15T17:34:54.000Z'));
    });
    it('7473600000 is not a date within the accepted range', () => {
      const dateChecker = new DateFieldChecker();
      assert.isFalse(dateChecker.checkField('7473600000'));
    });
    it('1274736000000 is a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.isTrue(dateChecker.checkField('1274736000000'));
    });
    it('1982-05-15 with spaces is a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.isTrue(dateChecker.checkField('  1982-05-15   '));
    });
    it('I am not a date is not a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.isFalse(dateChecker.checkField('I am not a date'));
    });
  });

  context('convertField', () => {
    it('05/15/1982 can be converted', () => {
      const localDate = new Date('05/15/1982').getTime();
      const dateChecker = new DateFieldChecker();
      let result = new Date();
      assert.doesNotThrow(() => {
        result = dateChecker.convertField('05/15/1982');
      });
      assert.equal(result.getTime(), localDate);
    });
    it('99/99/9999 connot be converted to a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.throws(() => {
        dateChecker.convertField('99/99/9999');
      }, error.InvalidArgumentError);
    });
    it('I am not a date cannot be converted to a date', () => {
      const dateChecker = new DateFieldChecker();
      assert.throws(() => {
        dateChecker.convertField('I am not a date');
      }, error.InvalidArgumentError);
    });
  });
});

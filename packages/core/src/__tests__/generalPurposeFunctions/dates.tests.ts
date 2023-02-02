import {assert} from 'chai';
import {date} from '../../generalPurposeFunctions';

describe('#generalPurposeFunctions/date', () => {
  context('getTimeStamp', () => {
    it('create a timestamp without a parameter', () => {
      const timeStamp = date.getTimeStamp();
      assert.strictEqual(timeStamp.length, 14);
    });
    it('create a timestamp with a parameter', () => {
      const year = 2022;
      const month = 1;
      const day = 1;
      const hour = 1;
      const minute = 1;
      const second = 1;

      const dateParam = new Date(year, month, day, hour, minute, second);
      const timeStamp = date.getTimeStamp(dateParam);
      assert.strictEqual(timeStamp.length, 14);
      const yearStr = timeStamp.substring(0, 4);
      assert.strictEqual(yearStr, year.toString());
      assert.strictEqual(Number(yearStr), year);
      const monthStr = timeStamp.substring(4, 6);
      assert.strictEqual(monthStr, month.toString().padStart(2, '0'));
      assert.strictEqual(Number(monthStr), month);
      const dayStr = timeStamp.substring(6, 8);
      assert.strictEqual(dayStr, day.toString().padStart(2, '0'));
      assert.strictEqual(Number(dayStr), day);
      const hourStr = timeStamp.substring(8, 10);
      assert.strictEqual(hourStr, hour.toString().padStart(2, '0'));
      assert.strictEqual(Number(hourStr), day);
      const minStr = timeStamp.substring(10, 12);
      assert.strictEqual(minStr, minute.toString().padStart(2, '0'));
      assert.strictEqual(Number(minStr), minute);
      const secondStr = timeStamp.substring(12);
      assert.strictEqual(secondStr, second.toString().padStart(2, '0'));
      assert.strictEqual(Number(secondStr), second);
    });
  });
});

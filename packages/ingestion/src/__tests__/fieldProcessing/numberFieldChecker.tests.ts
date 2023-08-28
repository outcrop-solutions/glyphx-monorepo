import 'mocha';
import {assert} from 'chai';
import {NumberFieldChecker} from 'fieldProcessing';
import {error} from '@glyphx/core';

describe('#fieldProcessing/NumberFieldChecker', () => {
  context('isCurrencySymbol', () => {
    it('$ should be a currency symbol', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isTrue(numberChecker['isCurrencySymbol']('$'));
    });
    it('9 should not  be a currency symbol', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isFalse(numberChecker['isCurrencySymbol']('9'));
    });
  });

  context('checkField', () => {
    it('9999.00 is a number', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isTrue(numberChecker.checkField('9999.00'));
    });
    it('9,999.00 is a number', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isTrue(numberChecker.checkField('9,999.00'));
    });
    it('+9,999.00 is a number', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isTrue(numberChecker.checkField('+9,999.00'));
    });
    it('-9,999.00 is a number', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isTrue(numberChecker.checkField('-9,999.00'));
    });
    it('$9,999.00 is a number', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isTrue(numberChecker.checkField('$9,999.00'));
    });
    it('$-9,999.00 is a number', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isTrue(numberChecker.checkField('$-9,999.00'));
    });
    it('$+9,999.00 is a number', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isTrue(numberChecker.checkField('$+9,999.00'));
    });
    it('$9999 is a number', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isTrue(numberChecker.checkField('$9999'));
    });
    it('$ 99 99 is not a number', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isFalse(numberChecker.checkField('$ 99 99'));
    });
    it('$ 99B99 is not a number', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isFalse(numberChecker.checkField('$ 99B99'));
    });
    it('99B99 is not a number', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isFalse(numberChecker.checkField('99B99'));
    });
    it('IAmNotANumber is not a number', () => {
      const numberChecker = new NumberFieldChecker();
      assert.isFalse(numberChecker.checkField('IAmNotANumber'));
    });
  });

  context('convertField', () => {
    it('will convert 9999 to a number', () => {
      const numberChecker = new NumberFieldChecker();

      let convertedNumber = 0;
      assert.doesNotThrow(() => {
        convertedNumber = numberChecker.convertField('9999');
      }, error.InvalidArgumentError);

      assert.strictEqual(convertedNumber, 9999);
    });
    it('will convert 9,999.99 to a number', () => {
      const numberChecker = new NumberFieldChecker();

      let convertedNumber = 0;
      assert.doesNotThrow(() => {
        convertedNumber = numberChecker.convertField('9,999.99');
      }, error.InvalidArgumentError);

      assert.strictEqual(convertedNumber, 9999.99);
    });
    it('will convert -9,999.99 to a number', () => {
      const numberChecker = new NumberFieldChecker();

      let convertedNumber = 0;
      assert.doesNotThrow(() => {
        convertedNumber = numberChecker.convertField('-9,999.99');
      }, error.InvalidArgumentError);

      assert.strictEqual(convertedNumber, -9999.99);
    });
    it('will convert $-9,999.99 to a number', () => {
      const numberChecker = new NumberFieldChecker();

      let convertedNumber = 0;
      assert.doesNotThrow(() => {
        convertedNumber = numberChecker.convertField('$-9,999.99');
      }, error.InvalidArgumentError);

      assert.strictEqual(convertedNumber, -9999.99);
    });
    it('will not convert $-9,999.99B to a number', () => {
      const numberChecker = new NumberFieldChecker();

      assert.throws(() => {
        numberChecker.convertField('$-9,999.99B');
      }, error.InvalidArgumentError);
    });
    it('will not convert IAmANumber to a number', () => {
      const numberChecker = new NumberFieldChecker();

      assert.throws(() => {
        numberChecker.convertField('IAmANumber');
      }, error.InvalidArgumentError);
    });
  });
});

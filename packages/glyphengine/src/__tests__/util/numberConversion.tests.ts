import 'mocha';
import {assert} from 'chai';
import {convertNumberTo32bIeee754Float} from '../../util/numberConversion';

describe('#util/NumberConversion', () => {
  context('convertNumberTo32bIEEE754Float', () => {
    it('will convert our number', () => {
      const num = -159.44446;
      const result = convertNumberTo32bIeee754Float(num);
      const expected = [0xc3, 0x1f, 0x71, 0xc8];
      result.forEach((byte, index) => {
        assert.strictEqual(byte, expected[index]);
      });
    });
  });
});

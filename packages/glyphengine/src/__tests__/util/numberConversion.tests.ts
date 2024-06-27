import 'mocha';
import {assert} from 'chai';
import {
  convertNumberTo32bIeee754Float,
  manualConvertNumberTo32bIEEE754Float,
  manualConvertNumberTo32bIeee754Float,
} from '../../util/numberConversion';

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
  context('manualConvertNumberTo32bIEEE754Float', () => {
    it.only('will convert our number manually', () => {
      // Function to compare two Uint8Array byte-by-byte
      function compareUint8Arrays(arr1, arr2) {
        if (arr1.length !== arr2.length) {
          return false;
        }
        for (let i = 0; i < arr1.length; i++) {
          if (arr1[i] !== arr2[i]) {
            return false;
          }
        }
        return true;
      }

      let value = 3.14;
      // slight variations in implementation or rounding can result in the last byte being different!
      let manualBytes = convertNumberTo32bIeee754Float(value); // Uint8Array(4)[(64, 72, 245, 195)];
      // THIS FAILS!
      // let originalBytes = manualConvertNumberTo32bIeee754Float(value); // Uint8Array(4)[(64, 72, 245, 194)];

      // THIS PASSES
      let originalBytes = manualConvertNumberTo32bIEEE754Float(value); // Uint8Array(4)[(64, 72, 245, 194)];
      console.log(manualBytes);
      console.log(originalBytes);

      // this passes even though it is off by one byte because of precision difference
      console.assert(manualBytes.join() === originalBytes.join(), 'Verification failed!');
      // this fails when compared byte-by-byte
      assert.isTrue(compareUint8Arrays(manualBytes, originalBytes));
    });
  });
});

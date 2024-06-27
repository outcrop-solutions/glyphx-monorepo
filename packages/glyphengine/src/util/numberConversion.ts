export function convertNumberTo32bIeee754Float(value: number): Uint8Array {
  // Create a new DataView object with a 4-byte buffer
  const buffer = new ArrayBuffer(4);
  const dataView = new DataView(buffer);

  // Convert the number to binary using DataView
  dataView.setFloat32(0, value); // set the number at byte offset 0

  // Get the binary representation as an array of bytes
  const bytes = new Uint8Array(buffer);
  return bytes;
}

export function manualConvertNumberTo32bIeee754Float(value) {
  if (value === 0) {
    return new Uint8Array([0, 0, 0, 0]);
  }

  /* IEEE 754 Structure:
   * Sign Bit (1 bit): Indicates whether the number is positive or negative.
   * Exponent (8 bits for float): Encodes the range of the number.
   * Mantissa/Fraction (23 bits for float): Encodes the precision bits of the number.
   */
  let sign = value < 0 ? 1 : 0;
  if (sign === 1) {
    value = -value;
  }

  let exponent = Math.floor(Math.log2(value));
  let mantissa = value / Math.pow(2, exponent) - 1;
  exponent += 127;

  // slight variations in implementation or rounding can result in the last byte being different
  mantissa *= Math.pow(2, 23);
  mantissa = Math.floor(mantissa);

  let byte1 = (sign << 7) | (exponent >> 1);
  let byte2 = ((exponent & 1) << 7) | (mantissa >> 16);
  let byte3 = (mantissa >> 8) & 0xff;
  let byte4 = mantissa & 0xff;

  return new Uint8Array([byte1, byte2, byte3, byte4]);
}

export function manualConvertNumberTo32bIEEE754Float(value) {
  if (value === 0) {
    return new Uint8Array([0, 0, 0, 0]);
  }

  let sign = value < 0 ? 1 : 0;
  if (sign === 1) {
    value = -value;
  }

  let exponent = Math.floor(Math.log2(value));
  let mantissa = value / Math.pow(2, exponent) - 1;
  exponent += 127; // Adding bias for single-precision float

  mantissa *= Math.pow(2, 23);
  mantissa = Math.round(mantissa); // Correct precision by rounding

  let byte1 = (sign << 7) | (exponent >> 1);
  let byte2 = ((exponent & 1) << 7) | ((mantissa >> 16) & 0x7f);
  let byte3 = (mantissa >> 8) & 0xff;
  let byte4 = mantissa & 0xff;

  return new Uint8Array([byte1, byte2, byte3, byte4]);
}

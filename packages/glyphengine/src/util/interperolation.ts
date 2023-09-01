import {error} from 'core';
/**
 * a linear interpolation function to map the data value to the range of values supported by the glyph.  i,e, glyhps on access z are interpolated in a range of 1 to 71.
 * @param dataValue the value that we are interpolating
 * @param minDataValue the minimum value of the complete set of data that dataValue represents.
 * @param maxDataValue the maximum value of the complete set of data that dataValue represents.
 * @param minGlyphValue the minimum value of the range of values that the glyph supports.
 * @param maxGlyphValue the maximum value of the range of values that the glyph supports.
 * @returns the interpolated value
 * @throws InvalidArgumentError if dataValue is outside the range of minDataValue and maxDataValue
 */
export function linearInterpolation(
  dataValue: number,
  minDataValue: number,
  maxDataValue: number,
  minGlyphValue: number,
  maxGlyphValue: number
) {
  if (dataValue < minDataValue || dataValue > maxDataValue) {
    throw new error.InvalidArgumentError(
      `The value of dataValue: ${dataValue} is outside the range of minDataValue: ${minDataValue} and maxDataValue: ${maxDataValue}`,
      ['dataValue', 'minDataValue', 'maxDataValue'],
      [dataValue, minDataValue, maxDataValue]
    );
  }
  if (minDataValue === maxDataValue) {
    return maxGlyphValue;
  }

  return (
    minGlyphValue +
    ((maxGlyphValue - minGlyphValue) * (dataValue - minDataValue)) /
      (maxDataValue - minDataValue)
  );
}

export function logaritmicInterpolation(
  dataValue: number,
  minDataValue: number,
  maxDataValue: number,
  minGlyphValue: number,
  maxGlyphValue: number
) {
  if (dataValue < minDataValue || dataValue > maxDataValue) {
    throw new error.InvalidArgumentError(
      `The value of dataValue: ${dataValue} is outside the range of minDataValue: ${minDataValue} and maxDataValue: ${maxDataValue}`,
      ['dataValue', 'minDataValue', 'maxDataValue'],
      [dataValue, minDataValue, maxDataValue]
    );
  }
  if (minDataValue === maxDataValue) {
    return maxGlyphValue;
  }

  return (
    (Math.log10(dataValue - minDataValue + 1) *
      (maxGlyphValue - minGlyphValue)) /
      Math.log10(maxDataValue - minDataValue + 1) +
    minGlyphValue
  );
}

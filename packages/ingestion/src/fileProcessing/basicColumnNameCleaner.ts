import * as fileProcessingInterfaces from '@interfaces/fileProcessing';
/**
 * Implements {@link interfaces/fileProcessing/iColumnNameCleaner!IColumnNameCleaner} to provide basic column name cleaning.
 */
export class BasicColumnNameCleaner
  implements fileProcessingInterfaces.IColumnNameCleaner
{
  invalidCols = 0;
  /**
   * a list of codes that will be replaced with an _ (underscore)
   *
   */
  private readonly REPLACEABLE_CHARS = [
    32, //space
    40, //(
    41, //)
    45, //-
    // 65-90, //A-Z
    // 97-122, //a-z
  ];
  /**
   * See the IcolumnNameInterface for additional information --
   * {@link interfaces/fileProcessing/iColumnNameCleaner!IColumnNameCleaner.cleanColumnName}
   */
  cleanColumnName(value: string): string {
    const outArray: string[] = [];
    const tempValue = value.toLowerCase();
    for (let i = 0; i < tempValue.length; i++) {
      const charValue = tempValue.charCodeAt(i);
      if (
        i === 0 &&
        !(
          (charValue >= 65 && charValue <= 90) ||
          (charValue >= 97 && charValue <= 122)
        )
      ) {
        outArray.push('_');
      } else if (i !== 0 && this.REPLACEABLE_CHARS.find(c => c === charValue)) {
        outArray.push('_');
      } else if (
        charValue === 95 || //_
        (charValue >= 48 && charValue <= 57) || //0-9
        (charValue >= 97 && charValue <= 122) //a-z
      ) {
        outArray.push(String.fromCharCode(charValue));
      }
    }

    const ret = outArray.join('');

    let result = ret.split('').reduce((acc, curr) => {
      if (acc === '' && curr === '_') {
        return acc;
      }
      return acc + curr;
    }, '');

    if (result === '') {
      result = `invalid_${this.invalidCols}`;
      this.invalidCols++;
      // throw new error.InvalidArgumentError(
      //   `The column name ${value} is not valid.  Its clean name is an empty string`,
      //   'value',
      //   value
      // );
    }
    return result;
  }
}

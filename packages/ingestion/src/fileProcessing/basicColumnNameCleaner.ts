import * as fileProcessingInterfaces from '@interfaces/fileProcessing';
/**
 * Implements {@link interfaces/fileProcessing/iColumnNameCleaner!IColumnNameCleaner} to provide basic column name cleaning.
 */
export class BasicColumnNameCleaner
  implements fileProcessingInterfaces.IColumnNameCleaner
{
  /**
   * a list of codes that will be replaced with an _ (underscore)
   *
   */
  private readonly REPLACEABLE_CHARS = [
    32, //space
    40, //(
    41, //)
    45, //-
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
      if (this.REPLACEABLE_CHARS.find(c => c === charValue)) {
        outArray.push('_');
      }
      if (
        charValue === 95 || //_
        (charValue >= 48 && charValue <= 57) || //0-9
        (charValue >= 97 && charValue <= 122) //a-z
      ) {
        outArray.push(String.fromCharCode(charValue));
      }
    }

    const ret = outArray.join('');

    return ret;
  }
}

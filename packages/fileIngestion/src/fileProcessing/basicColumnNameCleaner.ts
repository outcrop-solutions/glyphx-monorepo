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
    for (let i = 0; i < value.length; i++) {
      const charValue = value.charCodeAt(i);
      if (this.REPLACEABLE_CHARS.find(c => c === charValue)) {
        outArray.push('_');
      }
      if (
        charValue === 95 || //_
        (charValue >= 48 && charValue <= 57) || //0-9
        (charValue >= 65 && charValue <= 90) || //A-Z
        (charValue >= 97 && charValue <= 122) //a-z
      ) {
        outArray.push(String.fromCharCode(charValue));
      }
    }

    const ret = outArray.join('');

    return ret;
  }
}

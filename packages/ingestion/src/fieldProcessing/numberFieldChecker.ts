import * as fieldProcessingInterfaces from '../interfaces/fieldProcessing';
import {error} from '@glyphx/core';
import currencyToSymbolMap from 'currency-symbol-map/map';

/**
 * This class will take in a string and determine whether or
 * not it is a number. See {@link interfaces/fieldProcessing/iFieldChecker!IFieldChecker}
 * additional details.
 */
export class NumberFieldChecker
  implements fieldProcessingInterfaces.IFieldChecker<number>
{
  /**
   *  Will take an input and compare it to a currency symbol table
   *  {@link https://github.com/bengourley/currency-symbol-map#readme currency-symbol-map }
   *  to determine whether or not the string is a currency symbol
   */
  private isCurrencySymbol(input: string): boolean {
    let retval = false;
    for (const key in currencyToSymbolMap) {
      const sym = currencyToSymbolMap[key];
      if (sym === input) {
        retval = true;
        break;
      }
    }
    return retval;
  }

  //TODO: we probbaly want to convert accounting practice of wrapping a negative value in () and replacing it with a '-' sign.
  /**
   * will prepare our string for comparison by:
   * 1. triming leading and trailing spaces
   * 2. removing leading currency symbols.
   */
  private cleanStringForProcessing(input: string) {
    //make a copy because we may alter the string
    let tempString = input.trim();
    const asciiCode = tempString.charCodeAt(0);

    //do we have a currency symbol that needs to be removed.
    if (
      asciiCode !== 43 && //+
      asciiCode !== 45 && //-
      (asciiCode < 48 || asciiCode > 57) // 0 - 9
    ) {
      if (this.isCurrencySymbol(tempString[0])) {
        tempString = tempString.substring(1);
      }
    }

    return tempString;
  }

  /**
   * See the interface IFieldChecker for more information. {@link interfaces/fieldProcessing/iFieldChecker!IFieldChecker.checkField | IFieldChecker.checkField}
   */
  public checkField(input: string, cleanString = true): boolean {
    const trimmed = cleanString ? this.cleanStringForProcessing(input) : input;
    //eslint-disable-next-line no-useless-escape
    const regex =
      //eslint-disable-next-line no-useless-escape
      /^[\-\+]?([0-9]{1,3},([0-9]{3},)*[0-9]{3}|[0-9]+)(\.([0-9]*))?$/;

    const retval = regex.test(trimmed);
    return retval;
  }
  /**
   * See the interface IFieldChecker for more information. {@link interfaces/fieldProcessing/iFieldChecker!IFieldChecker.convertField | IFieldChecker.convertField}
   */
  public convertField(input: string): number {
    let tempString = this.cleanStringForProcessing(input);
    if (!this.checkField(tempString, false)) {
      throw new error.InvalidArgumentError(
        `The input value of : ${input} is not a number`,
        'input',
        input
      );
    }

    tempString = tempString.replace(/,/g, '');
    const retval = Number(tempString);
    return retval;
  }
}

import * as fieldProcessingInterfaces from '../interfaces/fieldProcessing';
import {error} from 'core';
import {CURRENCY_TO_SYMBOL_MAP} from './numberFieldChecker';
export class DateFieldChecker implements fieldProcessingInterfaces.IFieldChecker<Date> {
  checkField(input: string): boolean {
    const trimmedInput = input.trim();
    // Return false if the input contains a currency symbol or percentage sign
    if (this.containsCurrencySymbol(trimmedInput) || trimmedInput.includes('%')) {
      return false;
    }

    // Try to convert the trimmed input to a number
    const val = Number(trimmedInput);
    if (!isNaN(val)) {
      let strNumbers = val.toString();
      //numbers with decimal points are not dates
      if (strNumbers.includes('.')) {
        return false;
      }
      //Roughly 1980-01-01 -- this will only apply if I am sendingg epoch time (number) as a date.  Strings can happily be converted for dates ealiedr than this.
      if (val < 315532800000) {
        return false;
      }
      return true;
    } else {
      const date = Date.parse(trimmedInput);
      if (isNaN(date)) {
        return false;
      } else {
        return true;
      }
    }
  }

  containsCurrencySymbol(input: string) {
    let retval = false;
    for (const key in CURRENCY_TO_SYMBOL_MAP) {
      const sym = CURRENCY_TO_SYMBOL_MAP[key];
      if (input === sym) {
        retval = true;
        break;
      }
    }
    return retval;
  }

  convertField(input: string): Date {
    const tempString = input.trim();
    if (!this.checkField(tempString)) {
      throw new error.InvalidArgumentError(`The input value of : ${input} is not a Date`, 'input', input);
    }
    const retval = new Date(tempString);
    return retval;
  }
}

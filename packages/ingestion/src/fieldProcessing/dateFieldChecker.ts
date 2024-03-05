import * as fieldProcessingInterfaces from '../interfaces/fieldProcessing';
import {error} from 'core';
import {CURRENCY_TO_SYMBOL_MAP} from './numberFieldChecker';
export class DateFieldChecker implements fieldProcessingInterfaces.IFieldChecker<Date> {
  checkField(input: string): boolean {
    const trimmedInput = input.trim();
    if (isNaN(Number(trimmedInput))) {
      const date = new Date(trimmedInput);
      const year = date.getFullYear();
      return !isNaN(date.getTime()) && year >= 1980 && year <= 2030;
    } else {
      return false;
    }
  }

  containsCurrencySymbol(input: string) {
    let retval = false;
    for (const key in CURRENCY_TO_SYMBOL_MAP) {
      const sym = CURRENCY_TO_SYMBOL_MAP[key];
      if (input.includes(sym)) {
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

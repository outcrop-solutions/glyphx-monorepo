import * as fieldProcessingInterfaces from '../interfaces/fieldProcessing';
import {error} from 'core';
import {CURRENCY_TO_SYMBOL_MAP} from './numberFieldChecker';
export class DateFieldChecker implements fieldProcessingInterfaces.IFieldChecker<Date> {
  checkField(input: string): boolean {
    // const trimmedInput = input.trim();
    // if (trimmedInput.length >= 6 && !this.containsCurrencySymbol(trimmedInput) && !trimmedInput.includes('%')) {
    //   let val = Number(trimmedInput);
    //   let fixed = Number(val.toFixed(7));
    //   if (isNaN(fixed)) {
    //     const time = new Date(trimmedInput).getTime();
    //     return !isNaN(time);
    //   } else {
    //     return trimmedInput.length >= 10 && trimmedInput.length <= 13;
    //   }
    // } else {
    //   return false;
    // }

    const trimmedInput = input.trim();

    // Return false if the input contains a currency symbol or percentage sign
    if (this.containsCurrencySymbol(trimmedInput) || trimmedInput.includes('%')) {
      return false;
    }

    // Try to convert the trimmed input to a number
    const val = Number(trimmedInput);
    let fixed = Number(val.toFixed(7));

    // Check if it's a valid number
    if (!isNaN(fixed)) {
      // It's a valid number, so it's not a date
      return false;
    }

    // If it's not a valid number, attempt to parse it as a date
    const time = new Date(trimmedInput).getTime();
    return !isNaN(time);
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

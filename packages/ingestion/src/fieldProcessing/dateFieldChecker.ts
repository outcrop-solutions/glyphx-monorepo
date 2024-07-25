import * as fieldProcessingInterfaces from '../interfaces/fieldProcessing';
import {error} from 'core';
import {CURRENCY_TO_SYMBOL_MAP} from './numberFieldChecker';
const REGEX_DATE = new RegExp(/(\d{4})(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])/gm);
export class DateFieldChecker implements fieldProcessingInterfaces.IFieldChecker<Date> {
  maxDaysInMonth(year: number, month: number): number {
    // Create a Date object for the first day of the next month
    // Month is 0 indexed
    const nextMonthFirstDay = new Date(year, month, 1);
    // Subtract one day to get the last day of the current month
    const lastDayOfMonth = new Date(nextMonthFirstDay.getTime() - 86400000); // 86400000 milliseconds in a day
    // Return the day of the month (1-31) for the last day
    return lastDayOfMonth.getDate();
  }
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
      REGEX_DATE.lastIndex = 0;
      const match = REGEX_DATE.exec(strNumbers);
      if (match) {
        let year = match[1];
        let month = match[2];
        let day = match[3];
        let maxDays = this.maxDaysInMonth(Number(year), Number(month));
        if (Number(day) > maxDays) {
          return false;
        }
        let date = new Date(`${year}-${month}-${day}`);
        if (isNaN(date.getTime())) {
          return false;
        } else {
          return true;
        }
      }
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
    let retval: Date;
    if (!this.checkField(tempString)) {
      throw new error.InvalidArgumentError(`The input value of : ${input} is not a Date`, 'input', input);
    }
    REGEX_DATE.lastIndex = 0;
    const match = REGEX_DATE.exec(tempString);
    if (match) {
      let year = match[1];
      let month = match[2];
      let day = match[3];
      retval = new Date(`${year}-${month}-${day}`);
    } else {
      retval = new Date(tempString);
    }
    return retval;
  }
}

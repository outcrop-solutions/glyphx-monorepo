import * as fieldProcessingInterfaces from '../interfaces/fieldProcessing';
import {error} from 'core';

export class DateFieldChecker implements fieldProcessingInterfaces.IFieldChecker<Date> {
  checkField(input: string): boolean {
    const trimmedInput = input.trim();
    if (isNaN(Number(trimmedInput))) {
      const date = new Date(trimmedInput);
      const year = date.getFullYear();
      return !isNaN(date.getTime()) && year >= 1980 && year <= 2030;
    } else {
      return trimmedInput.length >= 10 && trimmedInput.length <= 13;
    }
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

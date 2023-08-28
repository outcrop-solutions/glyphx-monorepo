import * as fieldProcessingInterfaces from '../interfaces/fieldProcessing';
import {error} from '@glyphx/core';

export class DateFieldChecker
  implements fieldProcessingInterfaces.IFieldChecker<Date>
{
  checkField(input: string): boolean {
    const trimmedInput = input.trim();
    if (isNaN(Number(trimmedInput))) {
      const time = new Date(trimmedInput).getTime();
      return !isNaN(time);
    } else {
      return trimmedInput.length >= 10 && trimmedInput.length <= 13;
    }
  }

  convertField(input: string): Date {
    const tempString = input.trim();
    if (!this.checkField(tempString)) {
      throw new error.InvalidArgumentError(
        `The input value of : ${input} is not a Date`,
        'input',
        input
      );
    }
    const retval = new Date(tempString);
    return retval;
  }
}

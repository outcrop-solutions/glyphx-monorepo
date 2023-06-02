import * as fieldProcessingInterfaces from '@interfaces/fieldProcessing';
import {error} from '@glyphx/core';

export class DateFieldChecker
  implements fieldProcessingInterfaces.IFieldChecker<Date>
{
  checkField(input: string): boolean {
    const trimmedInput = input.trim();
    const dateRegex =
      /^(?:(?:\d{11}|\d{10})|(?:\d{1,2}\/\d{1,2}\/\d{2}(?:\d{2})?)|(?:\d{1,2}\/\d{1,2}\/\d{4})|(?:\d{4}-\d{2}-\d{2})(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?)$/;
    const retval = dateRegex.test(trimmedInput);
    return retval;
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
    if (isNaN(retval.getTime())) {
      throw new error.InvalidArgumentError(
        `The input value of : ${input} is not a Date`,
        'input',
        input
      );
    }
    return retval;
  }
}

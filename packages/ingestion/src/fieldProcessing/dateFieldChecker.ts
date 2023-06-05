import * as fieldProcessingInterfaces from '@interfaces/fieldProcessing';
import {error} from '@glyphx/core';

const TIME_REGEX = /^\d{10,13}$/g;
const US_DATE_REGEX =
  /^(?:(?:0?[1-9]|1[0-2])\/(?:0?[1-9]|1\d|2[0-9]|3[01])\/(?:\d{2}|\d{4})(?:\s(?:0?\d|1[0-9]|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,4})?)?(?:\s?[AP]M)?)?)$/g;
const EUROPEAN_DATE_REGEX =
  /^(?:(?:0?[1-9]|1\d|2[0-9]|3[01])\/(?:0?[1-9]|1[0-2])\/(?:\d{2}|\d{4})(?:\s(?:0?\d|1[0-9]|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,4})?)?(?:\s?[AP]M)?)?)$/g;
const ISO_DATE_REGEX =
  /^(?:(?:\d{4}|\d{2})-(?:0?[1-9]|1[0-2])-(?:0?[1-9]|[12]\d|3[01])(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):?[0-5]\d)?)?)?$/g;

const EXPRESSIONS = [
  TIME_REGEX,
  US_DATE_REGEX,
  EUROPEAN_DATE_REGEX,
  ISO_DATE_REGEX,
];

export class DateFieldChecker
  implements fieldProcessingInterfaces.IFieldChecker<Date>
{
  checkField(input: string): boolean {
    const trimmedInput = input.trim();
    let retval = false;
    for (let i = 0; i < EXPRESSIONS.length; i++) {
      const exp = EXPRESSIONS[i];
      //We have to reset our last index between regex calls
      exp.lastIndex = -1;
      const res = exp.test(trimmedInput);
      if (res) {
        retval = true;
        break;
      }
    }
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

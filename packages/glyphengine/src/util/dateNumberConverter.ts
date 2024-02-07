import {glyphEngineTypes} from 'types';
export default function dateNumberConvert(input: number, dateType: glyphEngineTypes.constants.DATE_GROUPING): string {
  const stringValue = input.toString();
  let retval = '';
  switch (dateType) {
    case glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR:
      retval = `${stringValue.substring(0, 4)}-${stringValue.substring(4, 7)}`;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR:
      retval = stringValue;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_MONTH:
      retval = `${stringValue.substring(0, 4)}-${stringValue.substring(4, 6)}`;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.MONTH:
      retval = stringValue;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_MONTH:
      retval = `${stringValue.substring(0, 4)}-${stringValue.substring(4, 6)}-${stringValue.substring(6, 8)}`;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.YEAR_DAY_OF_MONTH:
      retval = `${stringValue.substring(0, 4)}-${stringValue.substring(4, 6)}`;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.MONTH_DAY_OF_MONTH:
      if (stringValue.length === 3) {
        retval = `${stringValue.substring(0, 1)}-${stringValue.substring(1, 3)}`;
      } else {
        retval = `${stringValue.substring(0, 2)}-${stringValue.substring(2, 4)}`;
      }
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_MONTH:
      retval = stringValue;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_WEEK:
      retval = `${stringValue.substring(0, 4)}-${stringValue.substring(4, 6)}-${stringValue.substring(6, 7)}`;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.YEAR_DAY_OF_WEEK:
      retval = `${stringValue.substring(0, 4)}-${stringValue.substring(4, 6)}`;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.WEEK_DAY_OF_WEEK:
      retval = `${stringValue.substring(0, 2)}-${stringValue.substring(2, 3)}`;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_WEEK:
      retval = stringValue;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.YEAR_OF_WEEK:
      retval = stringValue;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.YEAR:
      retval = stringValue;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_QUARTER:
      retval = `${stringValue.substring(0, 4)}-${stringValue.substring(4, 5)}`;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_WEEK_OF_YEAR:
      retval = `${stringValue.substring(0, 4)}-${stringValue.substring(4, 6)}`;
      break;
    case glyphEngineTypes.constants.DATE_GROUPING.WEEK_OF_YEAR:
      retval = stringValue;
      break;

    case glyphEngineTypes.constants.DATE_GROUPING.QUARTER:
      retval = stringValue;
      break;

    default:
      retval = stringValue;
      break;
  }
  return retval;
}

import {glyphEngineTypes} from 'types';
export function generatePrestoDateConversionStatement(
  columnName: string,
  dateType: glyphEngineTypes.constants.DATE_GROUPING | string
): string {
  switch (dateType) {
    // DOY variants
    case glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR:
      return `(year(from_unixtime("${columnName}"/1000)) * 1000) + day_of_year(from_unixtime("${columnName}"/1000))`;

    case glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR:
      return `day_of_year(from_unixtime("${columnName}"/1000))`;

    // Month variants
    case glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_MONTH:
      return `(year(from_unixtime("${columnName}"/1000)) * 100) + month(from_unixtime("${columnName}"/1000))`;

    case glyphEngineTypes.constants.DATE_GROUPING.MONTH:
      return `month(from_unixtime("${columnName}"/1000))`;

    // DOM variants
    case glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_MONTH:
      return `(year(from_unixtime("${columnName}"/1000)) * 10000) + (month(from_unixtime("${columnName}"/1000)) * 100) + day_of_month(from_unixtime("${columnName}"/1000))`;

    case glyphEngineTypes.constants.DATE_GROUPING.YEAR_DAY_OF_MONTH:
      return `(year(from_unixtime("${columnName}"/1000)) * 100) + day_of_month(from_unixtime("${columnName}"/1000))`;

    case glyphEngineTypes.constants.DATE_GROUPING.MONTH_DAY_OF_MONTH:
      return `(month(from_unixtime("${columnName}"/1000)) * 100) + day_of_month(from_unixtime("${columnName}"/1000))`;

    case glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_MONTH:
      return `day(from_unixtime("${columnName}"/1000))`;

    // DOW variants
    case glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_WEEK:
      return `(year_of_week(from_unixtime("${columnName}"/1000)) * 1000) + (week_of_year(from_unixtime("${columnName}"/1000)) * 10) + day_of_week(from_unixtime("${columnName}"/1000))`;

    case glyphEngineTypes.constants.DATE_GROUPING.YEAR_DAY_OF_WEEK:
      return `(year_of_week(from_unixtime("${columnName}"/1000)) * 100) + day_of_week(from_unixtime("${columnName}"/1000))`;

    case glyphEngineTypes.constants.DATE_GROUPING.WEEK_DAY_OF_WEEK:
      return `(week_of_year(from_unixtime("${columnName}"/1000)) * 10) + day_of_week(from_unixtime("${columnName}"/1000))`;

    case glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_WEEK:
      return `day_of_week(from_unixtime("${columnName}"/1000))`;

    // WOY variants
    case glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_WEEK_OF_YEAR:
      return `(year_of_week(from_unixtime("${columnName}"/1000)) * 100) + (week_of_year(from_unixtime("${columnName}"/1000)))`;

    case glyphEngineTypes.constants.DATE_GROUPING.WEEK_OF_YEAR:
      return `week_of_year(from_unixtime("${columnName}"/1000))`;
    // non-variants

    case glyphEngineTypes.constants.DATE_GROUPING.YEAR_OF_WEEK:
      return `year_of_week(from_unixtime("${columnName}"/1000))`;

    case glyphEngineTypes.constants.DATE_GROUPING.YEAR:
      return `year(from_unixtime("${columnName}"/1000))`;

    // Quarter variants
    case glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_QUARTER:
      return `(year(from_unixtime("${columnName}"/1000)) * 10) + quarter(from_unixtime("${columnName}"/1000))`;

    case glyphEngineTypes.constants.DATE_GROUPING.QUARTER:
      return `quarter(from_unixtime("${columnName}"/1000))`;

    default:
      return `"${columnName}"`;
  }
}

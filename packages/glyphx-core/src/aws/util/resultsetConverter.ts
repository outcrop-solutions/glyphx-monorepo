import {ResultSet} from '@aws-sdk/client-athena';

type StringConverter<T> = (input: string | undefined) => T;

const PASS_THROUGH: StringConverter<string> = (input: string | undefined) =>
  input as string;
const STRING_TO_NUMBER: StringConverter<number | undefined> = (
  input: string | undefined
) => {
  if (!input) return undefined;
  else return Number(input);
};

interface IColumnDef {
  index: number;
  name: string;
  converter: StringConverter<string | number | undefined>;
}
/**
 * This class will take an AWS Athena ResultSet and convert it into an array of
 * JSON objects.
 */
export class ResultsetConverter {
  /**
   * The main piece of processing.  Will convert a ResultSet
   * to an array of JSON objects.  In Athena, columns can be empty(undefined)(not null)
   * For number types, this function will return undefined if there is not a value for
   * the column in the ResultSet.
   *
   * @param input - the data to transform.
   *
   * @returns The data as an array of JSON objects.
   */
  public static fromResultset(
    input: Required<ResultSet>,
    includeHeaderRow = false
  ): Record<string, string | number | undefined>[] {
    const mappedConverters: IColumnDef[] = [];
    //istanbul ignore next
    input.ResultSetMetadata?.ColumnInfo?.forEach((c, index) => {
      mappedConverters.push({
        index: index,
        name: c.Name as string,
        converter: c.Type === 'double' ? STRING_TO_NUMBER : PASS_THROUGH,
      });
    });

    const results: Record<string, string | number | undefined>[] = [];
    input.Rows.forEach((r, rowIndex) => {
      if (!includeHeaderRow && rowIndex === 0) return; //The first row is the column names.
      const obj: Record<string, string | number | undefined> = {};

      //istanbul ignore next
      r.Data?.forEach((d, colIndex) => {
        obj[mappedConverters[colIndex].name] = mappedConverters[
          colIndex
        ].converter(d.VarCharValue as string);
      });
      results.push(obj);
    });
    return results;
  }
}

import athenaClient from './athenaClient';
import {error} from '@glyphx/core';

export class TextColumnToNumberConverter {
  private readonly tableName: string;
  private readonly columnName: string;
  private readonly convertedFields: Map<string, number>;

  public get size(): number {
    return this.convertedFields.size;
  }

  constructor(tableName: string, columnName: string) {
    this.tableName = tableName;
    this.columnName = columnName;
    this.convertedFields = new Map<string, number>();
  }

  public async load(): Promise<void> {
    const query = `SELECT DISTINCT ${this.columnName} FROM ${this.tableName} ORDER BY ${this.columnName}`;

    const data = await athenaClient.connection.runQuery(query);
    data.forEach((row, index) => {
      this.convertedFields.set(row[this.columnName] as string, index);
    });
  }

  public convert(text: string): number {
    const convertedValue = this.convertedFields.get(text);
    if (convertedValue === undefined) {
      throw new error.DataNotFoundError(
        `Cannot find ${text} in ${this.columnName} for ${this.tableName}`,
        this.columnName,
        text
      );
    }
    return convertedValue;
  }
}

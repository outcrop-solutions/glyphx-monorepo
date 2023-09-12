import {error, aws} from 'core';

export class TextColumnToNumberConverter {
  private readonly tableName: string;
  private readonly columnName: string;
  private readonly convertedFields: Map<string, number>;
  private readonly athenaManager: aws.AthenaManager;

  public get size(): number {
    return this.convertedFields.size;
  }

  constructor(tableName: string, columnName: string, athenaManager: aws.AthenaManager) {
    this.tableName = tableName;
    this.columnName = columnName;
    this.convertedFields = new Map<string, number>();
    this.athenaManager = athenaManager;
  }

  public async load(): Promise<void> {
    const query = `SELECT DISTINCT ${this.columnName} FROM ${this.tableName} ORDER BY ${this.columnName}`;

    const data = await this.athenaManager.runQuery(query);

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

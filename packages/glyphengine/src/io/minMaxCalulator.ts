import {error, aws} from 'core';
import {glyphEngineTypes} from 'types';

interface IColumnMinMax {
  columnName: string;
  min: number | string;
  max: number | string;
}

interface IMinMax {
  x: IColumnMinMax;
  y: IColumnMinMax;
  z: IColumnMinMax;
}

export class MinMaxCalculator {
  private readonly tableName: string;
  private readonly xColumnName: string;
  private readonly yColumnName: string;
  private readonly zColumnName: string;

  // to avoid duplicating the GlyphEngine.formatCols logic
  private xCol: string;
  private yCol: string;
  private zCol: string;
  private zColName: string;

  private readonly filter: string;
  private readonly athenaClient: aws.AthenaManager;
  private minMaxField?: IMinMax;

  public get minMax(): IMinMax {
    if (!this.minMaxField) {
      throw new error.InvalidOperationError('You must call load before accessing minMax', {});
    }
    return this.minMaxField;
  }

  constructor(
    xCol: string, // the formatted Presto Function
    yCol: string, // the formatted Presto Function
    zCol: string, // the formatted Presto Function
    zColName: string,
    athenaClient: aws.AthenaManager,
    tableName: string,
    xColumnName: string,
    yColumnName: string,
    zColumnName: string,
    filter = ''
  ) {
    this.xCol = xCol;
    this.yCol = yCol;
    this.zCol = zCol;
    this.zColName = zColName;
    this.athenaClient = athenaClient;
    this.tableName = tableName;
    this.xColumnName = xColumnName;
    this.yColumnName = yColumnName;
    this.zColumnName = zColumnName;
    this.filter = filter;
  }

  public async load(): Promise<void> {
    const filterString = this.filter ? `WHERE ${this.filter}` : '';

    const formattedZ = this.zCol.replace('zColumn', `"${this.zColName}"`);
    const query = `
    WITH temp as (
      SELECT
      ${this.xCol} as xColumn,
      ${this.yCol} as yColumn,
      ${formattedZ} as zColumn
      FROM "${this.tableName}"
      ${filterString}
      GROUP BY ${this.xCol}, ${this.yCol}
    )
    SELECT
      MIN(xColumn) as "min${this.xColumnName}",
      MAX(xColumn) as "max${this.xColumnName}",
      MIN(yColumn) as "min${this.yColumnName}",
      MAX(yColumn) as "max${this.yColumnName}",
      MIN(zColumn) as "min${this.zColumnName}",
      MAX(zColumn) as "max${this.zColumnName}"
    FROM temp;
  `;

    const data = await this.athenaClient.runQuery(query);
    this.minMaxField = {
      x: {
        columnName: this.xColumnName,
        min: data[0][`min${this.xColumnName}`] as number,
        max: data[0][`max${this.xColumnName}`] as number,
      },
      y: {
        columnName: this.yColumnName,
        min: data[0][`min${this.yColumnName}`] as number,
        max: data[0][`max${this.yColumnName}`] as number,
      },
      z: {
        columnName: this.zColumnName,
        min: data[0][`min${this.zColumnName}`] as number,
        max: data[0][`max${this.zColumnName}`] as number,
      },
    };
  }
}

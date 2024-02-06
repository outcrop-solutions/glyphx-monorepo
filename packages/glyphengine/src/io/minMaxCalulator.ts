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
      MIN(xColumn) as "min_x_${this.xColumnName}",
      MAX(xColumn) as "max_x_${this.xColumnName}",
      MIN(yColumn) as "min_y_${this.yColumnName}",
      MAX(yColumn) as "max_y_${this.yColumnName}",
      MIN(zColumn) as "min_z_${this.zColumnName}",
      MAX(zColumn) as "max_z_${this.zColumnName}"
    FROM temp;
  `;
    const data = await this.athenaClient.runQuery(query);
    this.minMaxField = {
      x: {
        columnName: this.xColumnName,
        min: data[0][`min_x_${this.xColumnName}`] as number,
        max: data[0][`max_x_${this.xColumnName}`] as number,
      },
      y: {
        columnName: this.yColumnName,
        min: data[0][`min_y_${this.yColumnName}`] as number,
        max: data[0][`max_y_${this.yColumnName}`] as number,
      },
      z: {
        columnName: this.zColumnName,
        min: data[0][`min_z_${this.zColumnName}`] as number,
        max: data[0][`max_z_${this.zColumnName}`] as number,
      },
    };
  }
}

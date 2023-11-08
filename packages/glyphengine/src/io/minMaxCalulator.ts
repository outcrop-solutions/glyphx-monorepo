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
    xCol: string, // the formated Presto Function
    yCol: string, // the formated Presto Function
    zCol: string, // the formated Presto Function
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
    this.athenaClient = athenaClient;
    this.tableName = tableName;
    this.xColumnName = xColumnName;
    this.yColumnName = yColumnName;
    this.zColumnName = zColumnName;
    this.filter = filter;
  }

  public async load(): Promise<void> {
    const filterString = this.filter ? `WHERE ${this.filter}` : '';

    const query = `WITH temp as (SELECT "${this.xColumnName}","${this.yColumnName}", ${this.zCol} as "${this.zColumnName}" FROM "${this.tableName}" ${filterString} GROUP BY "${this.xColumnName}","${this.yColumnName}") SELECT MIN("${this.xColumnName}") as "min${this.xColumnName}", MAX("${this.xColumnName}") as "max${this.xColumnName}", MIN("${this.yColumnName}") as "min${this.yColumnName}", MAX("${this.yColumnName}") as "max${this.yColumnName}", MIN("${this.zColumnName}") as "min${this.zColumnName}", MAX("${this.zColumnName}") as "max${this.zColumnName}" FROM temp`;

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

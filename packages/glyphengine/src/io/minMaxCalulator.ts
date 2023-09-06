import athenaClient from './athenaClient';
import {error} from 'core';

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
  private readonly filter: string;
  private minMaxField?: IMinMax;

  public get minMax(): IMinMax {
    if (!this.minMaxField) {
      throw new error.InvalidOperationError('You must call load before accessing minMax', {});
    }
    return this.minMaxField;
  }

  constructor(tableName: string, xColumnName: string, yColumnName: string, zColumnName: string, filter = '') {
    this.tableName = tableName;
    this.xColumnName = xColumnName;
    this.yColumnName = yColumnName;
    this.zColumnName = zColumnName;
    this.filter = filter;
  }

  public async load(): Promise<void> {
    await athenaClient.init();
    const filterString = this.filter ? `WHERE ${this.filter}` : '';

    const query = `WITH temp as (SELECT "${this.xColumnName}","${this.yColumnName}", SUM("${this.zColumnName}") as "${this.zColumnName}" FROM "${this.tableName}" ${filterString} GROUP BY "${this.xColumnName}","${this.yColumnName}") SELECT MIN("${this.xColumnName}") as "min${this.xColumnName}", MAX("${this.xColumnName}") as "max${this.xColumnName}", MIN("${this.yColumnName}") as "min${this.yColumnName}", MAX("${this.yColumnName}") as "max${this.yColumnName}", MIN("${this.zColumnName}") as "min${this.zColumnName}", MAX("${this.zColumnName}") as "max${this.zColumnName}" FROM temp`;

    const data = await athenaClient.connection.runQuery(query);
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

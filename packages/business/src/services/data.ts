import {ProjectService} from './project';
import AthenaConnection from '../lib/athenaConnection';

import {error, generalPurposeFunctions} from 'core';
import {databaseTypes, fileIngestionTypes, glyphEngineTypes} from 'types';

export class DataService {
  static getFieldValue(axis: 'X' | 'Y', project: databaseTypes.IProject): [string, string] {
    const state = project.state.properties;
    let axisProperties = state[axis];
    let fieldName = axisProperties.key;
    let fieldType: fileIngestionTypes.constants.FIELD_TYPE = axisProperties.dataType;
    let selectDefinition = '';
    if (fieldType !== fileIngestionTypes.constants.FIELD_TYPE.DATE) {
      selectDefinition = fieldName;
    } else {
      const dateGrouping: string =
        axisProperties.dateGrouping ?? glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_MONTH;
      selectDefinition = generalPurposeFunctions.presto.generatePrestoDateConversionStatement(fieldName, dateGrouping);
    }
    return [fieldName, selectDefinition];
  }
  static async getLookUpFilter(projectId: string, tableName: string, lookUpIds: number[]) {
    let project = await ProjectService.getProject(projectId);
    if (!project)
      throw new error.DataNotFoundError(
        `A Project Cannot be found for projectId: ${projectId}`,
        'projectId',
        projectId
      );
    const [xFieldName, xFieldSelect] = this.getFieldValue('X', project);
    const [yFieldName, yFieldSelect] = this.getFieldValue('Y', project);
    let lookupIdQuery = `SELECT ${xFieldSelect} AS ${xFieldName}, ${yFieldSelect} AS ${yFieldName} FROM ${tableName} WHERE glyphx_id__ IN (${lookUpIds.join(
      ','
    )})`;
    const baseRows = await AthenaConnection.connection.runQuery(lookupIdQuery);
    if (baseRows.length !== lookUpIds.length) {
      throw new error.DataNotFoundError(
        `The number of rows returned from the lookup query does not match the number of lookupIds.  The lookupIds are: ${lookUpIds.join(
          ', '
        )}`,
        'lookUpIds',
        lookUpIds
      );
    }

    let result: Array<string> = [];
    for (let i = 0; i < baseRows.length; i++) {
      result.push(
        ` OR (${xFieldSelect} = ${baseRows[i][xFieldName]} AND ${yFieldSelect} = ${baseRows[i][yFieldName]}))`
      );
    }
    return `(${result.join('')}`;
  }
  static async buildQuery(
    projectId: string,
    tableName: string,
    glyphxIds: number[],
    pageSize: number = 50,
    pageNumber: number = 0,
    isExport: boolean = false
  ): Promise<string> {
    const offset = pageNumber * pageSize;
    let filter = '';
    //When we have long list of glyhpxIds for one glyph we will substitue
    //the actual glyphIds with a pattern of -9999 in position 0, and a valid
    //glyphId in position 1.  Then we will create a reverse lookup using the
    //good id to find the related rows that have automatically been grouped
    //together by glyphEngine.
    let goodIds: Array<number> = [];
    let lookUpIds: Array<number> = [];
    let i = 0;
    while (i < glyphxIds.length) {
      if (glyphxIds[i] !== -9999) {
        goodIds.push(glyphxIds[i]);
      } else {
        i++;
        lookUpIds.push(i);
      }

      i++;
    }
    filter = `glyphx_id__ IN (${goodIds.join(',')})`;

    if (lookUpIds.length > 0) {
      let lookUpFilter = this.getLookUpFilter(projectId, tableName, lookUpIds);
      filter = `${filter} ${lookUpFilter}`;
    }
    let query = `SELECT * FROM ${tableName} WHERE ${filter} ORDER BY glyphx_id__`;

    if (!isExport) {
      query = `${query} OFFSET ${offset} LIMIT ${pageSize}`;
    }

    return query;
  }
  public static async getDataByGlyphxIds(
    projectId: string,
    tableName: string,
    glyphxIds: number[],
    pageSize: number = 50,
    pageNumber: number = 0,
    isExport: boolean = false
  ): Promise<any[]> {
    try {
      const query = await this.buildQuery(projectId, tableName, glyphxIds, pageSize, pageNumber, isExport);
      const results = await AthenaConnection.connection.runQuery(query);
      return results;
    } catch (err) {
      const e = new error.DataServiceError(
        `An unexpected Error occurred while getting the data for the rowIds: ${glyphxIds.join(
          ', '
        )} from the table: ${tableName}.  See the inner error for additional details`,
        'Data',
        'getDataByGlyphxIds',
        {tableName, glyphxIds},
        err
      );

      e.publish();
      throw e;
    }
  }

  public static async getDataByTableName(
    tableName: string,
    pageSize: number = 50,
    pageNumber: number = 0
  ): Promise<any[]> {
    const offset = pageNumber * pageSize;
    const query = `SELECT * FROM "${tableName}" ORDER BY glyphx_id__ OFFSET ${offset} LIMIT ${pageSize}`;
    try {
      const results = await AthenaConnection.connection.runQuery(query);
      return results;
    } catch (err) {
      const e = new error.DataServiceError(
        `An unexpected Error occurred while getting the data from the table: ${tableName}.  See the inner error for additional details`,
        'Data',
        'getDataByTableName',
        {tableName},
        err
      );

      e.publish();
      throw e;
    }
  }
}

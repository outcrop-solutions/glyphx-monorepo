import {assert} from 'chai';
import {BasicHiveViewQueryPlanner} from '@fileProcessing';

import * as joinQueryHelpers from './basicHiveQueryPlanner.tests';
import * as fileProcessingInterfaces from 'interfaces/fileProcessing';
import {fileIngestionTypes} from 'types';

const VIEW_REGEX = 'CREATE\\s+VIEW\\s+$1\\s+AS\\s+SELECT';

function buildSingleJoin(): fileProcessingInterfaces.IJoinTableDefinition[] {
  const tableDef: fileProcessingInterfaces.IJoinTableDefinition = {
    tableName: 'table1',
    backingFileName: 'table1.parquet',
    tableAlias: 'A',
    tableIndex: 0,
    columns: [],
  };

  tableDef.columns.push({
    tableDefinition: tableDef,
    columnIndex: 0,
    columnName: 'column1',
    columnType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
    isJoinColumn: false,
    isSelectedColumn: true,
  });

  tableDef.columns.push({
    tableDefinition: tableDef,
    columnIndex: 1,
    columnName: 'column2',
    columnType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
    isJoinColumn: false,
    isSelectedColumn: true,
  });

  return [tableDef];
}
describe('#fileProcessing/BasicHiveViewQueryPlanner', () => {
  context('Basic View testing', () => {
    it('create a view from two joined tables', () => {
      const viewName = 'testView';
      const joinData = buildSingleJoin();

      const viewBuilder = new BasicHiveViewQueryPlanner();

      const viewString = viewBuilder.defineView(viewName, joinData);

      assert.isNotEmpty(viewString);

      const regEx = joinQueryHelpers.buildRegex(VIEW_REGEX, 'gmi', viewName);

      assert.isTrue(regEx.test(viewString));
    });
  });
  context('get view Accesor', () => {
    it('create a view from two joined tables', () => {
      const viewName = 'testView';
      const joinData = buildSingleJoin();

      const viewBuilder = new BasicHiveViewQueryPlanner();

      const viewString = viewBuilder.defineView(viewName, joinData);

      assert.isNotEmpty(viewString);

      assert.strictEqual(viewString, viewBuilder.view);
    });
  });
});

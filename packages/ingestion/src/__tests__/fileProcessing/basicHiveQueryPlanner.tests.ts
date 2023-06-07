import {assert} from 'chai';
import {BasicHiveQueryPlanner} from '@fileProcessing';
import * as fileProcessingInterfaces from '@interfaces/fileProcessing';
import {fileIngestion} from '@glyphx/types';

//$1 = our tableName -- this is case sensitive
const FROM_REGEX_TEMPLATE = '[Ff][Rr][Oo][Mm]\\s*$1\\s*(?:[Aa][Ss]\\s*)?$2\\s*';

//$1 = our table name -- this is case sensitive
//$2 = our table alias -- this is case sensitive
//$3 = the alias of the table we are joining to -- this is case sensitive
//$4 = the name of the field that we are joining on
const JOIN_REGEX_TEMPLATE =
  '[Ll][Ee][Ff][Tt]\\s*[Oo][Uu][Tt][Ee][Rr]\\s*[Jj][Oo][Ii][Nn]\\s*$1\\s*(?:[Aa][Ss]\\s*)?$2\\s*[Oo][Nn]\\s*$3.$4(?:\\s*)?=(?:\\s*)?$2.$4';

//$1 = our table name -- this is case sensitive
//$2 = our table alias -- this is case sensitive
const JOIN_NO_ON_REGEX_TEMPLATE =
  '[Ll][Ee][Ff][Tt]\\s*[Oo][Uu][Tt][Ee][Rr]\\s*[Jj][Oo][Ii][Nn]\\s*$1\\s*(?:[Aa][Ss]\\s*)?$2\\s*';

//This uses the same args as JOIN_REGEX_TEMPLATE except or $a.
//$a is replaced with the column number minimum of $5.
const SUB_JOIN_REGEX_TEMPLATE =
  '\\s*[Aa][Nn][Dd]\\s*$3.$a(?:\\s*)?=(?:\\s*)?$2.$a(?:\\s*)?';

const SELECT_REGEX_TEMPLATE = 'SELECT(.+?)FROM';

export function buildRegex(
  templateString: string,
  globalArgs: string,
  ...args: string[]
): RegExp {
  let tempString = templateString;

  let extraArgNumber = -1;

  args.forEach((s, index) => {
    if (extraArgNumber === -1) {
      const matchString = `$${index + 1}`;
      if (tempString.indexOf(matchString) !== -1) {
        tempString = tempString.replaceAll(matchString, s);
      } else extraArgNumber = index;
    }
  });

  return new RegExp(tempString, globalArgs);
}

export function testSelectResults(
  inputs: fileProcessingInterfaces.IJoinTableDefinition[],
  query: string
) {
  const selectRegex = new RegExp(SELECT_REGEX_TEMPLATE, 'gms');
  assert.isTrue(selectRegex.test(query));

  selectRegex.lastIndex = 0;
  const results = selectRegex.exec(query);

  assert.isOk(results);
  assert.isArray(results);
  assert.strictEqual(results?.length, 2);

  const selectedFields = results?.[1].trim() ?? '';

  //let's make sure that our select does not end with a ','.
  assert.notStrictEqual(
    selectedFields.substring(selectedFields.length - 1),
    ','
  );

  const selectedFieldsArray = selectedFields.split(',');
  //we are going to test this each way.  First input columns against the query string, then the query string against the inputs
  inputs.forEach(t => {
    t.columns
      .filter(c => c.isSelectedColumn)
      .forEach(c => {
        assert.isOk(
          selectedFieldsArray.find(
            s => s === `${t.tableAlias}."${c.columnName}"`
          ),
          `${t.tableName} - ${c.columnName}`
        );
      });
  });

  selectedFieldsArray.forEach(s => {
    const split = s.split('.');
    assert.strictEqual(split.length, 2);

    const alias = split[0];
    const field = split[1].replace(/"/g, '');

    const tableDef = inputs.find(t => t.tableAlias === alias);
    assert.isOk(tableDef);

    const column = tableDef?.columns.find(c => c.columnName === field);
    assert.isOk(column);

    assert.isTrue(column?.isSelectedColumn);
  });
}

export function testFromJoinSyntax(
  tableDef: fileProcessingInterfaces.IJoinTableDefinition,
  query: string
) {
  let regex: RegExp;

  if (tableDef.tableIndex === 0) {
    regex = buildRegex(
      FROM_REGEX_TEMPLATE,
      'gm',
      tableDef.tableName,
      tableDef.tableAlias
    );
  } else if (!tableDef.joinTable) {
    regex = buildRegex(
      JOIN_NO_ON_REGEX_TEMPLATE,
      'gm',
      tableDef.tableName,
      tableDef.tableAlias
    );
  } else {
    const joinColumns = tableDef.columns
      .filter(c => c.isJoinColumn)
      .map(c => c.columnName);
    let joinRegEx = JOIN_REGEX_TEMPLATE;
    for (let i = 1; i < joinColumns.length; i++) {
      joinRegEx += SUB_JOIN_REGEX_TEMPLATE.replace(
        /\$a/g,
        `$${(i + 4).toString()}`
      );
    }
    regex = buildRegex(
      joinRegEx,
      'gm',
      tableDef.tableName,
      tableDef.tableAlias,
      tableDef.joinTable?.tableAlias ?? '',
      ...tableDef.columns
        .filter(c => c.isJoinColumn)
        .map(c => `"${c.columnName}"`)
    );
  }
  assert.isTrue(regex.test(query), tableDef.tableName);
}

describe('#fileProcessing/BasicHiveQueryPlanner', () => {
  context('BasicHiveQueryPlanner', () => {
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
        columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        isJoinColumn: false,
        isSelectedColumn: true,
      });

      tableDef.columns.push({
        tableDefinition: tableDef,
        columnIndex: 1,
        columnName: 'column2',
        columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        isJoinColumn: false,
        isSelectedColumn: true,
      });

      return [tableDef];
    }

    function buildTwoTableJoint2to1(): fileProcessingInterfaces.IJoinTableDefinition[] {
      const tables = buildSingleJoin();
      const secondTable: fileProcessingInterfaces.IJoinTableDefinition = {
        tableName: 'table2',
        backingFileName: 'table2.parquet',
        tableAlias: 'B',
        tableIndex: 1,
        joinTable: tables[0],
        columns: [],
      };

      secondTable.columns.push({
        tableDefinition: secondTable,
        columnIndex: 0,
        columnName: 'column1',
        columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        isJoinColumn: true,
        isSelectedColumn: false,
      });

      secondTable.columns.push({
        tableDefinition: secondTable,
        columnIndex: 1,
        columnName: 'column3',
        columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        isJoinColumn: false,
        isSelectedColumn: true,
      });

      tables.push(secondTable);

      return tables;
    }
    function buildTwoTableJoint2to1MultiFields(): fileProcessingInterfaces.IJoinTableDefinition[] {
      const tables = buildSingleJoin();
      const secondTable: fileProcessingInterfaces.IJoinTableDefinition = {
        tableName: 'table2',
        backingFileName: 'table2.parquet',
        tableAlias: 'B',
        tableIndex: 1,
        joinTable: tables[0],
        columns: [],
      };

      secondTable.columns.push({
        tableDefinition: secondTable,
        columnIndex: 0,
        columnName: 'column1',
        columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        isJoinColumn: true,
        isSelectedColumn: false,
      });

      secondTable.columns.push({
        tableDefinition: secondTable,
        columnIndex: 1,
        columnName: 'column2',
        columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        isJoinColumn: true,
        isSelectedColumn: false,
      });

      secondTable.columns.push({
        tableDefinition: secondTable,
        columnIndex: 2,
        columnName: 'column3',
        columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        isJoinColumn: false,
        isSelectedColumn: true,
      });

      tables.push(secondTable);

      return tables;
    }

    function buildThreeTableJoint3to2(): fileProcessingInterfaces.IJoinTableDefinition[] {
      const tables = buildTwoTableJoint2to1MultiFields();
      const thirdTable: fileProcessingInterfaces.IJoinTableDefinition = {
        tableName: 'table3',
        backingFileName: 'table3.parquet',
        tableAlias: 'C',
        tableIndex: 2,
        joinTable: tables[1],
        columns: [],
      };

      thirdTable.columns.push({
        tableDefinition: thirdTable,
        columnIndex: 0,
        columnName: 'column1',
        columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        isJoinColumn: true,
        isSelectedColumn: false,
      });

      thirdTable.columns.push({
        tableDefinition: thirdTable,
        columnIndex: 2,
        columnName: 'column3',
        columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        isJoinColumn: false,
        isSelectedColumn: true,
      });

      tables.push(thirdTable);

      return tables;
    }
    function buildTwoTableJointNoRelations(): fileProcessingInterfaces.IJoinTableDefinition[] {
      const tables = buildSingleJoin();
      const secondTable: fileProcessingInterfaces.IJoinTableDefinition = {
        tableName: 'table2',
        backingFileName: 'table2.parquet',
        tableAlias: 'B',
        tableIndex: 1,
        columns: [],
      };

      secondTable.columns.push({
        tableDefinition: secondTable,
        columnIndex: 0,
        columnName: 'column1',
        columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        isJoinColumn: false,
        isSelectedColumn: true,
      });

      secondTable.columns.push({
        tableDefinition: secondTable,
        columnIndex: 1,
        columnName: 'column3',
        columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        isJoinColumn: false,
        isSelectedColumn: true,
      });

      tables.push(secondTable);

      return tables;
    }

    it('will build a query for a single table', () => {
      const queryPlanner = new BasicHiveQueryPlanner();
      const joinMock = buildSingleJoin();
      const query = queryPlanner.defineQuery(joinMock);
      assert.isOk(query);
      testSelectResults(joinMock, query);
      joinMock.forEach(t => {
        testFromJoinSyntax(t, query);
      });
    });
    it('will build a query for two tables', () => {
      const queryPlanner = new BasicHiveQueryPlanner();
      const joinMock = buildTwoTableJoint2to1();
      const query = queryPlanner.defineQuery(joinMock);
      assert.isOk(query);

      testSelectResults(joinMock, query);
      joinMock.forEach(t => {
        testFromJoinSyntax(t, query);
      });
    });
    it('will build a query for two tables with 2 column join', () => {
      const queryPlanner = new BasicHiveQueryPlanner();
      const joinMock = buildTwoTableJoint2to1MultiFields();
      const query = queryPlanner.defineQuery(joinMock);
      assert.isOk(query);

      testSelectResults(joinMock, query);
      joinMock.forEach(t => {
        testFromJoinSyntax(t, query);
      });
    });

    it('will build a query for 3 tables with mixed joins', () => {
      const queryPlanner = new BasicHiveQueryPlanner();
      const joinMock = buildThreeTableJoint3to2();
      const query = queryPlanner.defineQuery(joinMock);
      assert.isOk(query);

      testSelectResults(joinMock, query);
      joinMock.forEach(t => {
        testFromJoinSyntax(t, query);
      });
    });
    it('will build a query for 2 tables with no relations', () => {
      const queryPlanner = new BasicHiveQueryPlanner();
      const joinMock = buildTwoTableJointNoRelations();
      const query = queryPlanner.defineQuery(joinMock);
      assert.isOk(query);

      testSelectResults(joinMock, query);
      joinMock.forEach(t => {
        testFromJoinSyntax(t, query);
      });
    });
  });

  context('getQuery Accessor', () => {
    it('will retreive the query using the accessor', () => {
      const tableDef: fileProcessingInterfaces.IJoinTableDefinition = {
        tableName: 'table1',
        backingFileName: 'table2.parquet',
        tableAlias: 'A',
        tableIndex: 0,
        columns: [],
      };

      tableDef.columns.push({
        tableDefinition: tableDef,
        columnIndex: 0,
        columnName: 'column1',
        columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        isJoinColumn: false,
        isSelectedColumn: true,
      });

      tableDef.columns.push({
        tableDefinition: tableDef,
        columnIndex: 1,
        columnName: 'column2',
        columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        isJoinColumn: false,
        isSelectedColumn: true,
      });
      const queryPlanner = new BasicHiveQueryPlanner();
      const query = queryPlanner.defineQuery([tableDef]);
      assert.isOk(query);

      const q2 = queryPlanner.query;

      testSelectResults([tableDef], q2);
      [tableDef].forEach(t => {
        testFromJoinSyntax(t, q2);
      });
    });
  });
});

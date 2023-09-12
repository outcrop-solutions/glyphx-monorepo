import {assert} from 'chai';
import {BasicJoinProcessor as JoinProcessor} from '../../fileProcessing';
import {error} from 'core';
import {IFieldDefinition, IJoinTableColumnDefinition} from '../../interfaces/fileProcessing';
import {fileIngestionTypes} from 'types';
import {GLYPHX_ID_COLUMN_NAME} from '../../fileProcessing/basicFileTransformer';

describe('#fileProcessing/basicJoinProcessor', () => {
  context('cleanTableName', () => {
    it('will clean and lcase a table name', () => {
      const testTableName = ' IamATable ';
      const joinProcessor = new JoinProcessor();
      const cleanTableName = joinProcessor['cleanTableName'](testTableName);
      assert.strictEqual(cleanTableName, 'iamatable');
    });
  });

  context('addTable', () => {
    //This will also test addColumns
    it('will add a table to processedTables', () => {
      const testTableName = 'IAmATestTable';
      const backingFileName = `${testTableName}.parquet`;
      const fields: IFieldDefinition[] = [
        {
          name: GLYPHX_ID_COLUMN_NAME,
          origionalName: GLYPHX_ID_COLUMN_NAME,
          fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
        },
        {
          name: 'field1',
          origionalName: 'field1',
          fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
        },
        {
          name: 'field2',
          origionalName: 'field2',
          fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
        },
      ];
      const joinProcessor = new JoinProcessor();
      const newTable = joinProcessor['addTable'](testTableName, backingFileName, fields);
      const processedTables = joinProcessor.joinData;
      assert.isArray(processedTables);
      assert.strictEqual(processedTables.length, 1);

      const processedTable = processedTables[0];
      assert.isOk(processedTable);
      assert.strictEqual(processedTable.tableName, testTableName);
      assert.strictEqual(processedTable.backingFileName, backingFileName);
      assert.strictEqual(processedTable.tableIndex, 0);
      assert.strictEqual(processedTable.tableAlias, 'A');
      assert.strictEqual(processedTable.columns.length, 3);

      for (let i = 0; i < fields.length; i++) {
        const col = processedTable.columns[i];
        const field = fields[i];

        assert.strictEqual(col.columnIndex, i, col.columnName);
        assert.strictEqual(col.columnName, field.name, col.columnName);
        assert.strictEqual(col.columnType, field.fieldType);
      }

      assert.equal(newTable, processedTable);
    });
    it('will add a second table to processedTables', () => {
      const testTableName = 'IAmATestTable1';
      const backingFileName = `${testTableName}.parquet`;
      const testTableName2 = 'IAmATestTable2';
      const backingFileName2 = `${testTableName2}.parquet`;
      const joinProcessor = new JoinProcessor();
      joinProcessor['addTable'](testTableName, backingFileName, []);
      const newProcessedTable = joinProcessor['addTable'](testTableName2, backingFileName2, []);
      const processedTables = joinProcessor['processedTables'];
      assert.isArray(processedTables);
      assert.strictEqual(processedTables.length, 2);

      const processedTable = processedTables[1];
      assert.isOk(processedTable);
      assert.strictEqual(processedTable.tableName, testTableName2);
      assert.strictEqual(processedTable.tableIndex, 1);
      assert.strictEqual(processedTable.tableAlias, 'B');
      assert.strictEqual(processedTable.backingFileName, backingFileName2);

      assert.equal(newProcessedTable, processedTable);
    });
  });

  context('doesTableExist', () => {
    let joinProcessor: JoinProcessor;
    const testTableName = 'testTableName';
    const backingFileName = `${testTableName}.parquet`;
    before(() => {
      joinProcessor = new JoinProcessor();
      joinProcessor['addTable'](testTableName, backingFileName, []);
      joinProcessor['addTable'](testTableName + '-1', backingFileName, []);
      joinProcessor['addTable'](testTableName + '-2', backingFileName, []);
      joinProcessor['addTable'](testTableName + '-3', backingFileName, []);

      assert.strictEqual(joinProcessor['processedTables'].length, 4);
    });
    it('should find our table', () => {
      const table = joinProcessor['doesTableExist'](testTableName);
      assert.isTrue(table);
    });

    it('should not find our table', () => {
      const table = joinProcessor['doesTableExist']('HiMom');
      assert.isFalse(table);
    });
  });

  context('processColumns', () => {
    //this will also process the join data
    it('should throw an error when adding a table with a duplicate name', () => {
      const tableName = 'testTableName';
      const backingFileName = `${tableName}.parquet`;
      const joinProcessor = new JoinProcessor();

      const fields: IFieldDefinition[] = [
        {
          name: GLYPHX_ID_COLUMN_NAME,
          origionalName: GLYPHX_ID_COLUMN_NAME,
          fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
        },
        {
          name: 'field1',
          origionalName: 'field1',
          fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
        },
        {
          name: 'field2',
          origionalName: 'field2',
          fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
        },
      ];
      joinProcessor['addTable'](joinProcessor['cleanTableName'](tableName), backingFileName, fields);
      assert.throws(() => {
        //make the name upper to make sure that cleanTableName is called.
        joinProcessor.processColumns(tableName.toUpperCase(), backingFileName, fields);
      }, error.InvalidArgumentError);
    });

    it('should add a single table with no join information', () => {
      const table1 = {
        tableName: 'table1',
        backingFileName: 'table1.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field2',
            origionalName: 'field2',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const joinProcessor = new JoinProcessor();
      joinProcessor.processColumns(table1.tableName, table1.backingFileName, table1.fields);

      const tables = joinProcessor['processedTables'];
      assert.strictEqual(tables.length, 1);

      const tableDefinition = tables[0];
      assert.notExists(tableDefinition.joinTable);

      const columns = tableDefinition.columns;
      assert.strictEqual(columns.length, table1.fields.length);

      columns.forEach((c: IJoinTableColumnDefinition) => {
        assert.isTrue(c.isSelectedColumn);
        assert.isFalse(c.isJoinColumn);
      });
    });

    it('should join two tables on a single field', () => {
      const table1 = {
        tableName: 'table1',
        backingFileName: 'table1.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field2',
            origionalName: 'field2',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const table2 = {
        tableName: 'table2',
        backingFileName: 'table2.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field3',
            origionalName: 'field3',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const joinProcessor = new JoinProcessor();
      joinProcessor.processColumns(table1.tableName, table1.backingFileName, table1.fields);
      joinProcessor.processColumns(table2.tableName, table2.backingFileName, table2.fields);

      const tables = joinProcessor['processedTables'];
      assert.strictEqual(tables.length, 2);

      const tableDefinition1 = tables[0];
      assert.notExists(tableDefinition1.joinTable);

      const tableDefinition2 = tables[1];
      assert.exists(tableDefinition2.joinTable);

      assert.equal(tableDefinition2.joinTable, tableDefinition1);

      const columns1 = tableDefinition1.columns;
      assert.strictEqual(columns1.length, table1.fields.length);

      columns1.forEach((c: IJoinTableColumnDefinition) => {
        assert.isTrue(c.isSelectedColumn);
        assert.isFalse(c.isJoinColumn);
      });
      const columns2 = tableDefinition2.columns;
      assert.strictEqual(columns2.length, table2.fields.length);

      //Our glyphxId
      assert.isFalse(columns2[0].isJoinColumn);
      assert.isFalse(columns2[0].isSelectedColumn);

      assert.isTrue(columns2[1].isJoinColumn);
      assert.isFalse(columns2[1].isSelectedColumn);

      assert.isFalse(columns2[2].isJoinColumn);
      assert.isTrue(columns2[2].isSelectedColumn);
    });

    it('should join three tables on a single field, 2 to 1 and 3 to 1', () => {
      const table1 = {
        tableName: 'table1',
        backingFileName: 'table1.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field2',
            origionalName: 'field2',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const table2 = {
        tableName: 'table2',
        backingFileName: 'table2.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field3',
            origionalName: 'field3',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const table3 = {
        tableName: 'table3',
        backingFileName: 'table3.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field4',
            origionalName: 'field4',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const joinProcessor = new JoinProcessor();
      joinProcessor.processColumns(table1.tableName, table1.backingFileName, table1.fields);
      joinProcessor.processColumns(table2.tableName, table2.backingFileName, table2.fields);
      joinProcessor.processColumns(table3.tableName, table3.backingFileName, table3.fields);

      const tables = joinProcessor['processedTables'];
      assert.strictEqual(tables.length, 3);

      const tableDefinition1 = tables[0];
      assert.notExists(tableDefinition1.joinTable);

      const tableDefinition2 = tables[1];
      assert.exists(tableDefinition2.joinTable);

      assert.equal(tableDefinition2.joinTable, tableDefinition1);

      const tableDefinition3 = tables[2];
      assert.exists(tableDefinition3.joinTable);

      assert.equal(tableDefinition3.joinTable, tableDefinition1);

      const columns1 = tableDefinition1.columns;
      assert.strictEqual(columns1.length, table1.fields.length);

      columns1.forEach((c: IJoinTableColumnDefinition) => {
        assert.isTrue(c.isSelectedColumn);
        assert.isFalse(c.isJoinColumn);
      });
      const columns2 = tableDefinition2.columns;
      assert.strictEqual(columns2.length, table2.fields.length);

      assert.isFalse(columns2[0].isJoinColumn);
      assert.isFalse(columns2[0].isSelectedColumn);

      assert.isTrue(columns2[1].isJoinColumn);
      assert.isFalse(columns2[1].isSelectedColumn);

      assert.isFalse(columns2[2].isJoinColumn);
      assert.isTrue(columns2[2].isSelectedColumn);

      const columns3 = tableDefinition3.columns;
      assert.strictEqual(columns3.length, table3.fields.length);

      assert.isFalse(columns3[0].isJoinColumn);
      assert.isFalse(columns3[0].isSelectedColumn);

      assert.isTrue(columns3[1].isJoinColumn);
      assert.isFalse(columns3[1].isSelectedColumn);

      assert.isFalse(columns3[2].isJoinColumn);
      assert.isTrue(columns3[2].isSelectedColumn);
    });

    it('should join three tables on a single field, 2 to 1 and 3 to 2', () => {
      const table1 = {
        tableName: 'table1',
        backingFileName: 'table1.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field2',
            origionalName: 'field2',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const table2 = {
        tableName: 'table2',
        backingFileName: 'table2.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field3',
            origionalName: 'field3',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const table3 = {
        tableName: 'table3',
        backingFileName: 'table3.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field3',
            origionalName: 'field3',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field4',
            origionalName: 'field4',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const joinProcessor = new JoinProcessor();
      joinProcessor.processColumns(table1.tableName, table1.backingFileName, table1.fields);
      joinProcessor.processColumns(table2.tableName, table2.backingFileName, table2.fields);
      joinProcessor.processColumns(table3.tableName, table3.backingFileName, table3.fields);

      const tables = joinProcessor['processedTables'];
      assert.strictEqual(tables.length, 3);

      const tableDefinition1 = tables[0];
      assert.notExists(tableDefinition1.joinTable);

      const tableDefinition2 = tables[1];
      assert.exists(tableDefinition2.joinTable);

      assert.equal(tableDefinition2.joinTable, tableDefinition1);

      const tableDefinition3 = tables[2];
      assert.exists(tableDefinition3.joinTable);

      assert.equal(tableDefinition3.joinTable, tableDefinition2);

      const columns1 = tableDefinition1.columns;
      assert.strictEqual(columns1.length, table1.fields.length);

      columns1.forEach((c: IJoinTableColumnDefinition) => {
        assert.isTrue(c.isSelectedColumn);
        assert.isFalse(c.isJoinColumn);
      });
      const columns2 = tableDefinition2.columns;
      assert.strictEqual(columns2.length, table2.fields.length);

      assert.isFalse(columns2[0].isJoinColumn);
      assert.isFalse(columns2[0].isSelectedColumn);

      assert.isTrue(columns2[1].isJoinColumn);
      assert.isFalse(columns2[1].isSelectedColumn);

      assert.isFalse(columns2[2].isJoinColumn);
      assert.isTrue(columns2[2].isSelectedColumn);

      const columns3 = tableDefinition3.columns;
      assert.strictEqual(columns3.length, table3.fields.length);

      assert.isFalse(columns3[0].isJoinColumn);
      assert.isFalse(columns3[0].isSelectedColumn);

      assert.isTrue(columns3[1].isJoinColumn);
      assert.isFalse(columns3[1].isSelectedColumn);

      assert.isFalse(columns3[2].isJoinColumn);
      assert.isTrue(columns3[2].isSelectedColumn);
    });

    it('should join three tables on multiple fields with field type conflicts, 2 to 1 and 3 to 1', () => {
      //will join 1 because 2 of the fields in 2 while having the same name have different types
      const table1 = {
        tableName: 'table1',
        backingFileName: 'table1.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field2',
            origionalName: 'field2',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },

          {
            name: 'field11',
            origionalName: 'field11',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field22',
            origionalName: 'field22',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
        ],
      };

      const table2 = {
        tableName: 'table2',
        backingFileName: 'table2.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field3',
            origionalName: 'field3',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field11',
            origionalName: 'field11',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field22',
            origionalName: 'field22',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const table3 = {
        tableName: 'table3',
        backingFileName: 'table3.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field4',
            origionalName: 'field4',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field11',
            origionalName: 'field11',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field22',
            origionalName: 'field22',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field3',
            origionalName: 'field3',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const joinProcessor = new JoinProcessor();
      joinProcessor.processColumns(table1.tableName, table1.backingFileName, table1.fields);
      joinProcessor.processColumns(table2.tableName, table2.backingFileName, table2.fields);
      joinProcessor.processColumns(table3.tableName, table3.backingFileName, table3.fields);

      const tables = joinProcessor['processedTables'];
      assert.strictEqual(tables.length, 3);

      const tableDefinition1 = tables[0];
      assert.notExists(tableDefinition1.joinTable);

      const tableDefinition2 = tables[1];
      assert.exists(tableDefinition2.joinTable);

      assert.equal(tableDefinition2.joinTable, tableDefinition1);

      const tableDefinition3 = tables[2];
      assert.exists(tableDefinition3.joinTable);

      assert.equal(tableDefinition3.joinTable, tableDefinition1);

      const columns1 = tableDefinition1.columns;
      assert.strictEqual(columns1.length, table1.fields.length);

      columns1.forEach((c: IJoinTableColumnDefinition) => {
        assert.isTrue(c.isSelectedColumn);
        assert.isFalse(c.isJoinColumn);
      });
      const columns2 = tableDefinition2.columns;
      assert.strictEqual(columns2.length, table2.fields.length);

      assert.isFalse(columns2[0].isJoinColumn);
      assert.isFalse(columns2[0].isSelectedColumn);

      assert.isTrue(columns2[1].isJoinColumn);
      assert.isFalse(columns2[1].isSelectedColumn);

      assert.isFalse(columns2[2].isJoinColumn);
      assert.isTrue(columns2[2].isSelectedColumn);

      assert.isFalse(columns2[3].isJoinColumn);
      assert.isTrue(columns2[3].isSelectedColumn);

      assert.isFalse(columns2[4].isJoinColumn);
      assert.isTrue(columns2[4].isSelectedColumn);

      const columns3 = tableDefinition3.columns;
      assert.strictEqual(columns3.length, table3.fields.length);

      assert.isFalse(columns3[0].isJoinColumn);
      assert.isFalse(columns3[0].isSelectedColumn);

      assert.isTrue(columns3[1].isJoinColumn);
      assert.isFalse(columns3[1].isSelectedColumn);

      assert.isFalse(columns3[2].isJoinColumn);
      assert.isTrue(columns3[2].isSelectedColumn);

      assert.isTrue(columns3[3].isJoinColumn);
      assert.isFalse(columns3[3].isSelectedColumn);

      assert.isTrue(columns3[4].isJoinColumn);
      assert.isFalse(columns3[4].isSelectedColumn);

      assert.isFalse(columns3[5].isJoinColumn);
      assert.isTrue(columns3[5].isSelectedColumn);
    });

    it('should join three tables on multiple fields with field type conflicts, 2 to 1 and 3 to 2', () => {
      //will join 1 because 2 of the fields in 2 while having the same name have different types
      const table1 = {
        tableName: 'table1',
        backingFileName: 'table1.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field2',
            origionalName: 'field2',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },

          {
            name: 'field11',
            origionalName: 'field11',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field22',
            origionalName: 'field22',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
        ],
      };

      const table2 = {
        tableName: 'table2',
        backingFileName: 'table2.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field3',
            origionalName: 'field3',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field11',
            origionalName: 'field11',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field22',
            origionalName: 'field22',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const table3 = {
        tableName: 'table3',
        backingFileName: 'table3.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field4',
            origionalName: 'field4',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field11',
            origionalName: 'field11',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field22',
            origionalName: 'field22',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field3',
            origionalName: 'field3',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
        ],
      };

      const joinProcessor = new JoinProcessor();
      joinProcessor.processColumns(table1.tableName, table1.backingFileName, table1.fields);
      joinProcessor.processColumns(table2.tableName, table2.backingFileName, table2.fields);
      joinProcessor.processColumns(table3.tableName, table3.backingFileName, table3.fields);

      const tables = joinProcessor['processedTables'];
      assert.strictEqual(tables.length, 3);

      const tableDefinition1 = tables[0];
      assert.notExists(tableDefinition1.joinTable);

      const tableDefinition2 = tables[1];
      assert.exists(tableDefinition2.joinTable);

      assert.equal(tableDefinition2.joinTable, tableDefinition1);

      const tableDefinition3 = tables[2];
      assert.exists(tableDefinition3.joinTable);

      assert.equal(tableDefinition3.joinTable, tableDefinition2);

      const columns1 = tableDefinition1.columns;
      assert.strictEqual(columns1.length, table1.fields.length);

      columns1.forEach((c: IJoinTableColumnDefinition) => {
        assert.isTrue(c.isSelectedColumn);
        assert.isFalse(c.isJoinColumn);
      });
      const columns2 = tableDefinition2.columns;
      assert.strictEqual(columns2.length, table2.fields.length);

      assert.isFalse(columns2[0].isJoinColumn);
      assert.isFalse(columns2[0].isSelectedColumn);

      assert.isTrue(columns2[1].isJoinColumn);
      assert.isFalse(columns2[1].isSelectedColumn);

      assert.isFalse(columns2[2].isJoinColumn);
      assert.isTrue(columns2[2].isSelectedColumn);

      assert.isFalse(columns2[3].isJoinColumn);
      assert.isTrue(columns2[3].isSelectedColumn);

      assert.isFalse(columns2[4].isJoinColumn);
      assert.isTrue(columns2[4].isSelectedColumn);

      const columns3 = tableDefinition3.columns;
      assert.strictEqual(columns3.length, table3.fields.length);

      assert.isFalse(columns3[0].isJoinColumn);
      assert.isFalse(columns3[0].isSelectedColumn);

      assert.isTrue(columns3[1].isJoinColumn);
      assert.isFalse(columns3[1].isSelectedColumn);

      assert.isFalse(columns3[2].isJoinColumn);
      assert.isTrue(columns3[2].isSelectedColumn);

      assert.isTrue(columns3[3].isJoinColumn);
      assert.isFalse(columns3[3].isSelectedColumn);

      assert.isTrue(columns3[4].isJoinColumn);
      assert.isFalse(columns3[4].isSelectedColumn);

      assert.isFalse(columns3[5].isJoinColumn);
      assert.isTrue(columns3[5].isSelectedColumn);
    });

    it('should join two tables but no fields match', () => {
      const table1 = {
        tableName: 'table1',
        backingFileName: 'table1.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field2',
            origionalName: 'field2',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const table2 = {
        tableName: 'table2',
        backingFileName: 'table2.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field11',
            origionalName: 'field11',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field3',
            origionalName: 'field3',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.DATE,
          },
        ],
      };

      const joinProcessor = new JoinProcessor();
      joinProcessor.processColumns(table1.tableName, table1.backingFileName, table1.fields);
      joinProcessor.processColumns(table2.tableName, table2.backingFileName, table2.fields);

      const tables = joinProcessor['processedTables'];
      assert.strictEqual(tables.length, 2);

      const tableDefinition1 = tables[0];
      assert.notExists(tableDefinition1.joinTable);

      const tableDefinition2 = tables[1];
      assert.notExists(tableDefinition2.joinTable);

      const columns1 = tableDefinition1.columns;
      assert.strictEqual(columns1.length, table1.fields.length);

      columns1.forEach((c: IJoinTableColumnDefinition) => {
        assert.isTrue(c.isSelectedColumn);
        assert.isFalse(c.isJoinColumn);
      });
      const columns2 = tableDefinition2.columns;
      assert.strictEqual(columns2.length, table2.fields.length);

      assert.isFalse(columns2[0].isJoinColumn);
      assert.isFalse(columns2[0].isSelectedColumn);

      assert.isFalse(columns2[1].isJoinColumn);
      assert.isTrue(columns2[1].isSelectedColumn);

      assert.isFalse(columns2[2].isJoinColumn);
      assert.isTrue(columns2[2].isSelectedColumn);
    });

    it('should not join two tables on a date', () => {
      const table1 = {
        tableName: 'table1',
        backingFileName: 'table1.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.DATE,
          },
          {
            name: 'field2',
            origionalName: 'field2',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const table2 = {
        tableName: 'table2',
        backingFileName: 'table2.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.DATE,
          },
          {
            name: 'field3',
            origionalName: 'field3',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const joinProcessor = new JoinProcessor();
      joinProcessor.processColumns(table1.tableName, table1.backingFileName, table1.fields);
      joinProcessor.processColumns(table2.tableName, table2.backingFileName, table2.fields);

      const tables = joinProcessor['processedTables'];
      assert.strictEqual(tables.length, 2);

      const tableDefinition1 = tables[0];
      assert.notExists(tableDefinition1.joinTable);

      const tableDefinition2 = tables[1];
      assert.notExists(tableDefinition2.joinTable);

      const columns1 = tableDefinition1.columns;
      assert.strictEqual(columns1.length, table1.fields.length);

      columns1.forEach((c: IJoinTableColumnDefinition) => {
        assert.isTrue(c.isSelectedColumn);
        assert.isFalse(c.isJoinColumn);
      });
      const columns2 = tableDefinition2.columns;
      assert.strictEqual(columns2.length, table2.fields.length);

      //Our glyphxId
      assert.isFalse(columns2[0].isJoinColumn);
      assert.isFalse(columns2[0].isSelectedColumn);

      assert.isFalse(columns2[1].isJoinColumn);
      assert.isFalse(columns2[1].isSelectedColumn);

      assert.isFalse(columns2[2].isJoinColumn);
      assert.isTrue(columns2[2].isSelectedColumn);
    });

    it('should not include date columns in a join', () => {
      const table1 = {
        tableName: 'table1',
        backingFileName: 'table1.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.DATE,
          },
          {
            name: 'field2',
            origionalName: 'field2',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        ],
      };

      const table2 = {
        tableName: 'table2',
        backingFileName: 'table2.parquet',
        fields: [
          {
            name: GLYPHX_ID_COLUMN_NAME,
            origionalName: GLYPHX_ID_COLUMN_NAME,
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          },
          {
            name: 'field1',
            origionalName: 'field1',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.DATE,
          },
          {
            name: 'field2',
            origionalName: 'field2',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
          {
            name: 'field3',
            origionalName: 'field3',
            fieldType: fileIngestionTypes.constants.FIELD_TYPE.DATE,
          },
        ],
      };

      const joinProcessor = new JoinProcessor();
      joinProcessor.processColumns(table1.tableName, table1.backingFileName, table1.fields);
      joinProcessor.processColumns(table2.tableName, table2.backingFileName, table2.fields);

      const tables = joinProcessor['processedTables'];
      assert.strictEqual(tables.length, 2);

      const tableDefinition1 = tables[0];
      assert.notExists(tableDefinition1.joinTable);

      const tableDefinition2 = tables[1];
      assert.exists(tableDefinition2.joinTable);

      const columns1 = tableDefinition1.columns;
      assert.strictEqual(columns1.length, table1.fields.length);

      columns1.forEach((c: IJoinTableColumnDefinition) => {
        assert.isTrue(c.isSelectedColumn);
        assert.isFalse(c.isJoinColumn);
      });
      const columns2 = tableDefinition2.columns;
      assert.strictEqual(columns2.length, table2.fields.length);

      //Our glyphxId
      assert.isFalse(columns2[0].isJoinColumn);
      assert.isFalse(columns2[0].isSelectedColumn);

      assert.isFalse(columns2[1].isJoinColumn);
      assert.isFalse(columns2[1].isSelectedColumn);

      assert.isTrue(columns2[2].isJoinColumn);
      assert.isFalse(columns2[2].isSelectedColumn);

      assert.isFalse(columns2[3].isJoinColumn);
      assert.isTrue(columns2[3].isSelectedColumn);
    });
  });
});

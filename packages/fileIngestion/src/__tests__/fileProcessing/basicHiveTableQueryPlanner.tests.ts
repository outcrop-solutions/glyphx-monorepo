import {assert} from 'chai';
import {BasicHiveTableQueryPlanner} from '@fileProcessing';
import {
  FIELD_TYPE,
  FILE_STORAGE_TYPES,
  COMPRESSION_TYPES,
} from '@util/constants';
import * as fileProcessingInterfaces from '@interfaces/fileProcessing';

function removeDoubleSpaces(input: string): string {
  const retval = input.replace(/ {2}/g, ' ');
  if (retval.indexOf('  ') > 0) return removeDoubleSpaces(retval);
  return retval;
}
const REG_EX =
  /CREATE\s+EXTERNAL\s+TABLE\s+(\w+)\s+\(\s+((?:\w+\s+(?:varchar\(\d+\)|double),\s+)+)(\w+\s+(?:varchar\(\d+\)|double)\s+)\)\s+STORED\s+AS\s+(PARQUET)\s+LOCATION\s+'(.+)'\s+TBLPROPERTIES\s+\('parquet\.compression'='(\w+)'\);/gim;

describe('#fileProcessing/BasicHiveTableQueryPlanner', () => {
  beforeEach(() => {
    REG_EX.lastIndex = 0;
  });
  context('Basic Table Creation Processing', () => {
    it('Will build a table with GZIP compression backed by a parquet file', () => {
      const fileName = 'testFile.parquet';
      const tableName = 'testTable';
      const bucketName = 'testbucket';

      const fileStoregeType = FILE_STORAGE_TYPES.PARQUET;
      const compressionType = COMPRESSION_TYPES.GZIP;

      const tableDef: fileProcessingInterfaces.IJoinTableDefinition = {
        tableName: tableName,
        backingFileName: `${tableName}.parquet`,
        tableAlias: 'A',
        tableIndex: 0,
        columns: [],
      };

      tableDef.columns.push({
        tableDefinition: tableDef,
        columnIndex: 0,
        columnName: 'column1',
        columnType: FIELD_TYPE.STRING,
        isJoinColumn: false,
        isSelectedColumn: true,
        columnLength: 100,
      });

      tableDef.columns.push({
        tableDefinition: tableDef,
        columnIndex: 1,
        columnName: 'column2',
        columnType: FIELD_TYPE.FLOAT,
        isJoinColumn: false,
        isSelectedColumn: true,
      });
      const tableQueryBuilder = new BasicHiveTableQueryPlanner(
        bucketName,
        fileStoregeType,
        compressionType
      );

      const tableQuery = tableQueryBuilder.defineQuery(
        fileName,
        tableName,
        tableDef
      );

      assert.isNotEmpty(tableQuery);

      assert.isTrue(REG_EX.test(tableQuery));
      REG_EX.lastIndex = 0;

      const extractions = REG_EX.exec(tableQuery) as any;

      assert.isNotEmpty(extractions);
      if (extractions?.length > 6) {
        assert.strictEqual(extractions[1], tableName);
        assert.strictEqual(extractions[4], fileStoregeType);
        assert.strictEqual(extractions[5], `s3://${bucketName}/${fileName}`);
        assert.strictEqual(extractions[6], compressionType);

        const columnString = removeDoubleSpaces(
          (extractions[2] + extractions[3]).replace(/\n/g, ' ')
        );
        const splits = columnString.split(',').map(s => s.trim());
        tableDef.columns.forEach(c => {
          const columnString = splits.find(s =>
            s.startsWith(`${c.columnName}`)
          ) as string;
          assert.isOk(columnString);

          const splitColumn = columnString.split(' ');
          assert.strictEqual(splitColumn.length, 2);
          assert.strictEqual(
            splitColumn[1],
            c.columnType === FIELD_TYPE.STRING ? 'varchar(100)' : 'double'
          );
        });
      }
    });
    it('Will build a table with a string with length > 65535', () => {
      const fileName = 'testFile.parquet';
      const tableName = 'testTable';
      const bucketName = 'testbucket';

      const fileStoregeType = FILE_STORAGE_TYPES.PARQUET;
      const compressionType = COMPRESSION_TYPES.GZIP;

      const tableDef: fileProcessingInterfaces.IJoinTableDefinition = {
        tableName: tableName,
        backingFileName: `${tableName}.parquet`,
        tableAlias: 'A',
        tableIndex: 0,
        columns: [],
      };

      tableDef.columns.push({
        tableDefinition: tableDef,
        columnIndex: 0,
        columnName: 'column1',
        columnType: FIELD_TYPE.STRING,
        isJoinColumn: false,
        isSelectedColumn: true,
        columnLength: 66535,
      });

      tableDef.columns.push({
        tableDefinition: tableDef,
        columnIndex: 1,
        columnName: 'column2',
        columnType: FIELD_TYPE.FLOAT,
        isJoinColumn: false,
        isSelectedColumn: true,
      });
      const tableQueryBuilder = new BasicHiveTableQueryPlanner(
        bucketName,
        fileStoregeType,
        compressionType
      );

      const tableQuery = tableQueryBuilder.defineQuery(
        fileName,
        tableName,
        tableDef
      );

      assert.isNotEmpty(tableQuery);

      assert.isTrue(REG_EX.test(tableQuery));
      REG_EX.lastIndex = 0;

      const extractions = REG_EX.exec(tableQuery) as any;

      const columnString = removeDoubleSpaces(
        (extractions[2] + extractions[3]).replace(/\n/g, ' ')
      );
      const splits = columnString.split(',').map(s => s.trim());
      tableDef.columns.forEach(c => {
        const columnString = splits.find(s =>
          s.startsWith(`${c.columnName}`)
        ) as string;
        assert.isOk(columnString);

        const splitColumn = columnString.split(' ');
        assert.strictEqual(splitColumn.length, 2);
        assert.strictEqual(
          splitColumn[1],
          c.columnType === FIELD_TYPE.STRING ? 'varchar(65535)' : 'double'
        );
      });
    });
    it('Will build a table with out a string length', () => {
      const fileName = 'testFile.parquet';
      const tableName = 'testTable';
      const bucketName = 'testbucket';

      const fileStoregeType = FILE_STORAGE_TYPES.PARQUET;
      const compressionType = COMPRESSION_TYPES.GZIP;

      const tableDef: fileProcessingInterfaces.IJoinTableDefinition = {
        tableName: tableName,
        backingFileName: `${tableName}.parquet`,
        tableAlias: 'A',
        tableIndex: 0,
        columns: [],
      };

      tableDef.columns.push({
        tableDefinition: tableDef,
        columnIndex: 0,
        columnName: 'column1',
        columnType: FIELD_TYPE.STRING,
        isJoinColumn: false,
        isSelectedColumn: true,
      });

      tableDef.columns.push({
        tableDefinition: tableDef,
        columnIndex: 1,
        columnName: 'column2',
        columnType: FIELD_TYPE.FLOAT,
        isJoinColumn: false,
        isSelectedColumn: true,
      });
      const tableQueryBuilder = new BasicHiveTableQueryPlanner(
        bucketName,
        fileStoregeType,
        compressionType
      );

      const tableQuery = tableQueryBuilder.defineQuery(
        fileName,
        tableName,
        tableDef
      );

      assert.isNotEmpty(tableQuery);

      assert.isTrue(REG_EX.test(tableQuery));
      REG_EX.lastIndex = 0;

      const extractions = REG_EX.exec(tableQuery) as any;

      const columnString = removeDoubleSpaces(
        (extractions[2] + extractions[3]).replace(/\n/g, ' ')
      );
      const splits = columnString.split(',').map(s => s.trim());
      tableDef.columns.forEach(c => {
        const columnString = splits.find(s =>
          s.startsWith(`${c.columnName}`)
        ) as string;
        assert.isOk(columnString);

        const splitColumn = columnString.split(' ');
        assert.strictEqual(splitColumn.length, 2);
        assert.strictEqual(
          splitColumn[1],
          c.columnType === FIELD_TYPE.STRING ? 'varchar(100)' : 'double'
        );
      });
    });
  });

  context('accessor tests', () => {
    it('should store the last query', () => {
      const fileName = 'testFile.parquet';
      const tableName = 'testTable';
      const bucketName = 'testbucket';

      const fileStoregeType = FILE_STORAGE_TYPES.PARQUET;
      const compressionType = COMPRESSION_TYPES.GZIP;

      const tableDef: fileProcessingInterfaces.IJoinTableDefinition = {
        tableName: tableName,
        backingFileName: `${tableName}.parquet`,
        tableAlias: 'A',
        tableIndex: 0,
        columns: [],
      };

      tableDef.columns.push({
        tableDefinition: tableDef,
        columnIndex: 0,
        columnName: 'column1',
        columnType: FIELD_TYPE.STRING,
        isJoinColumn: false,
        isSelectedColumn: true,
      });

      tableDef.columns.push({
        tableDefinition: tableDef,
        columnIndex: 1,
        columnName: 'column2',
        columnType: FIELD_TYPE.FLOAT,
        isJoinColumn: false,
        isSelectedColumn: true,
      });
      const tableQueryBuilder = new BasicHiveTableQueryPlanner(
        bucketName,
        fileStoregeType,
        compressionType
      );

      const tableQuery = tableQueryBuilder.defineQuery(
        fileName,
        tableName,
        tableDef
      );

      assert.strictEqual(tableQueryBuilder.query, tableQuery);
    });

    it('should store the bucket name', () => {
      const bucketName = 'testbucket';

      const fileStoregeType = FILE_STORAGE_TYPES.PARQUET;
      const compressionType = COMPRESSION_TYPES.GZIP;
      const tableQueryBuilder = new BasicHiveTableQueryPlanner(
        bucketName,
        fileStoregeType,
        compressionType
      );

      assert.strictEqual(tableQueryBuilder.bucketName, bucketName);
    });
    it('should store the compression type', () => {
      const bucketName = 'testbucket';

      const fileStoregeType = FILE_STORAGE_TYPES.PARQUET;
      const compressionType = COMPRESSION_TYPES.GZIP;
      const tableQueryBuilder = new BasicHiveTableQueryPlanner(
        bucketName,
        fileStoregeType,
        compressionType
      );

      assert.strictEqual(tableQueryBuilder.compressionType, compressionType);
    });
    it('should store the file storageFormat type', () => {
      const bucketName = 'testbucket';

      const fileStoregeType = FILE_STORAGE_TYPES.PARQUET;
      const compressionType = COMPRESSION_TYPES.GZIP;
      const tableQueryBuilder = new BasicHiveTableQueryPlanner(
        bucketName,
        fileStoregeType,
        compressionType
      );

      assert.strictEqual(tableQueryBuilder.storageFormat, fileStoregeType);
    });
  });
});

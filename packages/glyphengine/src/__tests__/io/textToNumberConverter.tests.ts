import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {TextColumnToNumberConverter} from '../../io/textToNumberConverter';
import athenaClient from '../../io/athenaClient';
import {error, aws} from '@glyphx/core';

class MockAthenaClient {
  private data: any;
  private throwError: boolean;
  constructor(data: any, throwError = false) {
    this.data = data;
    this.throwError = throwError;
  }

  public async runQuery(): Promise<any> {
    if (this.throwError) {
      throw this.data;
    }
    return this.data;
  }
}

const MOCK_DATA = [
  {colA: 'a'},
  {colA: 'b'},
  {colA: 'c'},
  {colA: 'd'},
  {colA: 'e'},
  {colA: 'f'},
  {colA: 'g'},
  {colA: 'h'},
  {colA: 'i'},
  {colA: 'j'},
];
describe('TextToNumberConverter', () => {
  context('constructor', () => {
    it('should create an instance', () => {
      const tableName = 'testTableName';
      const columnName = 'testColumnName';
      const converter = new TextColumnToNumberConverter(
        tableName,
        columnName
      ) as any;
      assert.strictEqual(converter.tableName, tableName);
      assert.strictEqual(converter.columnName, columnName);
    });
  });

  context('load', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('will load our data from athena', async () => {
      sandbox.replaceGetter(
        athenaClient,
        'connection',
        () => new MockAthenaClient(MOCK_DATA) as unknown as aws.AthenaManager
      );

      const tableName = 'testTableName';
      const columnName = 'colA';
      const converter = new TextColumnToNumberConverter(
        tableName,
        columnName
      ) as any;

      await converter.load();
      assert.strictEqual(converter.convertedFields.size, MOCK_DATA.length);
    });

    it('will pass through an error to the consumer', async () => {
      sandbox.replaceGetter(
        athenaClient,
        'connection',
        () =>
          new MockAthenaClient(MOCK_DATA, true) as unknown as aws.AthenaManager
      );

      const tableName = 'testTableName';
      const columnName = 'colA';
      const converter = new TextColumnToNumberConverter(
        tableName,
        columnName
      ) as any;
      let errored = false;
      try {
        await converter.load();
      } catch (e: any) {
        //symnatically, this does not make much sense, but we want to see that whatever is thrown by
        //athenaClient.connection.runQuery is passed through to the consumer
        assert.isArray(e);
        assert.strictEqual(e.length, MOCK_DATA.length);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
  context('convert', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    it('will convert our value to a number', async () => {
      sandbox.replaceGetter(
        athenaClient,
        'connection',
        () => new MockAthenaClient(MOCK_DATA) as unknown as aws.AthenaManager
      );

      const tableName = 'testTableName';
      const columnName = 'colA';
      const converter = new TextColumnToNumberConverter(
        tableName,
        columnName
      ) as any;

      await converter.load();
      const aIndex = MOCK_DATA.findIndex(
        (row: {colA: string}) => row.colA === 'a'
      );
      assert.strictEqual(converter.convert('a'), aIndex);

      const jIndex = MOCK_DATA.findIndex(
        (row: {colA: string}) => row.colA === 'j'
      );
      assert.strictEqual(converter.convert('j'), jIndex);
    });

    it('will throw a DataNotFoundError when the column value does not exist', async () => {
      sandbox.replaceGetter(
        athenaClient,
        'connection',
        () => new MockAthenaClient(MOCK_DATA) as unknown as aws.AthenaManager
      );

      const tableName = 'testTableName';
      const columnName = 'colA';
      const converter = new TextColumnToNumberConverter(
        tableName,
        columnName
      ) as any;

      await converter.load();
      let errored = false;
      try {
        converter.convert('z');
      } catch (e) {
        assert.instanceOf(e, error.DataNotFoundError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
  context('get size', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('will get the size of our converted data', async () => {
      sandbox.replaceGetter(
        athenaClient,
        'connection',
        () => new MockAthenaClient(MOCK_DATA) as unknown as aws.AthenaManager
      );

      const tableName = 'testTableName';
      const columnName = 'colA';
      const converter = new TextColumnToNumberConverter(
        tableName,
        columnName
      ) as any;

      await converter.load();

      assert.strictEqual(converter.size, MOCK_DATA.length);
    });
  });
});

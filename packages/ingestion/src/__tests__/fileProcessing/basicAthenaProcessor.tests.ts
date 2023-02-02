import {assert} from 'chai';
import {SinonSandbox, createSandbox} from 'sinon';
import {aws, error} from '@glyphx/core';
import {
  BasicAthenaProcessor,
  BasicTableSorter,
  BasicHiveTableQueryPlanner,
  BasicHiveViewQueryPlanner,
  BasicJoinProcessor,
} from '@fileProcessing';
import {IJoinTableDefinition} from '@interfaces/fileProcessing';
import {fileIngestion} from '@glyphx/types';

const MOCK_FILE_INFORMATION = [
  {
    tableName: 'testclientid_testmodelid_table1',
    fileName: '',
    parquetFileName: '',
    outputFileDirecotry: 'client/testclientid/testmodelid/data/table1/',
    numberOfRows: 100,
    numberOfColumns: 4,
    columns: [
      {
        name: 'col1',
        origionalName: 'col1',
        fieldType: 0,
      },
      {
        name: 'col2',
        origionalName: 'col2',
        fieldType: 1,
        longestString: 2,
      },
      {
        name: 'col3',
        origionalName: 'col3',
        fieldType: 1,
        longestString: 13,
      },
      {
        name: 'col4',
        origionalName: 'col4',
        fieldType: 0,
      },
    ],
    fileSize: 999999,
    fileOperationType: 2,
  },
  {
    tableName: 'testclientid_testmodelid_table2',
    fileName: '',
    parquetFileName: '',
    outputFileDirecotry: 'client/testclientid/testmodelid/data/table2/',
    numberOfRows: 100,
    numberOfColumns: 3,
    columns: [
      {
        name: 'col1',
        origionalName: 'col1',
        fieldType: 0,
      },
      {
        name: 'col2',
        origionalName: 'col2',
        fieldType: 1,
        longestString: 2,
      },
      {
        name: 'col5',
        origionalName: 'col5',
        fieldType: 1,
        longestString: 13,
      },
    ],
    fileSize: 999999,
    fileOperationType: 2,
  },
];

describe('fileProcessing/BasicAthenaProcessor', () => {
  context('init', () => {
    let sandbox: SinonSandbox;

    before(() => {
      sandbox = createSandbox();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('will initialize a BasicAthenaProcessor', async () => {
      const bucketName = 'someBucketName';
      const databaseName = 'someDatabaseName';

      sandbox.replace(
        aws.S3Manager.prototype,
        'init',
        sandbox.fake.resolves(undefined as void)
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(undefined as void)
      );

      const athenaProcessor = new BasicAthenaProcessor(
        bucketName,
        databaseName
      );

      let errored = false;
      try {
        await athenaProcessor.init();
      } catch (err) {
        errored = true;
      }

      assert.isFalse(errored);

      assert.isTrue(athenaProcessor['inited']);
    });

    it('will only initialize a BasicAthenaProcessor once', async () => {
      const bucketName = 'someBucketName';
      const databaseName = 'someDatabaseName';

      const s3InitFake = sandbox.fake.resolves(undefined as void);
      sandbox.replace(aws.S3Manager.prototype, 'init', s3InitFake);
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(undefined as void)
      );

      const athenaProcessor = new BasicAthenaProcessor(
        bucketName,
        databaseName
      );

      let errored = false;
      try {
        await athenaProcessor.init();
        await athenaProcessor.init();
      } catch (err) {
        errored = true;
      }

      assert.isFalse(errored);

      assert.isTrue(athenaProcessor['inited']);
      assert.strictEqual(s3InitFake.callCount, 1);
    });
    it('will throw an invalidArgumentError if S3Manager or AthenaManager throw an error', async () => {
      const bucketName = 'someBucketName';
      const databaseName = 'someDatabaseName';

      const errorString = 'An erorr has occurred';
      sandbox.replace(
        aws.S3Manager.prototype,
        'init',
        sandbox.fake.throws(errorString)
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        sandbox.fake.throws(errorString)
      );

      const athenaProcessor = new BasicAthenaProcessor(
        bucketName,
        databaseName
      );

      let errored = false;
      try {
        await athenaProcessor.init();
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }

      assert.isTrue(errored);

      assert.isFalse(athenaProcessor['inited']);
    });
  });
  context('processTables', () => {
    const sandbox = createSandbox();
    const bucketName = 'someBucketName';
    const databaseName = 'someDatabaseName';

    beforeEach(() => {
      sandbox.replace(
        aws.S3Manager.prototype,
        'init',
        sandbox.fake.resolves(undefined as void)
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'init',
        sandbox.fake.resolves(undefined as void)
      );

      sandbox.replace(
        BasicJoinProcessor.prototype,
        'processColumns',
        sandbox.fake.returns(undefined as void)
      );
      sandbox.replace(
        BasicHiveViewQueryPlanner.prototype,
        'defineView',
        sandbox.fake.returns('I AM A VIEW QUERY')
      );
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should process our tables', async () => {
      sandbox.replace(
        BasicTableSorter.prototype,
        'sortTables',
        sandbox.fake.returns(MOCK_FILE_INFORMATION)
      );
      sandbox.replaceGetter(
        BasicJoinProcessor.prototype,
        'joinData',
        sandbox.fake.returns([
          {join: 'information1'},
          {join: 'information2'},
        ] as unknown as IJoinTableDefinition[])
      );
      sandbox.replace(
        aws.S3Manager.prototype,
        'listObjects',
        sandbox.fake.resolves(['afileishere.parquet'])
      );
      sandbox.replace(
        BasicHiveTableQueryPlanner.prototype,
        'defineQuery',
        sandbox.fake.returns('I AM A Query')
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'runQuery',
        sandbox.fake.resolves([])
      );
      const athenaProcessor = new BasicAthenaProcessor(
        bucketName,
        databaseName
      );

      const result = await athenaProcessor.processTables(
        'A view',
        MOCK_FILE_INFORMATION
      );

      assert.isArray(result);
      assert.strictEqual(result.length, 2);
    });
    it('should not process our appended files tables', async () => {
      const copiedMock = JSON.parse(JSON.stringify(MOCK_FILE_INFORMATION));
      copiedMock[0].fileOperationType =
        fileIngestion.constants.FILE_OPERATION.APPEND;
      sandbox.replace(
        BasicTableSorter.prototype,
        'sortTables',
        sandbox.fake.returns(copiedMock)
      );
      sandbox.replaceGetter(
        BasicJoinProcessor.prototype,
        'joinData',
        sandbox.fake.returns([
          {join: 'information1'},
          {join: 'information2'},
        ] as unknown as IJoinTableDefinition[])
      );
      sandbox.replace(
        aws.S3Manager.prototype,
        'listObjects',
        sandbox.fake.resolves(['afileishere.parquet'])
      );
      const defineQueryFake = sandbox.fake.returns('I am a query');

      sandbox.replace(
        BasicHiveTableQueryPlanner.prototype,
        'defineQuery',
        defineQueryFake
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'runQuery',
        sandbox.fake.resolves([])
      );
      const athenaProcessor = new BasicAthenaProcessor(
        bucketName,
        databaseName
      );

      const result = await athenaProcessor.processTables(
        'A view',
        MOCK_FILE_INFORMATION
      );

      assert.isArray(result);
      assert.strictEqual(result.length, 2);
      assert.strictEqual(defineQueryFake.callCount, 1);
    });
    it('should return an empty array when our join processor returns empty', async () => {
      sandbox.replace(
        BasicTableSorter.prototype,
        'sortTables',
        sandbox.fake.returns(MOCK_FILE_INFORMATION)
      );
      sandbox.replaceGetter(
        BasicJoinProcessor.prototype,
        'joinData',
        sandbox.fake.returns([] as unknown as IJoinTableDefinition[])
      );
      sandbox.replace(
        aws.S3Manager.prototype,
        'listObjects',
        sandbox.fake.resolves(['afileishere.parquet'])
      );
      sandbox.replace(
        BasicHiveTableQueryPlanner.prototype,
        'defineQuery',
        sandbox.fake.returns('I AM A Query')
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'runQuery',
        sandbox.fake.resolves([])
      );
      const athenaProcessor = new BasicAthenaProcessor(
        bucketName,
        databaseName
      );

      const result = await athenaProcessor.processTables(
        'A view',
        MOCK_FILE_INFORMATION
      );

      assert.isArray(result);
      assert.strictEqual(result.length, 0);
    });
    it('should throw an error when the files do not exist', async () => {
      sandbox.replace(
        BasicTableSorter.prototype,
        'sortTables',
        sandbox.fake.returns(MOCK_FILE_INFORMATION)
      );
      sandbox.replaceGetter(
        BasicJoinProcessor.prototype,
        'joinData',
        sandbox.fake.returns([
          {join: 'information1'},
          {join: 'information2'},
        ] as unknown as IJoinTableDefinition[])
      );
      sandbox.replace(
        aws.S3Manager.prototype,
        'listObjects',
        sandbox.fake.resolves([])
      );
      sandbox.replace(
        BasicHiveTableQueryPlanner.prototype,
        'defineQuery',
        sandbox.fake.returns('I AM A Query')
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'runQuery',
        sandbox.fake.resolves([])
      );
      const athenaProcessor = new BasicAthenaProcessor(
        bucketName,
        databaseName
      );
      let errored = false;
      try {
        await athenaProcessor.processTables('A view', MOCK_FILE_INFORMATION);
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        errored = true;
      }
      assert.isTrue(errored);
    });
    it('should throw an error when an unexpected error is thrown', async () => {
      sandbox.replace(
        BasicTableSorter.prototype,
        'sortTables',
        sandbox.fake.returns(MOCK_FILE_INFORMATION)
      );
      sandbox.replaceGetter(
        BasicJoinProcessor.prototype,
        'joinData',
        sandbox.fake.returns([
          {join: 'information1'},
          {join: 'information2'},
        ] as unknown as IJoinTableDefinition[])
      );
      sandbox.replace(
        aws.S3Manager.prototype,
        'listObjects',
        sandbox.fake.resolves(['iamafile.parquet'])
      );
      sandbox.replace(
        BasicHiveTableQueryPlanner.prototype,
        'defineQuery',
        sandbox.fake.returns('I AM A Query')
      );
      sandbox.replace(
        aws.AthenaManager.prototype,
        'runQuery',
        sandbox.fake.rejects('oops I did it again')
      );

      const athenaProcessor = new BasicAthenaProcessor(
        bucketName,
        databaseName
      );
      let errored = false;
      try {
        await athenaProcessor.processTables('A view', MOCK_FILE_INFORMATION);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
});

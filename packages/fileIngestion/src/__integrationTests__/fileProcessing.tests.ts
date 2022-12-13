import {assert} from 'chai';
import * as fileProcessing from '@fileProcessing';
import * as fieldProcessing from '@fieldProcessing';
import * as aws from '@aws';
import {PassThrough} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import * as csv from 'csv';
import {IFileInformation} from '@interfaces/fileProcessing';
import {error} from '@glyphx/core';
import {FIELD_TYPE} from '@util/constants';

async function cleanupS3Files(
  fileNames: any,
  outputFolders: any,
  parquetFileNames: any,
  s3Bucket: aws.S3Manager
) {
  for (let i = 0; i < fileNames.length; i++) {
    const fileToDelete = outputFolders[i] + parquetFileNames[i];
    await s3Bucket.removeObject(fileToDelete);

    let errored = false;

    try {
      await s3Bucket.getFileInformation(fileToDelete);
    } catch (err) {
      assert.instanceOf(err, error.GlyphxError);
      errored = true;
    }

    assert.isTrue(errored);
  }
}

async function cleanupAthenaTablesAndView(
  tableNames: any,
  athenaManager: aws.AthenaManager,
  viewName: string
) {
  for (let i = 0; i < tableNames.length; i++) {
    await athenaManager.runQuery(`DROP TABLE IF EXISTS ${tableNames[i]}`);
  }

  await athenaManager.runQuery(`DROP VIEW IF EXISTS ${viewName}`);

  const tables = (await athenaManager.runQuery(
    'SHOW TABLES',
    10,
    true
  )) as unknown as any[];

  tableNames.forEach((t: string) => {
    assert.isNotOk(tables.find((tt: any) => tt.tab_name === t.toLowerCase()));
  });
  assert.isNotOk(tables.find((tt: any) => tt.tab_name === viewName));
}
describe('#fileProcessing', () => {
  context('Inbound s3 file to parquet to S3', () => {
    const fileNames = JSON.parse(process.env.FILE_NAMES as string);
    const outputFolders = JSON.parse(process.env.OUTPUT_FOLDER_NAMES as string);
    const parquetFileNames = JSON.parse(
      process.env.OUTPUT_FILE_NAMES as string
    );
    const tableNames = JSON.parse(process.env.TABLE_NAMES as string);

    const bucketName = process.env.S3_BUCKET_NAME as string;
    const databaseName = process.env.DATABASE_NAME as string;
    const viewName = process.env.VIEW_NAME as string;
    let s3Bucket: aws.S3Manager;
    let athenaManager: aws.AthenaManager;
    before(async () => {
      assert.isAtLeast(fileNames.length, 1);
      assert.strictEqual(outputFolders.length, fileNames.length);
      assert.strictEqual(parquetFileNames.length, fileNames.length);
      assert.strictEqual(tableNames.length, fileNames.length);

      assert.isNotEmpty(bucketName);
      assert.isNotEmpty(databaseName);
      assert.isNotEmpty(viewName);
      s3Bucket = new aws.S3Manager(bucketName);
      await s3Bucket.init();

      athenaManager = new aws.AthenaManager(databaseName);
      await athenaManager.init();

      await cleanupS3Files(
        fileNames,
        outputFolders,
        parquetFileNames,
        s3Bucket
      );

      await cleanupAthenaTablesAndView(tableNames, athenaManager, viewName);
    });

    after(async () => {
      await cleanupS3Files(
        fileNames,
        outputFolders,
        parquetFileNames,
        s3Bucket
      );
      await cleanupAthenaTablesAndView(tableNames, athenaManager, viewName);
    });
    it('Basic pipeline test', async () => {
      assert.isDefined(
        process.env.S3_BUCKET_NAME,
        'Configuration Error .env.integration does not appear to have been loaded'
      );

      const fileInformation: IFileInformation[] = [];

      for (let i = 0; i < fileNames.length; i++) {
        const fileName = fileNames[i];
        const outputFileName = parquetFileNames[i];
        const outputFolderName = outputFolders[i];
        const parquetFileName = `${outputFolderName}${outputFileName}`;
        const tableName = tableNames[i];

        //This will make sure that our input files are present.
        const fileInfo = await s3Bucket.getFileInformation(fileName);

        assert.isOk(fileInfo);
        const objectStream = await s3Bucket.getObjectStream(fileName);
        const csvStream = csv.parse({columns: true, delimiter: ','});
        const fileTransformer = new fileProcessing.BasicFileTransformer(
          fileName as string,
          fileInfo.fileSize,
          parquetFileName,
          outputFolderName,
          tableName,
          (fileInfo: IFileInformation) => {
            fileInformation.push(fileInfo);
          },
          () => {},
          fieldProcessing.BasicFieldTypeCalculator,
          fileProcessing.BasicColumnNameCleaner,
          10
        );
        const parquetWriter = new fileProcessing.BasicParquetProcessor(10);
        const passThrough = new PassThrough();
        const upload = s3Bucket.getUploadStream(parquetFileName, passThrough);

        pipeline(
          objectStream,
          csvStream,
          fileTransformer,
          parquetWriter,
          passThrough
        );
        await upload.done();
      }

      assert.isNotNull(fileInformation);
      console.log(fileInformation);

      const basicViewProcessor = new fileProcessing.BasicAthenaProcessor(
        bucketName,
        databaseName
      );

      await basicViewProcessor.init();
      const joinInformation = await basicViewProcessor.processTables(
        viewName,
        fileInformation
      );

      await validateTableResults(joinInformation, athenaManager);

      await validateViewResults(athenaManager, viewName, joinInformation);

      console.log(joinInformation);
      joinInformation[0].columns.forEach(c => {
        console.log(c);
      });
      console.log('I am done');
    });
  });
});

async function validateViewResults(
  athenaManager: aws.AthenaManager,
  viewName: string,
  joinInformation: import('/home/jpburford/projects/glyphx/serverless/packages/fileIngestion/src/interfaces/fileProcessing/iJoinTableDefinition').IJoinTableDefinition[]
) {
  const results = (await athenaManager.runQuery(
    `SELECT * FROM ${viewName} LIMIT 10`
  )) as unknown as any[];

  assert.strictEqual(results.length, 10);

  joinInformation.forEach(j => {
    j.columns.forEach(c => {
      if (c.isSelectedColumn) {
        let foundAtLeastOneNumber = false;
        results.forEach(r => {
          if (c.columnType === FIELD_TYPE.STRING) {
            assert.isDefined(r[c.columnName.toLowerCase()]);
          } else {
            if (r[c.columnName.toLowerCase()]) {
              assert.isNumber(r[c.columnName.toLowerCase()]);
              foundAtLeastOneNumber = true;
            }
          }
        });
        if (c.columnType === FIELD_TYPE.FLOAT)
          assert.isTrue(foundAtLeastOneNumber);
      }
    });
  });
}

async function validateTableResults(
  joinInformation: import('/home/jpburford/projects/glyphx/serverless/packages/fileIngestion/src/interfaces/fileProcessing/iJoinTableDefinition').IJoinTableDefinition[],
  athenaManager: aws.AthenaManager
) {
  for (let i = 0; i < joinInformation.length; i++) {
    const joinInfo = joinInformation[i];
    const results = (await athenaManager.runQuery(
      `SELECT * FROM ${joinInfo.tableName} LIMIT 10`,
      60
    )) as unknown as any[];

    assert.strictEqual(results.length, 10);
    results.forEach(r => {
      for (const key in r) {
        const colDefinition = joinInfo.columns.find(
          c => c.columnName.toLowerCase() === key
        );
        assert.isOk(colDefinition);
        if (colDefinition?.columnType === FIELD_TYPE.STRING) {
          assert.isString(r[key]);
        } else {
          if (r[key]) {
            assert.isNumber(r[key]);
          }
        }
      }
    });
  }
}

import {assert} from 'chai';
import { aws } from '@glyphx/core';
import {error, generalPurposeFunctions} from '@glyphx/core';
import {FIELD_TYPE} from '@util/constants';
import {fileIngestion} from '@glyphx/types';
import {createReadStream} from 'fs';
import {IJoinTableDefinition} from '@interfaces/fileProcessing';

export async function removeS3File(filePath: string, s3Bucket: aws.S3Manager) {
  await s3Bucket.removeObject(filePath);

  let errored = false;

  try {
    await s3Bucket.getFileInformation(filePath);
  } catch (err) {
    assert.instanceOf(err, error.GlyphxError);
    errored = true;
  }

  assert.isTrue(errored);
}

async function findAndRemoveDirectoryEntries(
  path: string,
  s3Bucket: aws.S3Manager
) {
  const files = await s3Bucket.listObjects(path);
  for (let i = 0; i < files.length; i++) {
    await removeS3File(files[i], s3Bucket);
  }
}

export async function cleanupS3Files(
  clientId: string,
  modelId: string,
  tableName: string,
  fileName: string,
  s3Bucket: aws.S3Manager
) {
  const path = `client/${clientId}/`;

  await findAndRemoveDirectoryEntries(path, s3Bucket);
}

export async function cleanupAthenaTable(
  clientId: string,
  modelId: string,
  tableName: string,
  athenaManager: aws.AthenaManager
) {
  const fullTableName = `${clientId}_${modelId}_${tableName}`;
  await athenaManager.runQuery(`DROP TABLE IF EXISTS ${fullTableName}`);

  const tables = (await athenaManager.runQuery(
    'SHOW TABLES',
    10,
    true
  )) as unknown as any[];

  assert.isNotOk(
    tables.find((tt: any) => tt.tab_name === fullTableName.toLowerCase())
  );
}
export async function cleanupAthenaView(
  clientId: string,
  modelId: string,
  athenaManager: aws.AthenaManager
) {
  const viewName = `${clientId}_${modelId}_view`;
  await athenaManager.runQuery(`DROP VIEW IF EXISTS ${viewName}`);

  const tables = (await athenaManager.runQuery(
    'SHOW TABLES',
    10,
    true
  )) as unknown as any[];

  assert.isNotOk(
    tables.find((tt: any) => tt.tab_name === viewName.toLowerCase())
  );
}

export async function cleanupAws(
  payload: fileIngestion.IPayload,
  clientId: string,
  modelId: string,
  s3Bucket: aws.S3Manager,
  athenaManager: aws.AthenaManager
) {
  for (let i = 0; i < payload.fileStats.length; i++) {
    const fileStats = payload.fileStats[i];

    await cleanupS3Files(
      clientId,
      modelId,
      fileStats.tableName ?? '',
      fileStats.fileName,
      s3Bucket
    );

    await cleanupAthenaTable(
      clientId,
      modelId,
      fileStats.tableName ?? '',
      athenaManager
    );
  }
  await cleanupAthenaView(clientId, modelId, athenaManager);
}
export function loadTableStreams(
  testDataDirectory: string,
  payload: fileIngestion.IPayload
) {
  const cleanDiretoryName =
    generalPurposeFunctions.string.checkAndAddTrailingSlash(testDataDirectory);
  for (let i = 0; i < payload.fileInfo.length; i++) {
    const fileInfo = payload.fileInfo[i];

    const fullFileName = `${cleanDiretoryName}${fileInfo.fileName}`;

    const readStream = createReadStream(fullFileName);
    fileInfo.fileStream = readStream;
  }
}

export async function validateViewResults(
  athenaManager: aws.AthenaManager,
  viewName: string,
  joinInformation: IJoinTableDefinition[]
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

export async function validateTableResults(
  joinInformation: IJoinTableDefinition[],
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

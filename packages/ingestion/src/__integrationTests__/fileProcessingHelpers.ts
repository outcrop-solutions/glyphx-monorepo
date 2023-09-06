import {assert} from 'chai';
import {aws, error, generalPurposeFunctions} from 'core';
import {createReadStream} from 'fs';
import {IJoinTableDefinition} from 'interfaces/fileProcessing';
import {fileIngestionTypes} from 'types';
import {GLYPHX_ID_COLUMN_NAME} from 'fileProcessing/basicFileTransformer';
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

async function findAndRemoveDirectoryEntries(path: string, s3Bucket: aws.S3Manager) {
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
  const fullTableName = generalPurposeFunctions.fileIngestion.getFullTableName(clientId, modelId, tableName);
  await athenaManager.dropTable(fullTableName);

  assert.isFalse(await athenaManager.tableExists(fullTableName));
}
export async function cleanupAthenaView(clientId: string, modelId: string, athenaManager: aws.AthenaManager) {
  const viewName = generalPurposeFunctions.fileIngestion.getViewName(clientId, modelId);
  await athenaManager.dropView(viewName);

  assert.isFalse(await athenaManager.viewExists(viewName));
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

    await cleanupS3Files(clientId, modelId, fileStats.tableName ?? '', fileStats.fileName, s3Bucket);

    await cleanupAthenaTable(clientId, modelId, fileStats.tableName ?? '', athenaManager);
  }
  await cleanupAthenaView(clientId, modelId, athenaManager);
}
export function loadTableStreams(testDataDirectory: string, payload: fileIngestion.IPayload) {
  const cleanDiretoryName = generalPurposeFunctions.string.checkAndAddTrailingSlash(testDataDirectory);
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
  const results = (await athenaManager.runQuery(`SELECT * FROM ${viewName} LIMIT 10`)) as unknown as any[];

  assert.strictEqual(results.length, 10);

  joinInformation.forEach((j) => {
    j.columns.forEach((c) => {
      if (c.isSelectedColumn) {
        let foundAtLeastOneNumber = false;
        results.forEach((r) => {
          if (c.columnType === fileIngestionTypes.constants.FIELD_TYPE.STRING) {
            const objectNames = Object.getOwnPropertyNames(r);
            const name = objectNames.find((o) => o === c.columnName.toLowerCase());
            assert.isOk(name);
          } else {
            if (r[c.columnName.toLowerCase()]) {
              assert.isNumber(r[c.columnName.toLowerCase()]);
              foundAtLeastOneNumber = true;
            }
          }
        });
        if (c.columnType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER) assert.isTrue(foundAtLeastOneNumber);
      }
    });
  });

  results.forEach((r) => {
    let foundGlypxIdColumn = false;
    for (const key in r) {
      if (key === GLYPHX_ID_COLUMN_NAME) {
        assert.isFalse(foundGlypxIdColumn);
        foundGlypxIdColumn = true;
      }
    }

    assert.isTrue(foundGlypxIdColumn);
  });
}

export async function validateTableResults(joinInformation: IJoinTableDefinition[], athenaManager: aws.AthenaManager) {
  for (let i = 0; i < joinInformation.length; i++) {
    let foundGlypxIdColumn = false;
    const joinInfo = joinInformation[i];
    const results = (await athenaManager.runQuery(
      `SELECT * FROM ${joinInfo.tableName} LIMIT 10`,
      60
    )) as unknown as any[];

    assert.strictEqual(results.length, 10);
    results.forEach((r) => {
      for (const key in r) {
        const colDefinition = joinInfo.columns.find((c) => c.columnName.toLowerCase() === key);
        if (key === GLYPHX_ID_COLUMN_NAME) foundGlypxIdColumn = true;
        assert.isOk(colDefinition);
        if (colDefinition?.columnType === fileIngestionTypes.constants.FIELD_TYPE.STRING) {
          assert.isString(r[key]);
        } else {
          if (r[key]) {
            assert.isNumber(r[key]);
          }
        }
      }
    });
    assert.isTrue(foundGlypxIdColumn);
  }
}

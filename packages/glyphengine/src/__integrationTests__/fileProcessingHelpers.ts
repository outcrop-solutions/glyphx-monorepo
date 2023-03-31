import {assert} from 'chai';
import {aws, error, generalPurposeFunctions} from '@glyphx/core';
import {createReadStream} from 'fs';
import {fileIngestion} from '@glyphx/types';
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
  const fullTableName = generalPurposeFunctions.fileIngestion.getFullTableName(
    clientId,
    modelId,
    tableName
  );
  await athenaManager.dropTable(fullTableName);

  assert.isFalse(await athenaManager.tableExists(fullTableName));
}
export async function cleanupAthenaView(
  clientId: string,
  modelId: string,
  athenaManager: aws.AthenaManager
) {
  const viewName = generalPurposeFunctions.fileIngestion.getViewName(
    clientId,
    modelId
  );
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

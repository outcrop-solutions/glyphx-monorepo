import * as database from '@glyphx/database';
import * as core from '@glyphx/core';
import * as S3 from '@aws-sdk/client-s3';

const SOURCE_S3_BUCKET_NAME = 'jps-test-bucket';
const TARGET_S3_BUCKET_NAME = 'glyphx-dev';

const SOURCE_ATHENA_DATABASE_NAME = 'jpstestdatabase';
const TARGET_ATHENA_DATABASE_NAME = 'glyphxdev';

async function run() {
  const connection = new database.MongoDbConnection();
  await connection.init();

  const sourceAthenaManager = new core.aws.AthenaManager(SOURCE_ATHENA_DATABASE_NAME);
  await sourceAthenaManager.init();

  const targetAthenaManager = new core.aws.AthenaManager(TARGET_ATHENA_DATABASE_NAME);
  await targetAthenaManager.init();

  const sourceS3Manager = new core.aws.S3Manager(SOURCE_S3_BUCKET_NAME);
  await sourceS3Manager.init();

  const s3_client = sourceS3Manager.bucket;

  const projectModel = connection.models.ProjectModel;
  let projects = await projectModel.queryProjects({
    deletedAt: null,
    'files.0': {$exists: true},
  });
  const numberOfItems = projects.numberOfItems;
  let pageNumber = 0;
  const numberOfPages = Math.trunc(numberOfItems / 10) + 1;
  while (pageNumber < numberOfPages) {
    pageNumber++;
    for (let i = 0; i < projects.results.length; i++) {
      let project = projects.results[i];
      if (!project?.workspace) continue;
      if (!(await sourceAthenaManager.viewExists(project.viewName ?? ''))) continue;
      for (let j = 0; j < project.files.length; j++) {
        let file = project.files[j];
        let tableName = core.generalPurposeFunctions.fileIngestion.getFullTableName(
          project?.workspace?._id?.toString() ?? '',
         project._id?.toString() ?? '',
         file.tableName
       );
       console.log(`Table name : ${tableName}`);
       if (!(await sourceAthenaManager.tableExists(tableName))) continue;

       const tableDefinition = await sourceAthenaManager.runQuery(`SHOW CREATE TABLE \`${tableName}\``, 60, true);

        if (!(await copyS3Files(sourceS3Manager, SOURCE_S3_BUCKET_NAME, TARGET_S3_BUCKET_NAME, tableDefinition)))
          continue;
        await copyAthenaTable(tableDefinition, TARGET_S3_BUCKET_NAME, targetAthenaManager);

        await copyAthenaView(project.viewName ?? '', sourceAthenaManager, targetAthenaManager);
      }
    }

    if (pageNumber < numberOfPages) {
      projects = await projectModel.queryProjects({deletedAt: null}, pageNumber);
    }
  }

  process.exit(0);
}
function getAthenaLocation(tableDefinition: Record<string, string>[]): [string, number] {
  let i = 0;
  let found = false;
  for (; i < tableDefinition.length; i++) {
    let property = tableDefinition[i];
    let value = property['createtab_stmt'];
    if (value.toLowerCase() === 'location') {
      found = true;
      break;
    }
  }
  if (found) {
    i++;
    let property = tableDefinition[i];
    let value = property['createtab_stmt'].trim().substring(1);
    return [value.substring(0, value.length - 1), i];
  } else {
    return ['', -1];
  }
}

function getS3DirectoryName(sourceBucket: string, tableDefinition: Record<string, string>[]): string {
  const prefix = `s3://${sourceBucket}/`;
  let [value] = getAthenaLocation(tableDefinition);
  if (value.startsWith(prefix)) {
    value = value.substring(prefix.length) + '/';
  } else {
    value = '';
  }
  return value;
}

function getS3InputDirectoryName(s3DataDirectoryName: string): string {
  const parts = s3DataDirectoryName.split('/');
  parts[3] = 'input';
  return parts.join('/');
}

async function copyS3Files(
  s3Manager: core.aws.S3Manager,
  sourceBucket: string,
  targetBucket: string,
  TableDefinition: Record<string, unknown>[]
): Promise<boolean> {
  let result = false;
  const dataDirectoryName = getS3DirectoryName(sourceBucket, TableDefinition as unknown as Record<string, string>[]);
  const inputDirectoryName = getS3InputDirectoryName(dataDirectoryName);

  if (await processFiles(dataDirectoryName, s3Manager, sourceBucket, targetBucket))
    if (await processFiles(inputDirectoryName, s3Manager, sourceBucket, targetBucket)) result = true;
  return result;
}

async function processFiles(
  directoryName: string,
  s3Manager: core.aws.S3Manager,
  sourceBucket: string,
  targetBucket: string
): Promise<boolean> {
  let result = true;
  const fileNames = await s3Manager.listObjects(directoryName);
  if (fileNames.length === 0) return false;

  const s3Client = s3Manager.bucket as S3.S3;
  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i];
    try {
      let res = await s3Client.copyObject({
        Bucket: targetBucket,
        CopySource: `${sourceBucket}/${fileName}`,
        Key: fileName,
     });
   } catch (err) {
     result = false;
     console.log(`Error copying file ${fileName} : ${err}`);
   }
   if (!result) break;
 }

  return result;
}

async function copyAthenaTable(
  tableDescription: Record<string, unknown>[],
  destination: string,
  targetAthenaManager: core.aws.AthenaManager
) {
  let description = tableDescription as unknown as Record<string, string>[];
  let [location, index] = getAthenaLocation(description);
  const parts = location.split('/');
  parts[2] = destination;
  let newLocation = parts.join('/') + '/';
  description[index]['createtab_stmt'] = `'${newLocation}'`;
  const query = description.map((d) => d['createtab_stmt']).join('\n');
  await targetAthenaManager.runQuery(query, 60, true);
}

async function copyAthenaView(
  viewName: string,
  sourceAthenaManager: core.aws.AthenaManager,
  targetAthenaManager: core.aws.AthenaManager
) {
  const query = `SHOW CREATE VIEW "${viewName}"`;
  const viewDefinition = await sourceAthenaManager.runQuery(query, 60, true);
  viewDefinition[0]['create view'] = `CREATE VIEW ${targetAthenaManager.databaseName}.${viewName} AS`;
  let createQuery = viewDefinition.map((d) => d['create view']).join('\n');
  await targetAthenaManager.runQuery(createQuery, 60, true);
}
run();

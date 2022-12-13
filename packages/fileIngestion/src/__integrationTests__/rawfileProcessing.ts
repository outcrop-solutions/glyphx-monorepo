require('module-alias/register');
import {assert} from 'chai';
import * as fileProcessing from '@fileProcessing';
import * as fieldProcessing from '@fieldProcessing';
import * as aws from '@aws';
import {PassThrough} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import * as csv from 'csv';

async function run() {
  assert.isDefined(
    process.env.S3_BUCKET_NAME,
    'Configuration Error .env.integration does not appear to have been loaded'
  );

  const s3Bucket = new aws.S3Manager(process.env.S3_BUCKET_NAME as string);
  await s3Bucket.init();
  const fileInfo = await s3Bucket.getFileInformation(
    process.env.FILE_NAME1 as string
  );

  assert.isOk(fileInfo);

  const objectStream = await s3Bucket.getObjectStream(
    process.env.FILE_NAME1 as string
  );

  const csvStream = csv.parse({columns: true, delimiter: ','});

  const fileTransformer = new fileProcessing.BasicFileTransformer(
    process.env.FILE_NAME1 as string,
    fileInfo.fileSize,
    (fileInfo: any) => {
      console.log(fileInfo);
    },
    () => {},
    fieldProcessing.BasicFieldTypeCalculator,
    fileProcessing.BasicColumnNameCleaner,
    10
  );

  const parquetWriter = new fileProcessing.BasicParquetProcessor(10);
  const passThrough = new PassThrough();
  // const pipeline = csvStream.pipe(csvStream).pipe(fileTransformer);
  const upload = s3Bucket.getUploadStream(
    `${process.env.OUTPUT_FOLDER_NAME}${process.env.OUTPUT_FILE_NAME1}`,
    passThrough
  );
  //  upload
  // new Writable({
  //   objectMode: true,
  //   write(chunk, encoding, callback) {
  //     console.log(chunk), callback();
  //   },
  // })

  pipeline(
    objectStream,
    csvStream,
    fileTransformer,
    parquetWriter,
    // new Writable({
    //   objectMode: true,
    //   write: (chunk, encoding, callback) => {
    //     console.log(chunk);
    //     callback();
    //   },
    // })
    //    gzip,
    passThrough
  );

  await upload.done();
}
run().then(() => {
  console.log('I am done');
});

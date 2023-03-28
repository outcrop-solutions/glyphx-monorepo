import type { NextApiRequest, NextApiResponse } from 'next';
// import { Session } from 'next-auth';
import { aws, generalPurposeFunctions } from '@glyphx/core';
import { FileIngestor } from '@glyphx/fileingestion';
import { S3_BUCKET_NAME, ATHENA_DB_NAME } from 'config/constants/getUrl';
import { processTrackingService } from '@glyphx/business';

/**
 * File Ingestion Key Notes
 *
 * File path format: `client/${clientId}/${modelId}/input/${tableName}/${fileName}`
 * where clientId => workspaceId
 * where modelId => projectId
 * where tableName => fileInfo
 *
 * OPERATIONS
 * DELETE operation  0
 * APPEND operation  1
 * ADD operation     2
 * REPLACE operation 3
 *
 * LIMITATIONS & ERRORS imposed by fileIngestor.reconcileFileInfo()
 *
 * 1. error: INVALID_TABLE_SET
 *    Each tableName/fileName must be unique per call to process() in fileInfo[]
 *    (you can't execute more than one operation on the same table/file within the
 *    same call to process.
 *
 * ADD
 *
 * 2. error: TABLE_ALREADY_EXISTS
 *    You can't call ADD on clientId/modelId/tableName that already exists, must
 *    delete before adding or call replace
 *
 * 3. error: INVALID_TABLE_SET
 *    You can't call ADD on clientId/modelId/tableName that is already flagged in
 *    the same fileInfo (seems like a duplicate of 1. above)
 *
 * APPEND
 *
 * 4. error: TABLE_DOES_NOT_EXIST
 *    You can't call APPEND on clientId/modelId/tableName that doesn't exist
 *
 * 5. error: FILE_ALREADY_EXISTS
 *    Can't overrite an existing file, you have to append a new fille to a
 */

/**
 * Add File
 *
 * @note Add a file to a table
 *
 * @route POST /api/files/ingest
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const addFile = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Extract payload
    const { payload } = req.body;

    // Add to S3
    const s3Manager = new aws.S3Manager(S3_BUCKET_NAME);
    if (!s3Manager.inited) {
      await s3Manager.init();
    }

    let newPayload = { ...payload };

    for (let i = 0; i < payload.fileInfo.length; i++) {
      // sharedFunctions.getTableCsvPath(payload.clientId, payload.modelId, payload.fileInfo[i].tableName)
      const stream = await s3Manager.getObjectStream(
        `${payload.clientId}/${payload.modelId}/input/${payload.fileInfo[i].tableName}/${payload.fileInfo[i].fileName}`
      );
      newPayload.fileInfo[i].fileStream = stream;
    }

    // Ingest file
    const PROCESS_ID = generalPurposeFunctions.processTracking.getProcessId();

    const PROCESS_NAME = 'testingProcessUnique';

    await processTrackingService.createProcessTracking(PROCESS_ID, PROCESS_NAME);

    const fileIngestor = new FileIngestor(newPayload, ATHENA_DB_NAME, PROCESS_ID);
    if (!fileIngestor.inited) {
      await fileIngestor.init();
    }
    const { fileInformation, fileProcessingErrors, joinInformation, viewName, status } = await fileIngestor.process();

    console.log({ fileInformation, joinInformation, viewName, status, processId: PROCESS_ID });
    // // Check for file processing errors
    // if (fileProcessingErrors.length > 0) {
    //   // console.log({ fileProcessingErrors });
    //   const e = new error.UnexpectedError('File processing error', fileProcessingErrors);
    //   e.publish('', constants.ERROR_SEVERITY.ERROR);
    //   throw e;
    // }
    // return file information & processID
    res.status(200).json({ data: { fileInformation, joinInformation, viewName, status, processId: PROCESS_ID } });
    // res.status(200).json({ ok: true });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

// import { PassThrough, Transform, Readable } from 'node:stream';
// import { error, constants } from '@glyphx/core';
// import { getTableCsvPath } from '@glyphx/fileingestion';

// class PropertyFilterTransform extends Transform {
//   property: string;
//   decoder: TextDecoder;
//   constructor(options, property) {
//     super(options);
//     this.property = property;
//     this.decoder = new TextDecoder('utf-8');
//   }

//   _transform(chunk, encoding, callback) {
//     const data = this.decoder.decode(chunk, { stream: true });
//     try {
//       const parsedData = JSON.parse(data);
//       if (parsedData.hasOwnProperty(this.property)) {
//         this.push(chunk);
//       }
//     } catch (error) {
//       console.error(`Error parsing JSON: ${error}`);
//     }
//     callback();
//   }
// }

// class SplitStream extends Transform {
//   maxBytes: number;
//   bytesRead: number;
//   currentStream: Readable;
//   fileIndex: number;
//   constructor(options) {
//     super(options);
//     this.maxBytes = options.maxBytes;
//     this.bytesRead = 0;
//     this.currentStream = new Readable();
//     this.currentStream._read = () => {};
//     this.fileIndex = 0;
//   }

//   _transform(chunk, encoding, callback) {
//     this.bytesRead += chunk.length;
//     this.currentStream.push(chunk);

//     if (this.bytesRead >= this.maxBytes) {
//       const oldStream = this.currentStream;
//       const newIndex = ++this.fileIndex;
//       this.currentStream = new Readable();
//       this.currentStream._read = () => {};
//       this.bytesRead = 0;
//       callback(null, { index: newIndex, stream: oldStream });
//     } else {
//       callback();
//     }
//   }

//   _flush(callback) {
//     if (this.currentStream.readableLength > 0) {
//       const oldStream = this.currentStream;
//       const newIndex = ++this.fileIndex;
//       this.currentStream = new Readable();
//       this.currentStream._read = () => {};
//       this.bytesRead = 0;
//       callback(null, { index: newIndex, stream: oldStream });
//     } else {
//       callback();
//     }
//   }
// }

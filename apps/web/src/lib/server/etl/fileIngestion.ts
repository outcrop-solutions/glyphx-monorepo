import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { aws, generalPurposeFunctions } from '@glyphx/core';
import { FileIngestor } from '@glyphx/fileingestion';
import { S3_BUCKET_NAME, ATHENA_DB_NAME } from 'config/constants';
import { formatUserAgent } from 'lib/utils/formatUserAgent';
import { database as databaseTypes } from '@glyphx/types';
import { processTrackingService, activityLogService, projectService } from '@glyphx/business';
import { BasicColumnNameCleaner } from '@glyphx/fileingestion';
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
 * Process Files
 *
 * @note Process a file set to a table
 *
 * @route POST /api/files/ingest
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const fileIngestion = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  try {
    // Extract payload
    const { payload } = req.body;

    const cleaner = new BasicColumnNameCleaner();

    // clean fileStats & fileInfo and table names
    const cleanPayload = {
      ...payload,
      fileStats: payload.fileStats.map((stat) => ({
        ...stat,
        fileName: `${cleaner.cleanColumnName(stat.fileName.split('.')[0])}.csv`,
        tableName: cleaner.cleanColumnName(stat.tableName),
      })),
      fileInfo: payload.fileInfo.map((info) => ({
        ...info,
        fileName: `${cleaner.cleanColumnName(info.fileName.split('.')[0])}.csv`,
        tableName: cleaner.cleanColumnName(info.tableName),
      })),
    };

    const newProject = projectService.updateProjectFileStats(payload.modelId, payload.fileStats);

    // Add to S3
    const s3Manager = new aws.S3Manager(S3_BUCKET_NAME);
    if (!s3Manager.inited) {
      await s3Manager.init();
    }

    let newPayload = { ...cleanPayload };

    for (let i = 0; i < newPayload.fileInfo.length; i++) {
      const stream = await s3Manager.getObjectStream(
        `client/${newPayload.clientId}/${newPayload.modelId}/input/${cleanPayload.fileInfo[i].tableName}/${cleanPayload.fileInfo[i].fileName}`
      );
      newPayload.fileInfo[i].fileStream = stream;
    }

    // Setup process tracking
    const PROCESS_ID = generalPurposeFunctions.processTracking.getProcessId();
    const PROCESS_NAME = 'testingProcessUnique';
    await processTrackingService.createProcessTracking(PROCESS_ID, PROCESS_NAME);

    // Create file ingestor
    const fileIngestor = new FileIngestor(newPayload, ATHENA_DB_NAME, PROCESS_ID);
    if (!fileIngestor.inited) {
      await fileIngestor.init();
    }
    const { fileInformation, fileProcessingErrors, joinInformation, viewName, status } = await fileIngestor.process();

    const { agentData, location } = formatUserAgent(req);

    await activityLogService.createLog({
      actorId: session?.user?.userId,
      resourceId: newPayload.modelId,
      workspaceId: newPayload.clientId,
      projectId: newPayload.modelId,
      location: location,
      userAgent: agentData,
      onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT,
      action: databaseTypes.constants.ACTION_TYPE.FILES_INGESTED,
    });

    // return file information & processID
    res.status(200).json({
      data: {
        fileInformation,
        fileProcessingErrors,
        joinInformation,
        viewName,
        status,
        processId: PROCESS_ID,
        project: newProject,
      },
    });
    // res.status(200).json({ ok: true });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
'use server';
import {error, constants} from 'core';
import {revalidatePath} from 'next/cache';
import {generalPurposeFunctions} from 'core';
import {FileIngestor, BasicColumnNameCleaner} from 'fileingestion';
import {processTrackingService, activityLogService, projectService} from '../../../business/src/services';
import {s3Connection, athenaConnection} from '../../../business/src/lib';
import {databaseTypes} from 'types';
import {getServerSession} from 'next-auth';
import {authOptions} from '../auth';

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
 * @param payload
 * @returns
 */
export const fileIngestion = async (payload) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const cleaner = new BasicColumnNameCleaner();
      // clean fileStats & fileInfo and table names
      const cleanPayload = {
        ...payload,
        //File stats are not used in the ingestion process.  It pulls them internally.
        fileStats: [],
        fileInfo: payload.fileInfo.map((info) => ({
          ...info,
          fileName: `${cleaner.cleanColumnName(info.fileName.split('.')[0])}.csv`,
          tableName: cleaner.cleanColumnName(info.tableName),
        })),
      };

      // Add to S3
      const s3Manager = s3Connection.s3Manager;
      const newPayload = {...cleanPayload};

      for (let i = 0; i < newPayload.fileInfo.length; i++) {
        const stream = await s3Manager.getObjectStream(
          `client/${newPayload.clientId}/${newPayload.modelId}/input/${cleanPayload.fileInfo[i].tableName}/${cleanPayload.fileInfo[i].fileName}`
        );
        newPayload.fileInfo[i].fileStream = stream;
      }

      // Setup process tracking
      const PROCESS_ID = generalPurposeFunctions.processTracking.getProcessId();
      const PROCESS_NAME = 'testingProcessUnique';
      const {id: processDocumentId} = await processTrackingService.createProcessTracking(PROCESS_ID, PROCESS_NAME);

      // Create file ingestor
      const fileIngestor = new FileIngestor(newPayload, s3Manager, athenaConnection.connection, PROCESS_ID);
      if (!fileIngestor.inited) {
        await fileIngestor.init();
      }
      const {fileInformation, fileProcessingErrors, joinInformation, viewName, status, info} =
        await fileIngestor.process();

      await activityLogService.createLog({
        actorId: session?.user?.id!,
        resourceId: newPayload.modelId,
        workspaceId: newPayload.clientId,
        projectId: newPayload.modelId,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT,
        action: databaseTypes.constants.ACTION_TYPE.FILES_INGESTED,
      });

      await activityLogService.createLog({
        actorId: session?.user?.id!,
        resourceId: processDocumentId?.toString() as string,
        workspaceId: newPayload.clientId,
        projectId: newPayload.modelId,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.PROCESS_TRACKING,
        action: databaseTypes.constants.ACTION_TYPE.PROCESS_TRACKING,
      });
      //get the updated project
      const project = await projectService.getProject(newPayload.modelId);
      revalidatePath('/project/[projectId]');
      return {
        fileInformation,
        joinInformation,
        viewName,
        status,
        processId: PROCESS_ID,
        project: project,
        info,
      };
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred ingesting the file', 'etl', payload, err);
    e.publish('etl', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

import {databaseTypes} from 'types';

import {error, constants} from 'core';
import mongoDbConnection from '../lib/databaseConnection';

const TIMEOUT = 900000; // 15 minutes

export class ProcessTrackingService {
  public static async createProcessTracking(
    processId: string,
    processName: string,
    processStatus: databaseTypes.constants.PROCESS_STATUS = databaseTypes.constants.PROCESS_STATUS.PENDING
  ): Promise<Pick<databaseTypes.IProcessTracking, 'id' | 'processId'>> {
    try {
      const processTrackingModel = mongoDbConnection.models.ProcessTrackingModel;
      const processTrackingDocument: databaseTypes.IProcessTracking = {
        processId: processId,
        processName: processName,
        processStatus: processStatus,
        processStartTime: new Date(),
        processMessages: [],
        processError: [],
      };
      const createdDocument = await processTrackingModel.createProcessTrackingDocument(processTrackingDocument);
      const retval = createdDocument.processId;
      return {processId: retval, id: createdDocument.id};
    } catch (err) {
      if (err instanceof error.DataValidationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          `An unexpected error occurred while creating a database entry for the processId: ${processId}, processName:  ${processName}  See the inner error for additional information`,
          'processTracking',
          'createProcessTracking',
          {
            processId: processId,
            processName: processName,
            processStatus: processStatus,
          },
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  private static async reconcileStatus(
    processTracking: databaseTypes.IProcessTracking
  ): Promise<databaseTypes.IProcessTracking> {
    if (
      processTracking.processStatus === databaseTypes.constants.PROCESS_STATUS.PENDING ||
      processTracking.processStatus === databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS
    ) {
      const now = new Date().getTime();
      const startDate = (processTracking.processHeartbeat ?? processTracking.processStartTime).getTime();

      //The process appears to be hung
      if (now - startDate > TIMEOUT) {
        ProcessTrackingService.completeProcess(
          processTracking.processId,
          {},
          databaseTypes.constants.PROCESS_STATUS.HUNG
        );
        ProcessTrackingService.addProcessMessage(
          processTracking.processId,
          'The process has timed out without updating the heart beat or completing'
        );
        return (await ProcessTrackingService.getProcessTracking(
          processTracking.processId
        )) as databaseTypes.IProcessTracking;
      } else {
        return processTracking;
      }
    } else {
      return processTracking;
    }
  }

  public static async getProcessStatus(
    processId: string
  ): Promise<Pick<
    databaseTypes.IProcessTracking,
    'processStatus' | 'processMessages' | 'processError' | 'processResult' | 'processHeartbeat'
  > | null> {
    try {
      const processTrackingModel = mongoDbConnection.models.ProcessTrackingModel;
      let processTrackingDocument: databaseTypes.IProcessTracking | null = null;

      processTrackingDocument = (await processTrackingModel.getProcessTrackingDocumentByProcessId(
        processId
      )) as databaseTypes.IProcessTracking;

      const updatedStatus = await ProcessTrackingService.reconcileStatus(processTrackingDocument);
      const processMessages = updatedStatus.processMessages.slice(0, 10);
      const processError = updatedStatus.processError.slice(0, 10);

      return {
        processStatus: updatedStatus.processStatus,
        processMessages: processMessages,
        processError: processError,
        processResult: updatedStatus.processResult,
        processHeartbeat: updatedStatus.processHeartbeat,
      };
    } catch (err) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          `An unexpected error occurred while getting the process status for processId: ${processId}  See the inner error for additional information`,
          'processTracking',
          'getProcessStatus',
          {
            processId: processId,
          },
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateProcessStatus(
    processId: string,
    processStatus: databaseTypes.constants.PROCESS_STATUS,
    message?: string
  ): Promise<void> {
    try {
      const processTrackingModel = mongoDbConnection.models.ProcessTrackingModel;

      let updatedProcessTrackingDocument: databaseTypes.IProcessTracking | null = null;

      const inputDocument: Partial<Omit<databaseTypes.IProcessTracking, '_id'>> = {
        processStatus: processStatus,
      };
      if (
        processStatus === databaseTypes.constants.PROCESS_STATUS.COMPLETED ||
        processStatus === databaseTypes.constants.PROCESS_STATUS.FAILED
      ) {
        inputDocument.processEndTime = new Date();
        inputDocument.processResult = {};
      }

      updatedProcessTrackingDocument = await processTrackingModel.updateProcessTrackingDocumentById(
        processId,
        inputDocument
      );

      if (message) {
        await processTrackingModel.addMessagesById(updatedProcessTrackingDocument.id!, [message]);
      }
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          `An unexpected error occurred while updating a database entry for the processId: ${processId}  See the inner error for additional information`,
          'processTracking',
          'updateProcessStatus',
          {
            processId: processId,
            processStatus: processStatus,
          },
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async completeProcess(
    processId: string,
    result: Record<string, unknown>,
    processStatus: databaseTypes.constants.PROCESS_STATUS = databaseTypes.constants.PROCESS_STATUS.COMPLETED
  ): Promise<void> {
    try {
      const processTrackingModel = mongoDbConnection.models.ProcessTrackingModel;
      const inputDocument: Partial<Omit<databaseTypes.IProcessTracking, '_id'>> = {
        processStatus: processStatus,
        processResult: result,
        processEndTime: new Date(),
      };

      await processTrackingModel.updateProcessTrackingDocumentById(processId, inputDocument);
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          `An unexpected error occurred while updating a database entry for the processId: ${processId} See the inner error for additional information`,
          'processTracking',
          'completeProcess',
          {
            processId: processId,
            processStatus: processStatus,
          },
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addProcessError(processId: string, inputError: error.GlyphxError): Promise<void> {
    try {
      const processTrackingModel = mongoDbConnection.models.ProcessTrackingModel;
      await processTrackingModel.addErrorsByProcessId(processId, [inputError as unknown as Record<string, unknown>]);
    } catch (err) {
      if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          `An unexpected error occurred while adding an error to the document with processId: ${processId}  See the inner error for additional information`,
          'processTracking',
          'addProcessError',
          {
            processId: processId,
          },
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addProcessMessage(processId: string, message: string): Promise<void> {
    try {
      const processTrackingModel = mongoDbConnection.models.ProcessTrackingModel;
      await processTrackingModel.addMessagesByProcessId(processId, [message]);
    } catch (err) {
      if (err instanceof error.DataNotFoundError || err instanceof error.InvalidArgumentError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          `An unexpected error occurred while adding a message to the document with processId: ${processId}  See the inner error for additional information`,
          'processTracking',
          'addProcessMessage',
          {
            processId: processId,
          },
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getProcessTracking(processId: string): Promise<databaseTypes.IProcessTracking | null> {
    try {
      const processTrackingModel = mongoDbConnection.models.ProcessTrackingModel;
      let processTrackingDocument: databaseTypes.IProcessTracking | null = null;

      processTrackingDocument = await processTrackingModel.getProcessTrackingDocumentByProcessId(processId);

      const updatedDocument = await ProcessTrackingService.reconcileStatus(processTrackingDocument!);

      return updatedDocument;
    } catch (err) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          `An unexpected error occurred while getting the processTrackingDocument with the processId: ${processId}, See the inner error for additional information`,
          'processTracking',
          'getProcessTracking',
          {
            processId: processId,
          },
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getProcessError(
    processId: string
  ): Promise<Pick<databaseTypes.IProcessTracking, 'processError'> | null> {
    const document = await ProcessTrackingService.getProcessTracking(processId);
    if (document) return {processError: document.processError};
    else return null;
  }

  public static async getProcessMessages(
    processId: string
  ): Promise<Pick<databaseTypes.IProcessTracking, 'processMessages'> | null> {
    const document = await ProcessTrackingService.getProcessTracking(processId);
    if (document) return {processMessages: document.processMessages};
    else return null;
  }

  public static async getProcessResult(
    processId: string
  ): Promise<Pick<databaseTypes.IProcessTracking, 'processResult'> | null> {
    const document = await ProcessTrackingService.getProcessTracking(processId);
    if (document) return {processResult: document.processResult};
    else return null;
  }

  public static async removeProcessTrackingDocument(processId: string) {
    try {
      await mongoDbConnection.models.ProcessTrackingModel.deleteProcessTrackingDocumentProcessId(processId);
    } catch (err) {
      if (err instanceof error.InvalidArgumentError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          `An unexpected error occurred while deleting  a database entry for the processId: ${processId}  See the inner error for additional information`,
          'processTracking',
          'removeProcessTrackingDocument',
          {
            processId: processId,
          },
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async setHeartbeat(processId: string) {
    try {
      const hearbeat = new Date();

      await mongoDbConnection.models.ProcessTrackingModel.updateProcessTrackingDocumentById(processId, {
        processHeartbeat: hearbeat,
      });
    } catch (err) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          `An unexpected error occurred while updating the heartbeat for the processId: ${processId}. See the inner error for additional information`,
          'processTracking',
          'setHeartbeat',
          {
            processId: processId,
          },
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}

import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from 'lib/databaseConnection';

export class ProcessTrackingService {
  public static async createProcessTracking(
    processId: string,
    processName: string,
    processStatus: databaseTypes.constants.PROCESS_STATUS = databaseTypes
      .constants.PROCESS_STATUS.PENDING
  ): Promise<Pick<databaseTypes.IProcessTracking, 'processId'>> {
    try {
      const processTrackingModel =
        mongoDbConnection.models.ProcessTrackingModel;
      const processTrackingDocument: databaseTypes.IProcessTracking = {
        processId: processId,
        processName: processName,
        processStatus: processStatus,
        processStartTime: new Date(),
        processMessages: [],
        processError: [],
      };
      const createdDocument =
        await processTrackingModel.createProcessTrackingDocument(
          processTrackingDocument
        );
      const retval = createdDocument.processId;
      return {processId: retval};
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

  public static async getProcessStatus(
    processId: string | mongooseTypes.ObjectId
  ): Promise<Pick<
    databaseTypes.IProcessTracking,
    'processStatus' | 'processMessages' | 'processError' | 'processResult'
  > | null> {
    try {
      const processTrackingModel =
        mongoDbConnection.models.ProcessTrackingModel;
      let processTrackingDocument: databaseTypes.IProcessTracking | null = null;
      if (processId instanceof mongooseTypes.ObjectId) {
        processTrackingDocument =
          (await processTrackingModel.getProcessTrackingDocumentById(
            processId
          )) as databaseTypes.IProcessTracking;
      } else {
        processTrackingDocument =
          (await processTrackingModel.getProcessTrackingDocumentByProcessId(
            processId
          )) as databaseTypes.IProcessTracking;
      }
      const processMessages = processTrackingDocument.processMessages.slice(
        0,
        10
      );
      const processError = processTrackingDocument.processError.slice(0, 10);

      return {
        processStatus: processTrackingDocument?.processStatus,
        processMessages: processMessages,
        processError: processError,
        processResult: processTrackingDocument?.processResult,
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
    processId: string | mongooseTypes.ObjectId,
    processStatus: databaseTypes.constants.PROCESS_STATUS,
    message?: string
  ): Promise<void> {
    try {
      const processTrackingModel =
        mongoDbConnection.models.ProcessTrackingModel;

      let updatedProcessTrackingDocument: databaseTypes.IProcessTracking | null =
        null;

      const inputDocument: Partial<
        Omit<databaseTypes.IProcessTracking, '_id'>
      > = {
        processStatus: processStatus,
      };
      if (
        processStatus === databaseTypes.constants.PROCESS_STATUS.COMPLETED ||
        processStatus === databaseTypes.constants.PROCESS_STATUS.FAILED
      ) {
        inputDocument.processEndTime = new Date();
        inputDocument.processResult = {};
      }
      if (processId instanceof mongooseTypes.ObjectId) {
        updatedProcessTrackingDocument =
          await processTrackingModel.updateProcessTrackingDocumentById(
            processId,
            inputDocument
          );
      } else {
        updatedProcessTrackingDocument =
          await processTrackingModel.updateProcessTrackingDocumentByProcessId(
            processId,
            inputDocument
          );
      }
      if (message) {
        await processTrackingModel.addMessagesById(
          updatedProcessTrackingDocument._id as mongooseTypes.ObjectId,
          [message]
        );
      }
    } catch (err) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    processId: string | mongooseTypes.ObjectId,
    result: Record<string, unknown>,
    processStatus: databaseTypes.constants.PROCESS_STATUS = databaseTypes
      .constants.PROCESS_STATUS.COMPLETED
  ): Promise<void> {
    try {
      const processTrackingModel =
        mongoDbConnection.models.ProcessTrackingModel;
      const inputDocument: Partial<
        Omit<databaseTypes.IProcessTracking, '_id'>
      > = {
        processStatus: processStatus,
        processResult: result,
        processEndTime: new Date(),
      };
      if (processId instanceof mongooseTypes.ObjectId) {
        await processTrackingModel.updateProcessTrackingDocumentById(
          processId,
          inputDocument
        );
      } else {
        await processTrackingModel.updateProcessTrackingDocumentByProcessId(
          processId,
          inputDocument
        );
      }
    } catch (err) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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

  public static async addProcessError(
    processId: string | mongooseTypes.ObjectId,
    inputError: error.GlyphxError
  ): Promise<void> {
    try {
      const processTrackingModel =
        mongoDbConnection.models.ProcessTrackingModel;
      if (processId instanceof mongooseTypes.ObjectId) {
        await processTrackingModel.addErrorsById(processId, [
          inputError as unknown as Record<string, unknown>,
        ]);
      } else {
        await processTrackingModel.addErrorsByProcessId(processId, [
          inputError as unknown as Record<string, unknown>,
        ]);
      }
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError
      ) {
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

  public static async addProcessMessage(
    processId: string | mongooseTypes.ObjectId,
    message: string
  ): Promise<void> {
    try {
      const processTrackingModel =
        mongoDbConnection.models.ProcessTrackingModel;
      if (processId instanceof mongooseTypes.ObjectId) {
        await processTrackingModel.addMessagesById(processId, [message]);
      } else {
        await processTrackingModel.addMessagesByProcessId(processId, [message]);
      }
    } catch (err) {
      if (
        err instanceof error.DataNotFoundError ||
        err instanceof error.InvalidArgumentError
      ) {
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

  public static async getProcessTracking(
    processId: string | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProcessTracking | null> {
    try {
      const processTrackingModel =
        mongoDbConnection.models.ProcessTrackingModel;
      if (processId instanceof mongooseTypes.ObjectId) {
        const processTrackingDocument =
          await processTrackingModel.getProcessTrackingDocumentById(processId);
        return processTrackingDocument;
      } else {
        const processTrackingDocument =
          await processTrackingModel.getProcessTrackingDocumentByProcessId(
            processId
          );
        return processTrackingDocument;
      }
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
    processId: string | mongooseTypes.ObjectId
  ): Promise<Pick<databaseTypes.IProcessTracking, 'processError'> | null> {
    const document = await ProcessTrackingService.getProcessTracking(processId);
    if (document) return {processError: document.processError};
    else return null;
  }

  public static async getProcessMessages(
    processId: string | mongooseTypes.ObjectId
  ): Promise<Pick<databaseTypes.IProcessTracking, 'processMessages'> | null> {
    const document = await ProcessTrackingService.getProcessTracking(processId);
    if (document) return {processMessages: document.processMessages};
    else return null;
  }

  public static async getProcessResult(
    processId: string | mongooseTypes.ObjectId
  ): Promise<Pick<databaseTypes.IProcessTracking, 'processResult'> | null> {
    const document = await ProcessTrackingService.getProcessTracking(processId);
    if (document) return {processResult: document.processResult};
    else return null;
  }

  public static async removeProcessTrackingDocument(
    processId: string | mongooseTypes.ObjectId
  ) {
    try {
      if (processId instanceof mongooseTypes.ObjectId) {
        await mongoDbConnection.models.ProcessTrackingModel.deleteProcessTrackingDocumentById(
          processId
        );
      } else {
        await mongoDbConnection.models.ProcessTrackingModel.deleteProcessTrackingDocumentProcessId(
          processId
        );
      }
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
}

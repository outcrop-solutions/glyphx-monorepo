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
    throw 'Not implemented';
  }

  public static async getProcessStatus(
    processId: string | mongooseTypes.ObjectId
  ): Promise<
    Pick<
      databaseTypes.IProcessTracking,
      'processStatus' | 'processMessages' | 'processError' | 'processResult'
    >
  > {
    throw 'Not implemented';
  }

  public static async updateProcessStatus(
    processId: string | mongooseTypes.ObjectId,
    processStatus: databaseTypes.constants.PROCESS_STATUS,
    message?: string
  ): Promise<void> {
    throw 'Not implemented';
  }

  public static async completeProcess(
    processId: string | mongooseTypes.ObjectId,
    result: Record<string, unknown>,
    processStatus: databaseTypes.constants.PROCESS_STATUS = databaseTypes
      .constants.PROCESS_STATUS.COMPLETED
  ) {
    throw 'Not implemented';
  }

  public static async addProcessError(
    processId: string | mongooseTypes.ObjectId,
    error: error.GlyphxError
  ): Promise<void> {
    throw 'Not implemented';
  }

  public static async addProcessMesage(
    processId: string | mongooseTypes.ObjectId,
    message: string
  ): Promise<void> {
    throw 'Not implemented';
  }

  public static getProcessTracking(
    processId: string | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IProcessTracking> {
    throw 'Not implemented';
  }

  public static getProcessError(
    processId: string | mongooseTypes.ObjectId
  ): Promise<Pick<databaseTypes.IProcessTracking, 'processError'>> {
    throw 'Not implemented';
  }

  public static getProcessMessages(
    processId: string | mongooseTypes.ObjectId
  ): Promise<Pick<databaseTypes.IProcessTracking, 'processMessages'>> {
    throw 'Not implemented';
  }

  public static getProcessResult(
    processId: string | mongooseTypes.ObjectId
  ): Promise<Pick<databaseTypes.IProcessTracking, 'processResult'>> {
    throw 'Not implemented';
  }
}

import {
  database as databaseTypes,
  fileIngestion as fileIngestionTypes,
} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from '../lib/server/databaseConnection';

export async function getProject(
  id: mongooseTypes.ObjectId
): Promise<databaseTypes.IProject | null> {
  try {
    const project = await mongoDbConnection.models.ProjectModel.getProjectById(
      id
    );
    return project;
  } catch (err) {
    if (err instanceof error.DataNotFoundError) {
      err.publish('', constants.ERROR_SEVERITY.WARNING);
      return null;
    } else {
      const e = new error.DataServiceError(
        'An unexpected error occurred while getting the project. See the inner error for additional details',
        'project',
        'getProject',
        {id: id},
        err
      );
      e.publish('', constants.ERROR_SEVERITY.ERROR);
      throw e;
    }
  }
}

export async function getProjectFileStats(
  id: mongooseTypes.ObjectId
): Promise<fileIngestionTypes.IFileStats[]> {
  const project = await getProject(id);
  return project?.files ?? [];
}

export async function updateProjectFileStats(
  id: mongooseTypes.ObjectId,
  fileStats: fileIngestionTypes.IFileStats[]
): Promise<databaseTypes.IProject> {
  try {
    const updatedProject =
      await mongoDbConnection.models.ProjectModel.updateProjectById(id, {
        files: fileStats,
      });

    return updatedProject;
  } catch (err) {
    if (
      err instanceof error.InvalidArgumentError ||
      err instanceof error.InvalidOperationError
    ) {
      err.publish('', constants.ERROR_SEVERITY.WARNING);
      throw err;
    } else {
      const e = new error.DataServiceError(
        "An unexpected error occurred while updating the project's fileStats. See the inner error for additional details",
        'project',
        'updateProjectFileStats',
        {id: id},
        err
      );
      e.publish('', constants.ERROR_SEVERITY.ERROR);
      throw e;
    }
  }
}

import {
  database as databaseTypes,
  fileIngestion as fileIngestionTypes,
} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from 'lib/databaseConnection';

export class ProjectService {
  public static async getProject(
    projectId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IProject | null> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);
      const project =
        await mongoDbConnection.models.ProjectModel.getProjectById(id);
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
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getProjectFileStats(
    id: mongooseTypes.ObjectId | string
  ): Promise<fileIngestionTypes.IFileStats[]> {
    const project = await ProjectService.getProject(id);
    return project?.files ?? [];
  }

  public static async getProjectViewName(
    id: mongooseTypes.ObjectId | string
  ): Promise<string> {
    const project = await ProjectService.getProject(id);
    return project?.viewName ?? '';
  }
  public static async updateProjectFileStats(
    projectId: mongooseTypes.ObjectId | string,
    fileStats: fileIngestionTypes.IFileStats[]
  ): Promise<databaseTypes.IProject> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);
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
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
  public static async updateProjectView(
    projectId: mongooseTypes.ObjectId | string,
    viewName: string
  ): Promise<databaseTypes.IProject> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);
      const updatedProject =
        await mongoDbConnection.models.ProjectModel.updateProjectById(id, {
          viewName: viewName,
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
          "An unexpected error occurred while updating the project's view. See the inner error for additional details",
          'project',
          'updateProjectView',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
  public static async updateProject(
    projectId: mongooseTypes.ObjectId | string,
    update: Omit<
      Partial<databaseTypes.IProject>,
      '_id' | 'createdAt' | 'updatedAt'
    >
  ): Promise<databaseTypes.IProject> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);
      const updatedProject =
        await mongoDbConnection.models.ProjectModel.updateProjectById(
          id,
          update
        );

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
          "An unexpected error occurred while updating the project's view. See the inner error for additional details",
          'project',
          'updateProjectView',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}

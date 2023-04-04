import {
  database as databaseTypes,
  fileIngestion as fileIngestionTypes,
  web as webTypes,
} from '@glyphx/types';
import {error, constants} from '@glyphx/core';
import {Types as mongooseTypes} from 'mongoose';
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
    } catch (err: any) {
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

  public static async getProjects(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IProject[] | null> {
    try {
      const projects =
        await mongoDbConnection.models.ProjectModel.queryProjects(filter);
      return projects?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting projects. See the inner error for additional details',
          'project',
          'getProjects',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createProject(
    name: string,
    ownerId: mongooseTypes.ObjectId | string,
    workspaceId: mongooseTypes.ObjectId | string,
    type?: mongooseTypes.ObjectId | string,
    description?: string
  ): Promise<databaseTypes.IProject> {
    try {
      const ownerCastId =
        ownerId instanceof mongooseTypes.ObjectId
          ? ownerId
          : new mongooseTypes.ObjectId(ownerId);

      const workspaceCastId =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);

      const projectTypeCastId =
        type instanceof mongooseTypes.ObjectId
          ? type
          : new mongooseTypes.ObjectId(type);

      const defaultType = {
        name: `${name}-type`,
        projects: [],
        shape: {},
      };

      // TODO: requires getProjectType service
      const input = {
        name,
        description: description ?? '',
        workspace: workspaceCastId,
        owner: ownerCastId,
        isTemplate: false,
        type: projectTypeCastId ?? defaultType,
        files: [],
        state: {
          properties: {
            X: {
              axis: webTypes.constants.AXIS.X,
              accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
              key: 'Column X', // corresponds to column name
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
              interpolation: webTypes.constants.INTERPOLATION_TYPE.NUMERIC,
              direction: webTypes.constants.DIRECTION_TYPE.ASC,
              filter: {
                min: 0,
                max: 0,
              },
            },
            Y: {
              axis: webTypes.constants.AXIS.X,
              accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
              key: 'Column Y', // corresponds to column name
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
              interpolation: webTypes.constants.INTERPOLATION_TYPE.NUMERIC,
              direction: webTypes.constants.DIRECTION_TYPE.ASC,
              filter: {
                min: 0,
                max: 0,
              },
            },
            Z: {
              axis: webTypes.constants.AXIS.X,
              accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
              key: 'Column Z', // corresponds to column name
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
              interpolation: webTypes.constants.INTERPOLATION_TYPE.NUMERIC,
              direction: webTypes.constants.DIRECTION_TYPE.ASC,
              filter: {
                min: 0,
                max: 0,
              },
            },
            A: {
              axis: webTypes.constants.AXIS.X,
              accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
              key: 'Column 1', // corresponds to column name
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
              interpolation: webTypes.constants.INTERPOLATION_TYPE.NUMERIC,
              direction: webTypes.constants.DIRECTION_TYPE.ASC,
              filter: {
                min: 0,
                max: 0,
              },
            },
            B: {
              axis: webTypes.constants.AXIS.X,
              accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
              key: 'Column 2', // corresponds to column name
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
              interpolation: webTypes.constants.INTERPOLATION_TYPE.NUMERIC,
              direction: webTypes.constants.DIRECTION_TYPE.ASC,
              filter: {
                min: 0,
                max: 0,
              },
            },
            C: {
              axis: webTypes.constants.AXIS.X,
              accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
              key: 'Column 3', // corresponds to column name
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
              interpolation: webTypes.constants.INTERPOLATION_TYPE.NUMERIC,
              direction: webTypes.constants.DIRECTION_TYPE.ASC,
              filter: {
                min: 0,
                max: 0,
              },
            },
          },
        },
      };

      // create project
      const project = await mongoDbConnection.models.ProjectModel.createProject(
        input
      );

      // connect project to user
      await mongoDbConnection.models.UserModel.updateUserById(ownerCastId, {
        projects: [project] as unknown as databaseTypes.IProject[],
      });

      // connect project to workspace
      await mongoDbConnection.models.WorkspaceModel.updateWorkspaceById(
        workspaceCastId,
        {
          projects: [project] as unknown as databaseTypes.IProject[],
        }
      );

      return project;
    } catch (err: any) {
      if (
        err instanceof error.InvalidOperationError ||
        err instanceof error.InvalidArgumentError ||
        err instanceof error.DataValidationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while creating the project. See the inner error for additional details',
          'project',
          'createProject',
          {name, ownerId, workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateProjectState(
    projectId: mongooseTypes.ObjectId | string,
    state: Omit<
      databaseTypes.IState,
      | 'project'
      | '_id'
      | 'createdAt'
      | 'updatedAt'
      | 'description'
      | 'fileSystem'
      | 'version'
      | 'static'
      | 'camera'
      | 'createdBy'
    >
  ): Promise<databaseTypes.IProject> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);
      const project =
        await mongoDbConnection.models.ProjectModel.updateProjectById(id, {
          state: state,
        });
      return project;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateUser',
          {projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deactivate(
    projectId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IProject> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);
      const project =
        await mongoDbConnection.models.ProjectModel.updateProjectById(id, {
          deletedAt: new Date(),
        });
      return project;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateUser',
          {projectId},
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
    } catch (err: any) {
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
    } catch (err: any) {
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
    } catch (err: any) {
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

import {
  database as databaseTypes,
  fileIngestion as fileIngestionTypes,
  web as webTypes,
} from '@glyphx/types';
import {error, constants} from '@glyphx/core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from '../lib/databaseConnection';

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
    workspaceId: mongooseTypes.ObjectId | string,
    userId: mongooseTypes.ObjectId | string,
    email: string,
    template?: databaseTypes.IProjectTemplate,
    description?: string
  ): Promise<databaseTypes.IProject> {
    try {
      const workspaceCastId =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);

      let projectTemplateCastId;

      if (template) {
        projectTemplateCastId =
          template?._id instanceof mongooseTypes.ObjectId
            ? template._id
            : new mongooseTypes.ObjectId(template._id);
      }

      const creatorCastId =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);

      // TODO: requires getProjectTemplate service
      const input = {
        name,
        description: description ?? '',
        workspace: workspaceCastId,
        template: projectTemplateCastId,
        files: [],
        members: [],
        stateHistory: [],
        tags: [],
        state: {
          properties: template?.shape || {
            X: {
              axis: webTypes.constants.AXIS.X,
              accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
              key: 'Column X', // corresponds to column name
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
              interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
              direction: webTypes.constants.DIRECTION_TYPE.ASC,
              filter: {
                min: 0,
                max: 0,
              },
            },
            Y: {
              axis: webTypes.constants.AXIS.Y,
              accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
              key: 'Column Y', // corresponds to column name
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
              interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
              direction: webTypes.constants.DIRECTION_TYPE.ASC,
              filter: {
                min: 0,
                max: 0,
              },
            },
            Z: {
              axis: webTypes.constants.AXIS.Z,
              accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
              key: 'Column Z', // corresponds to column name
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
              interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
              direction: webTypes.constants.DIRECTION_TYPE.ASC,
              filter: {
                min: 0,
                max: 0,
              },
            },
            A: {
              axis: webTypes.constants.AXIS.A,
              accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
              key: 'Column 1', // corresponds to column name
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
              interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
              direction: webTypes.constants.DIRECTION_TYPE.ASC,
              filter: {
                min: 0,
                max: 0,
              },
            },
            B: {
              axis: webTypes.constants.AXIS.B,
              accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
              key: 'Column 2', // corresponds to column name
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
              interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
              direction: webTypes.constants.DIRECTION_TYPE.ASC,
              filter: {
                min: 0,
                max: 0,
              },
            },
            C: {
              axis: webTypes.constants.AXIS.C,
              accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
              key: 'Column 3', // corresponds to column name
              dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER, // corresponds to column data type
              interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
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

      const memberInput = {
        type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
        inviter: email,
        email: email,
        invitedAt: new Date(),
        joinedAt: new Date(),
        status: databaseTypes.constants.INVITATION_STATUS.ACCEPTED,
        projectRole: databaseTypes.constants.PROJECT_ROLE.OWNER,
        member: {_id: creatorCastId} as unknown as databaseTypes.IUser,
        invitedBy: {_id: creatorCastId} as unknown as databaseTypes.IUser,
        project: project as unknown as databaseTypes.IProject,
        workspace: {
          _id: workspaceCastId,
        } as unknown as databaseTypes.IWorkspace,
      } as unknown as databaseTypes.IMember;

      // create default project membership
      const member =
        await mongoDbConnection.models.MemberModel.createProjectMember(
          memberInput
        );

      // add member to project
      await mongoDbConnection.models.ProjectModel.addMembers(
        project?._id as unknown as mongooseTypes.ObjectId,
        [member]
      );

      // add member to user
      await mongoDbConnection.models.UserModel.addMembership(
        creatorCastId as unknown as mongooseTypes.ObjectId,
        [member]
      );

      // connect project to workspace
      await mongoDbConnection.models.WorkspaceModel.addProjects(
        workspaceCastId,
        [project]
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
          {name, workspaceId},
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
      | 'fileSystemHash'
      | 'payloadHash'
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

  public static async addStates(
    projectId: mongooseTypes.ObjectId | string,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);
      const updatedProject =
        await mongoDbConnection.models.ProjectModel.addStates(id, states);

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
          'An unexpected error occurred while adding states to the project. See the inner error for additional details',
          'project',
          'addStates',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addTags(
    projectId: mongooseTypes.ObjectId | string,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);
      const updatedProject =
        await mongoDbConnection.models.ProjectModel.addTags(id, tags);

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
          'An unexpected error occurred while adding tags to the project. See the inner error for additional details',
          'project',
          'addTags',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
  public static async removeTags(
    projectId: mongooseTypes.ObjectId | string,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);
      const updatedProject =
        await mongoDbConnection.models.ProjectModel.removeTags(id, tags);

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
          'An unexpected error occurred while removing tags from the project. See the inner error for additional details',
          'project',
          'removeTags',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}

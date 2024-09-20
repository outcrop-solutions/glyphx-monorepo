import {databaseTypes, fileIngestionTypes, webTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from '../lib/databaseConnection';

export class ProjectService {
  public static async getProject(projectId: string): Promise<databaseTypes.IProject | null> {
    try {
      const project = await mongoDbConnection.models.ProjectModel.getProjectById(projectId);
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

  public static async getProjects(filter?: Record<string, unknown>): Promise<databaseTypes.IProject[] | null> {
    let page = filter?.page as number;
    if (page != undefined) {
      delete filter?.page;
    }
    let pageSize = filter?.pageSize as number;
    if (pageSize != undefined) {
      delete filter?.pageSize;
    }
    try {
      //HACK: I do not want to risk messing up something upstream, so I am going to make it so I can pass the page and pagesize as part of the filter for my glyphEngine testing script.
      const projects = await mongoDbConnection.models.ProjectModel.queryProjects(filter, page, pageSize);
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
    workspaceId: string,
    userId: string,
    email: string,
    template?: databaseTypes.IProjectTemplate,
    description?: string,
    docId?: string
  ): Promise<databaseTypes.IProject> {
    try {
      let templateId;
      if (template) {
        templateId = typeof template === 'string' ? template : template.id;
      }

      // TODO: requires getProjectTemplate service
      const input = {
        name,
        description: description ?? '',
        workspace: workspaceId,
        template: templateId,
        files: [],
        members: [],
        stateHistory: [],
        tags: [],
        docId: docId,
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
      const project = await mongoDbConnection.models.ProjectModel.createProject(input);

      const memberInput = {
        type: databaseTypes.constants.MEMBERSHIP_TYPE.PROJECT,
        inviter: email,
        email: email,
        invitedAt: new Date(),
        joinedAt: new Date(),
        status: databaseTypes.constants.INVITATION_STATUS.ACCEPTED,
        projectRole: databaseTypes.constants.PROJECT_ROLE.OWNER,
        member: userId,
        invitedBy: userId,
        project: project,
        workspace: workspaceId,
      };

      // create default project membership
      const member = await mongoDbConnection.models.MemberModel.createProjectMember(memberInput);

      // add member to project
      await mongoDbConnection.models.ProjectModel.addMembers(project.id!, [member]);

      // add member to user
      await mongoDbConnection.models.UserModel.addMembership(userId, [member]);

      // connect project to workspace
      await mongoDbConnection.models.WorkspaceModel.addProjects(workspaceId, [project]);

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
    projectId: string,
    state: Omit<
      databaseTypes.IState,
      | 'name'
      | 'createdAt'
      | 'updatedAt'
      | 'fileSystemHash'
      | 'payloadHash'
      | 'fileSystem'
      | 'description'
      | 'version'
      | 'static'
      | 'camera'
      | 'aspectRatio'
      | 'project'
      | 'workspace'
      | 'createdBy'
      | '_id'
    >
  ): Promise<databaseTypes.IProject> {
    try {
      const project = await mongoDbConnection.models.ProjectModel.updateProjectById(projectId, {
        state: state,
      });
      return project;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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

  public static async deactivate(projectId: string): Promise<databaseTypes.IProject> {
    try {
      const project = await mongoDbConnection.models.ProjectModel.updateProjectById(projectId, {
        deletedAt: new Date(),
      });
      return project;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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

  public static async getProjectFileStats(id: string): Promise<fileIngestionTypes.IFileStats[]> {
    const project = await ProjectService.getProject(id);
    return project?.files ?? [];
  }

  public static async getProjectViewName(id: string): Promise<string> {
    const project = await ProjectService.getProject(id);
    return project?.viewName ?? '';
  }

  public static async updateProjectFileStats(
    projectId: string,
    fileStats: fileIngestionTypes.IFileStats[]
  ): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.updateProjectById(projectId, {
        files: fileStats,
      });

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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

  public static async updateProjectView(projectId: string, viewName: string): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.updateProjectById(projectId, {
        viewName: viewName,
      });

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    projectId: string,
    update: Omit<Partial<databaseTypes.IProject>, '_id' | 'createdAt' | 'updatedAt'>
  ): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.updateProjectById(projectId, update);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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

  public static async addStates(projectId: string, states: databaseTypes.IState[]): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.addStates(projectId, states);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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

  public static async addTags(projectId: string, tags: databaseTypes.ITag[]): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.addTags(projectId, tags);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
  public static async removeTags(projectId: string, tags: databaseTypes.ITag[]): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.removeTags(projectId, tags);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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

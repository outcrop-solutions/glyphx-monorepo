// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from 'lib/databaseConnection';
import {IProjectCreateInput} from 'database/src/mongoose/interfaces';

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
    try {
      const projects = await mongoDbConnection.models.ProjectModel.queryProjects(filter);
      return projects?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting projects. See the inner error for additional details',
          'projects',
          'getProjects',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createProject(data: Partial<databaseTypes.IProject>): Promise<databaseTypes.IProject> {
    try {
      // create project
      const project = await mongoDbConnection.models.ProjectModel.createProject(data as IProjectCreateInput);

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
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateProject(
    projectId: string,
    data: Partial<Omit<databaseTypes.IProject, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IProject> {
    try {
      const project = await mongoDbConnection.models.ProjectModel.updateProjectById(projectId, {
        ...data,
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
          'updateProject',
          {projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteProject(projectId: string): Promise<databaseTypes.IProject> {
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
          'updateProject',
          {projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addWorkspace(
    projectId: string,
    workspace: databaseTypes.IWorkspace | string
  ): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.addWorkspace(projectId, workspace);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding workspace to the project. See the inner error for additional details',
          'project',
          'addWorkspace',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeWorkspace(
    projectId: string,
    workspace: databaseTypes.IWorkspace | string
  ): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.removeWorkspace(projectId, workspace);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  workspace from the project. See the inner error for additional details',
          'project',
          'removeWorkspace',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addTemplate(
    projectId: string,
    projectTemplate: databaseTypes.IProjectTemplate | string
  ): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.addTemplate(projectId, projectTemplate);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding projectTemplate to the project. See the inner error for additional details',
          'project',
          'addTemplate',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeTemplate(
    projectId: string,
    projectTemplate: databaseTypes.IProjectTemplate | string
  ): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.removeTemplate(projectId, projectTemplate);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  projectTemplate from the project. See the inner error for additional details',
          'project',
          'removeTemplate',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addMembers(
    projectId: string,
    members: (databaseTypes.IMember | string)[]
  ): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.addMembers(projectId, members);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding members to the project. See the inner error for additional details',
          'project',
          'addMembers',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeMembers(
    projectId: string,
    members: (databaseTypes.IMember | string)[]
  ): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.removeMembers(projectId, members);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  members from the project. See the inner error for additional details',
          'project',
          'removeMembers',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addTags(
    projectId: string,
    tags: (databaseTypes.ITag | string)[]
  ): Promise<databaseTypes.IProject> {
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

  public static async removeTags(
    projectId: string,
    tags: (databaseTypes.ITag | string)[]
  ): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.removeTags(projectId, tags);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  tags from the project. See the inner error for additional details',
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

  public static async addStates(
    projectId: string,
    states: (databaseTypes.IState | string)[]
  ): Promise<databaseTypes.IProject> {
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

  public static async removeStates(
    projectId: string,
    states: (databaseTypes.IState | string)[]
  ): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.removeStates(projectId, states);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  states from the project. See the inner error for additional details',
          'project',
          'removeStates',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addFilesystems(
    projectId: string,
    fileStats: (databaseTypes.IFileStats | string)[]
  ): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.addFilesystems(projectId, fileStats);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding fileStats to the project. See the inner error for additional details',
          'project',
          'addFilesystems',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeFilesystems(
    projectId: string,
    fileStats: (databaseTypes.IFileStats | string)[]
  ): Promise<databaseTypes.IProject> {
    try {
      const updatedProject = await mongoDbConnection.models.ProjectModel.removeFilesystems(projectId, fileStats);

      return updatedProject;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  fileStats from the project. See the inner error for additional details',
          'project',
          'removeFilesystems',
          {id: projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}

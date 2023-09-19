// THIS CODE WAS AUTOMATICALLY GENERATED
import { databaseTypes } from '../../../../database';
import {error, constants} from 'core';
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

  public static async createProject(
    data: Partial<databaseTypes.IProject>,
  ): Promise<databaseTypes.IProject> {
    try {
      // create project
      const project = await mongoDbConnection.models.ProjectModel.createProject(
        data
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
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateProject(
    projectId: mongooseTypes.ObjectId | string,
    data: Partial<Omit<
      databaseTypes.IProject,
      | '_id'
      | 'createdAt'
      | 'updatedAt'
    >>
  ): Promise<databaseTypes.IProject> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);
      const project =
        await mongoDbConnection.models.ProjectModel.updateProjectById(id, {
          ...data
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
          'updateProject',
          { projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteProject(
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
          'updateProject',
          { projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

public static async addWorkspace(
    projectId: mongooseTypes.ObjectId | string,
    workspace: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);
      const updatedProject =
        await mongoDbConnection.models.ProjectModel.addWorkspace(id, workspace);

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
    projectId: mongooseTypes.ObjectId | string,
    workspace: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> {
    try {
      const id =
         projectId instanceof mongooseTypes.ObjectId
          ?  projectId
          : new mongooseTypes.ObjectId( projectId);
      const updatedProject =
        await mongoDbConnection.models.WorkspaceModel.removeWorkspace(id, workspace);

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
          'An unexpected error occurred while removing  workspace from the project. See the inner error for additional details',
          'project',
          'removeWorkspace',
          {id:  projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }


public static async addTemplate(
    projectId: mongooseTypes.ObjectId | string,
    projectTemplate: (databaseTypes.IProjectTemplate | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> {
    try {
      const id =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);
      const updatedProject =
        await mongoDbConnection.models.ProjectModel.addTemplate(id, projectTemplate);

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
    projectId: mongooseTypes.ObjectId | string,
    projectTemplate: (databaseTypes.IProjectTemplate | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IProject> {
    try {
      const id =
         projectId instanceof mongooseTypes.ObjectId
          ?  projectId
          : new mongooseTypes.ObjectId( projectId);
      const updatedProject =
        await mongoDbConnection.models.TemplateModel.removeTemplate(id, projectTemplate);

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
          'An unexpected error occurred while removing  projectTemplate from the project. See the inner error for additional details',
          'project',
          'removeTemplate',
          {id:  projectId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

}
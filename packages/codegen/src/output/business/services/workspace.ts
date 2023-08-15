// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../database';
import {error, constants} from '@glyphx/core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class WorkspaceService {
  public static async getWorkspace(
    workspaceId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IWorkspace | null> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const workspace =
        await mongoDbConnection.models.WorkspaceModel.getWorkspaceById(id);
      return workspace;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the workspace. See the inner error for additional details',
          'workspace',
          'getWorkspace',
          {id: workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getWorkspaces(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IWorkspace[] | null> {
    try {
      const workspaces =
        await mongoDbConnection.models.WorkspaceModel.queryWorkspaces(filter);
      return workspaces?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting workspaces. See the inner error for additional details',
          'workspaces',
          'getWorkspaces',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createWorkspace(
    data: Partial<databaseTypes.IWorkspace>
  ): Promise<databaseTypes.IWorkspace> {
    try {
      // create workspace
      const workspace =
        await mongoDbConnection.models.WorkspaceModel.createWorkspace(data);

      return workspace;
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
          'An unexpected error occurred while creating the workspace. See the inner error for additional details',
          'workspace',
          'createWorkspace',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateWorkspace(
    workspaceId: mongooseTypes.ObjectId | string,
    data: Partial<
      Omit<databaseTypes.IWorkspace, '_id' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<databaseTypes.IWorkspace> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const workspace =
        await mongoDbConnection.models.WorkspaceModel.updateWorkspaceById(id, {
          ...data,
        });
      return workspace;
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
          'updateWorkspace',
          {workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteWorkspace(
    workspaceId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IWorkspace> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const workspace =
        await mongoDbConnection.models.WorkspaceModel.updateWorkspaceById(id, {
          deletedAt: new Date(),
        });
      return workspace;
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
          'updateWorkspace',
          {workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addTags(
    workspaceId: mongooseTypes.ObjectId | string,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const updatedWorkspace =
        await mongoDbConnection.models.WorkspaceModel.addTags(id, tags);

      return updatedWorkspace;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding tags to the workspace. See the inner error for additional details',
          'workspace',
          'addTags',
          {id: workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeTags(
    workspaceId: mongooseTypes.ObjectId | string,
    tags: (databaseTypes.ITag | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const updatedWorkspace =
        await mongoDbConnection.models.TagsModel.removeTags(id, tags);

      return updatedWorkspace;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  tags from the workspace. See the inner error for additional details',
          'workspace',
          'removeTags',
          {id: workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addCreator(
    workspaceId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const updatedWorkspace =
        await mongoDbConnection.models.WorkspaceModel.addCreator(id, user);

      return updatedWorkspace;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding user to the workspace. See the inner error for additional details',
          'workspace',
          'addCreator',
          {id: workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeCreator(
    workspaceId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const updatedWorkspace =
        await mongoDbConnection.models.CreatorModel.removeCreator(id, user);

      return updatedWorkspace;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the workspace. See the inner error for additional details',
          'workspace',
          'removeCreator',
          {id: workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addMembers(
    workspaceId: mongooseTypes.ObjectId | string,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const updatedWorkspace =
        await mongoDbConnection.models.WorkspaceModel.addMembers(id, members);

      return updatedWorkspace;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding members to the workspace. See the inner error for additional details',
          'workspace',
          'addMembers',
          {id: workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeMembers(
    workspaceId: mongooseTypes.ObjectId | string,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const updatedWorkspace =
        await mongoDbConnection.models.MembersModel.removeMembers(id, members);

      return updatedWorkspace;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  members from the workspace. See the inner error for additional details',
          'workspace',
          'removeMembers',
          {id: workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addProjects(
    workspaceId: mongooseTypes.ObjectId | string,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const updatedWorkspace =
        await mongoDbConnection.models.WorkspaceModel.addProjects(id, projects);

      return updatedWorkspace;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding projects to the workspace. See the inner error for additional details',
          'workspace',
          'addProjects',
          {id: workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeProjects(
    workspaceId: mongooseTypes.ObjectId | string,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const updatedWorkspace =
        await mongoDbConnection.models.ProjectsModel.removeProjects(
          id,
          projects
        );

      return updatedWorkspace;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  projects from the workspace. See the inner error for additional details',
          'workspace',
          'removeProjects',
          {id: workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addStates(
    workspaceId: mongooseTypes.ObjectId | string,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const updatedWorkspace =
        await mongoDbConnection.models.WorkspaceModel.addStates(id, states);

      return updatedWorkspace;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding states to the workspace. See the inner error for additional details',
          'workspace',
          'addStates',
          {id: workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeStates(
    workspaceId: mongooseTypes.ObjectId | string,
    states: (databaseTypes.IState | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IWorkspace> {
    try {
      const id =
        workspaceId instanceof mongooseTypes.ObjectId
          ? workspaceId
          : new mongooseTypes.ObjectId(workspaceId);
      const updatedWorkspace =
        await mongoDbConnection.models.StatesModel.removeStates(id, states);

      return updatedWorkspace;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  states from the workspace. See the inner error for additional details',
          'workspace',
          'removeStates',
          {id: workspaceId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}

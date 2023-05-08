import {database as databaseTypes, web as webTypes} from '@glyphx/types';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from 'lib/databaseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {v4} from 'uuid';
import {hashFileSystem} from 'util/hashFileSystem';

export class StateService {
  public static async getState(
    stateId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IState | null> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : new mongooseTypes.ObjectId(stateId);
      const state = await mongoDbConnection.models.StateModel.getStateById(id);
      return state;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the state. See the inner error for additional details',
          'state',
          'getState',
          {stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createState(
    name: string,
    camera: webTypes.Camera,
    projectId: mongooseTypes.ObjectId | string,
    userId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IState | null> {
    try {
      const pid =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : new mongooseTypes.ObjectId(projectId);

      const uid =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);

      const project =
        await mongoDbConnection.models.ProjectModel.getProjectById(pid);

      const pwid =
        project.workspace._id instanceof mongooseTypes.ObjectId
          ? project.workspace._id
          : new mongooseTypes.ObjectId(project.workspace._id);

      const workspace =
        await mongoDbConnection.models.ProjectModel.getProjectById(pwid);

      const user = await mongoDbConnection.models.UserModel.getUserById(uid);

      const input = {
        createdBy: {...user},
        name: name,
        version: 0,
        static: true,
        camera: {...camera},
        properties: {...project.state.properties},
        fileSystemHash: hashFileSystem(project.files),
        workspace: {...workspace},
        project: {...project},
        fileSystem: [...project.files],
      };

      const state = await mongoDbConnection.models.StateModel.createState(
        input
      );

      const wid =
        workspace._id instanceof mongooseTypes.ObjectId
          ? workspace._id
          : new mongooseTypes.ObjectId(workspace._id);

      await mongoDbConnection.models.WorkspaceModel.addStates(wid, [state]);
      await mongoDbConnection.models.ProjectModel.addStates(pid, [state]);

      return state;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while creating the state. See the inner error for additional details',
          'state',
          'createState',
          {projectId, userId, name, camera},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteState(
    stateId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IState> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : new mongooseTypes.ObjectId(stateId);

      const state = await mongoDbConnection.models.StateModel.updateStateById(
        id,
        {
          deletedAt: new Date(),
        }
      );

      return state;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the State. See the inner error for additional details',
          'state',
          'updateState',
          {stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateState(
    stateId: mongooseTypes.ObjectId | string,
    name: string
  ): Promise<databaseTypes.IState> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : new mongooseTypes.ObjectId(stateId);

      const state = await mongoDbConnection.models.StateModel.updateStateById(
        id,
        {
          name: name,
        }
      );

      return state;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the state. See the inner error for additional details',
          'state',
          'updateState',
          {stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateUserCode(
    userId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IUser> {
    try {
      const id =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : new mongooseTypes.ObjectId(userId);
      const user = await mongoDbConnection.models.UserModel.updateUserById(id, {
        userCode: v4().replaceAll('-', ''),
      });
      return user;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the user. See the inner error for additional details',
          'user',
          'updateUser',
          {userId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}

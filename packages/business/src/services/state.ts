import {databaseTypes, webTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from '../lib/databaseConnection';
import {Types as mongooseTypes} from 'mongoose';
import {hashFileSystem} from '../util/hashFileSystem';
import {hashPayload} from '../util/hashPayload';

export class StateService {
  public static async getState(stateId: mongooseTypes.ObjectId | string): Promise<databaseTypes.IState | null> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : // @ts-ignore
            new mongooseTypes.ObjectId(stateId);
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
    userId: mongooseTypes.ObjectId | string,
    aspectRatio: webTypes.Aspect,
    imageHash?: string
  ): Promise<databaseTypes.IState | null> {
    try {
      const pid =
        projectId instanceof mongooseTypes.ObjectId
          ? projectId
          : // @ts-ignore
            new mongooseTypes.ObjectId(projectId);

      const uid =
        userId instanceof mongooseTypes.ObjectId
          ? userId
          : // @ts-ignore
            new mongooseTypes.ObjectId(userId);

      const project = await mongoDbConnection.models.ProjectModel.getProjectById(pid);

      const pwid =
        project.workspace._id instanceof mongooseTypes.ObjectId
          ? project.workspace._id
          : // @ts-ignore
            new mongooseTypes.ObjectId(project.workspace._id);

      const workspace = await mongoDbConnection.models.WorkspaceModel.getWorkspaceById(pwid);

      const user = await mongoDbConnection.models.UserModel.getUserById(uid);

      const image = imageHash ? {imageHash} : {};

      const input = {
        ...image,
        createdBy: {...user},
        name: name,
        version: 0,
        static: true,
        camera: {...camera},
        aspectRatio: {...aspectRatio},
        properties: {...project.state.properties},
        fileSystemHash: hashFileSystem(project.files),
        payloadHash: hashPayload(hashFileSystem(project.files), project),
        workspace: {...workspace},
        project: {...project},
        fileSystem: [...project.files],
      };

      const state = await mongoDbConnection.models.StateModel.createState(input);

      await mongoDbConnection.models.ProjectModel.updateProjectById(pid, {
        imageHash: imageHash,
        aspectRatio: aspectRatio,
      });

      const wid =
        workspace._id instanceof mongooseTypes.ObjectId
          ? workspace._id
          : // @ts-ignore
            new mongooseTypes.ObjectId(workspace._id);

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
          {projectId, userId, name, camera, aspectRatio},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteState(stateId: mongooseTypes.ObjectId | string): Promise<databaseTypes.IState> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : // @ts-ignore
            new mongooseTypes.ObjectId(stateId);

      const state = await mongoDbConnection.models.StateModel.updateStateById(id, {
        deletedAt: new Date(),
      });

      return state;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    name?: string,
    imageHash?: string
  ): Promise<databaseTypes.IState> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : // @ts-ignore
            new mongooseTypes.ObjectId(stateId);

      const image = imageHash ? {imageHash} : {};
      const nameObj = name ? {name} : {};
      const state = await mongoDbConnection.models.StateModel.updateStateById(id, {
        ...image,
        ...nameObj,
      });

      return state;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
}

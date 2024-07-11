import {databaseTypes, webTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from '../lib/databaseConnection';
import {hashFileSystem, hashPayload} from '../util/hashFunctions';

export class StateService {
  public static async getState(stateId: string): Promise<databaseTypes.IState | null> {
    try {
      const state = await mongoDbConnection.models.StateModel.getStateById(stateId);
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
    project: databaseTypes.IProject,
    userId: string,
    aspectRatio: webTypes.Aspect,
    rowIds: string[],
    imageHash?: string
  ): Promise<databaseTypes.IState | null> {
    try {
      const workspace = await mongoDbConnection.models.WorkspaceModel.getWorkspaceById(project?.workspace.id!);
      const user = await mongoDbConnection.models.UserModel.getUserById(userId);
      const image = imageHash ? {imageHash} : {};

      const cleanFiles = project.files.map((f) => {
        delete f.selected;
        delete f.open;

        return {
          ...f,
        };
      });

      const input = {
        ...image,
        createdBy: {...user},
        name: name,
        version: 0,
        static: true,
        camera: {...camera},
        aspectRatio: {...aspectRatio},
        properties: {...project.state.properties},
        fileSystemHash: hashFileSystem(cleanFiles),
        payloadHash: hashPayload(hashFileSystem(cleanFiles), project),
        workspace: {...workspace},
        project: {...project},
        fileSystem: [...cleanFiles],
        rowIds: rowIds,
      };

      const state = await mongoDbConnection.models.StateModel.createState(input);

      await mongoDbConnection.models.ProjectModel.updateProjectById(project.id as string, {
        imageHash: imageHash,
        aspectRatio: aspectRatio,
      });

      await mongoDbConnection.models.WorkspaceModel.addStates(workspace.id!, [state]);
      await mongoDbConnection.models.ProjectModel.addStates(project.id as string, [state]);

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
          {project, userId, name, camera, aspectRatio},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteState(stateId: string): Promise<databaseTypes.IState> {
    try {
      const state = await mongoDbConnection.models.StateModel.updateStateById(stateId, {
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

  public static async updateState(stateId: string, name?: string, imageHash?: string): Promise<databaseTypes.IState> {
    try {
      const image = imageHash ? {imageHash} : {};
      const nameObj = name ? {name} : {};
      const state = await mongoDbConnection.models.StateModel.updateStateById(stateId, {
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

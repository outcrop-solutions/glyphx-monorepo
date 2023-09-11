// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../database';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

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
          {id: stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getStates(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IState[] | null> {
    try {
      const states =
        await mongoDbConnection.models.StateModel.queryStates(filter);
      return states?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting states. See the inner error for additional details',
          'states',
          'getStates',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createState(
    data: Partial<databaseTypes.IState>
  ): Promise<databaseTypes.IState> {
    try {
      // create state
      const state = await mongoDbConnection.models.StateModel.createState(data);

      return state;
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
          'An unexpected error occurred while creating the state. See the inner error for additional details',
          'state',
          'createState',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateState(
    stateId: mongooseTypes.ObjectId | string,
    data: Partial<Omit<databaseTypes.IState, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IState> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : new mongooseTypes.ObjectId(stateId);
      const state = await mongoDbConnection.models.StateModel.updateStateById(
        id,
        {
          ...data,
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
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateState',
          {stateId},
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
          'An unexpected error occurred while updating the User. See the inner error for additional details',
          'user',
          'updateState',
          {stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addCreatedBy(
    stateId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : new mongooseTypes.ObjectId(stateId);
      const updatedState =
        await mongoDbConnection.models.StateModel.addCreatedBy(id, user);

      return updatedState;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding user to the state. See the inner error for additional details',
          'state',
          'addCreatedBy',
          {id: stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeCreatedBy(
    stateId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : new mongooseTypes.ObjectId(stateId);
      const updatedState =
        await mongoDbConnection.models.CreatedByModel.removeCreatedBy(id, user);

      return updatedState;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the state. See the inner error for additional details',
          'state',
          'removeCreatedBy',
          {id: stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addProject(
    stateId: mongooseTypes.ObjectId | string,
    project: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : new mongooseTypes.ObjectId(stateId);
      const updatedState = await mongoDbConnection.models.StateModel.addProject(
        id,
        project
      );

      return updatedState;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding project to the state. See the inner error for additional details',
          'state',
          'addProject',
          {id: stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeProject(
    stateId: mongooseTypes.ObjectId | string,
    project: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : new mongooseTypes.ObjectId(stateId);
      const updatedState =
        await mongoDbConnection.models.ProjectModel.removeProject(id, project);

      return updatedState;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  project from the state. See the inner error for additional details',
          'state',
          'removeProject',
          {id: stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addWorkspace(
    stateId: mongooseTypes.ObjectId | string,
    workspace: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : new mongooseTypes.ObjectId(stateId);
      const updatedState =
        await mongoDbConnection.models.StateModel.addWorkspace(id, workspace);

      return updatedState;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding workspace to the state. See the inner error for additional details',
          'state',
          'addWorkspace',
          {id: stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeWorkspace(
    stateId: mongooseTypes.ObjectId | string,
    workspace: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IState> {
    try {
      const id =
        stateId instanceof mongooseTypes.ObjectId
          ? stateId
          : new mongooseTypes.ObjectId(stateId);
      const updatedState =
        await mongoDbConnection.models.WorkspaceModel.removeWorkspace(
          id,
          workspace
        );

      return updatedState;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  workspace from the state. See the inner error for additional details',
          'state',
          'removeWorkspace',
          {id: stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}

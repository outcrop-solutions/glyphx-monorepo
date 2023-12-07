// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';
import {IStateCreateInput} from 'database/src/mongoose/interfaces';

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
          {id: stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getStates(filter?: Record<string, unknown>): Promise<databaseTypes.IState[] | null> {
    try {
      const states = await mongoDbConnection.models.StateModel.queryStates(filter);
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

  public static async createState(data: Partial<databaseTypes.IState>): Promise<databaseTypes.IState> {
    try {
      // create state
      const state = await mongoDbConnection.models.StateModel.createState(data as IStateCreateInput);

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
    stateId: string,
    data: Partial<Omit<databaseTypes.IState, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IState> {
    try {
      const state = await mongoDbConnection.models.StateModel.updateStateById(stateId, {
        ...data,
      });
      return state;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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

  public static async addCreatedBy(stateId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IState> {
    try {
      const updatedState = await mongoDbConnection.models.StateModel.addCreatedBy(stateId, user);

      return updatedState;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    stateId: string,
    user: databaseTypes.IUser | string
  ): Promise<databaseTypes.IState> {
    try {
      const updatedState = await mongoDbConnection.models.StateModel.removeCreatedBy(stateId, user);

      return updatedState;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    stateId: string,
    project: databaseTypes.IProject | string
  ): Promise<databaseTypes.IState> {
    try {
      const updatedState = await mongoDbConnection.models.StateModel.addProject(stateId, project);

      return updatedState;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    stateId: string,
    project: databaseTypes.IProject | string
  ): Promise<databaseTypes.IState> {
    try {
      const updatedState = await mongoDbConnection.models.StateModel.removeProject(stateId, project);

      return updatedState;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    stateId: string,
    workspace: databaseTypes.IWorkspace | string
  ): Promise<databaseTypes.IState> {
    try {
      const updatedState = await mongoDbConnection.models.StateModel.addWorkspace(stateId, workspace);

      return updatedState;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    stateId: string,
    workspace: databaseTypes.IWorkspace | string
  ): Promise<databaseTypes.IState> {
    try {
      const updatedState = await mongoDbConnection.models.StateModel.removeWorkspace(stateId, workspace);

      return updatedState;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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

  public static async addDocument(
    stateId: string,
    document: databaseTypes.IDocument | string
  ): Promise<databaseTypes.IState> {
    try {
      const updatedState = await mongoDbConnection.models.StateModel.addDocument(stateId, document);

      return updatedState;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding document to the state. See the inner error for additional details',
          'state',
          'addDocument',
          {id: stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeDocument(
    stateId: string,
    document: databaseTypes.IDocument | string
  ): Promise<databaseTypes.IState> {
    try {
      const updatedState = await mongoDbConnection.models.StateModel.removeDocument(stateId, document);

      return updatedState;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  document from the state. See the inner error for additional details',
          'state',
          'removeDocument',
          {id: stateId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}

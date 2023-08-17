// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../database';
import {error, constants} from '@glyphx/core';
import {Types as mongooseTypes} from 'mongoose';
import mongoDbConnection from 'lib/databaseConnection';

export class MemberService {
  public static async getMember(
    memberId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IMember | null> {
    try {
      const id =
        memberId instanceof mongooseTypes.ObjectId
          ? memberId
          : new mongooseTypes.ObjectId(memberId);
      const member = await mongoDbConnection.models.MemberModel.getMemberById(
        id
      );
      return member;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the member. See the inner error for additional details',
          'member',
          'getMember',
          {id: memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getMembers(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IMember[] | null> {
    try {
      const members = await mongoDbConnection.models.MemberModel.queryMembers(
        filter
      );
      return members?.results;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting members. See the inner error for additional details',
          'members',
          'getMembers',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async createMember(
    data: Partial<databaseTypes.IMember>
  ): Promise<databaseTypes.IMember> {
    try {
      // create member
      const member = await mongoDbConnection.models.MemberModel.createMember(
        data
      );

      return member;
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
          'An unexpected error occurred while creating the member. See the inner error for additional details',
          'member',
          'createMember',
          {data},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateMember(
    memberId: mongooseTypes.ObjectId | string,
    data: Partial<
      Omit<databaseTypes.IMember, '_id' | 'createdAt' | 'updatedAt'>
    >
  ): Promise<databaseTypes.IMember> {
    try {
      const id =
        memberId instanceof mongooseTypes.ObjectId
          ? memberId
          : new mongooseTypes.ObjectId(memberId);
      const member =
        await mongoDbConnection.models.MemberModel.updateMemberById(id, {
          ...data,
        });
      return member;
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
          'updateMember',
          {memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async deleteMember(
    memberId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IMember> {
    try {
      const id =
        memberId instanceof mongooseTypes.ObjectId
          ? memberId
          : new mongooseTypes.ObjectId(memberId);
      const member =
        await mongoDbConnection.models.MemberModel.updateMemberById(id, {
          deletedAt: new Date(),
        });
      return member;
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
          'updateMember',
          {memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addMember(
    memberId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember> {
    try {
      const id =
        memberId instanceof mongooseTypes.ObjectId
          ? memberId
          : new mongooseTypes.ObjectId(memberId);
      const updatedMember =
        await mongoDbConnection.models.MemberModel.addMember(id, user);

      return updatedMember;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding user to the member. See the inner error for additional details',
          'member',
          'addMember',
          {id: memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeMember(
    memberId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember> {
    try {
      const id =
        memberId instanceof mongooseTypes.ObjectId
          ? memberId
          : new mongooseTypes.ObjectId(memberId);
      const updatedMember =
        await mongoDbConnection.models.MemberModel.removeMember(id, user);

      return updatedMember;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the member. See the inner error for additional details',
          'member',
          'removeMember',
          {id: memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addInvitedBy(
    memberId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember> {
    try {
      const id =
        memberId instanceof mongooseTypes.ObjectId
          ? memberId
          : new mongooseTypes.ObjectId(memberId);
      const updatedMember =
        await mongoDbConnection.models.MemberModel.addInvitedBy(id, user);

      return updatedMember;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding user to the member. See the inner error for additional details',
          'member',
          'addInvitedBy',
          {id: memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeInvitedBy(
    memberId: mongooseTypes.ObjectId | string,
    user: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember> {
    try {
      const id =
        memberId instanceof mongooseTypes.ObjectId
          ? memberId
          : new mongooseTypes.ObjectId(memberId);
      const updatedMember =
        await mongoDbConnection.models.InvitedByModel.removeInvitedBy(id, user);

      return updatedMember;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  user from the member. See the inner error for additional details',
          'member',
          'removeInvitedBy',
          {id: memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addWorkspace(
    memberId: mongooseTypes.ObjectId | string,
    workspace: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember> {
    try {
      const id =
        memberId instanceof mongooseTypes.ObjectId
          ? memberId
          : new mongooseTypes.ObjectId(memberId);
      const updatedMember =
        await mongoDbConnection.models.MemberModel.addWorkspace(id, workspace);

      return updatedMember;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding workspace to the member. See the inner error for additional details',
          'member',
          'addWorkspace',
          {id: memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeWorkspace(
    memberId: mongooseTypes.ObjectId | string,
    workspace: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember> {
    try {
      const id =
        memberId instanceof mongooseTypes.ObjectId
          ? memberId
          : new mongooseTypes.ObjectId(memberId);
      const updatedMember =
        await mongoDbConnection.models.WorkspaceModel.removeWorkspace(
          id,
          workspace
        );

      return updatedMember;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  workspace from the member. See the inner error for additional details',
          'member',
          'removeWorkspace',
          {id: memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async addProject(
    memberId: mongooseTypes.ObjectId | string,
    project: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember> {
    try {
      const id =
        memberId instanceof mongooseTypes.ObjectId
          ? memberId
          : new mongooseTypes.ObjectId(memberId);
      const updatedMember =
        await mongoDbConnection.models.MemberModel.addProject(id, project);

      return updatedMember;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while adding project to the member. See the inner error for additional details',
          'member',
          'addProject',
          {id: memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async removeProject(
    memberId: mongooseTypes.ObjectId | string,
    project: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IMember> {
    try {
      const id =
        memberId instanceof mongooseTypes.ObjectId
          ? memberId
          : new mongooseTypes.ObjectId(memberId);
      const updatedMember =
        await mongoDbConnection.models.ProjectModel.removeProject(id, project);

      return updatedMember;
    } catch (err: any) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while removing  project from the member. See the inner error for additional details',
          'member',
          'removeProject',
          {id: memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}

// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {error, constants} from 'core';
import mongoDbConnection from 'lib/databaseConnection';
import {IMemberCreateInput} from 'database/src/mongoose/interfaces';

export class MemberService {
  public static async getMember(memberId: string): Promise<databaseTypes.IMember | null> {
    try {
      const member = await mongoDbConnection.models.MemberModel.getMemberById(memberId);
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

  public static async getMembers(filter?: Record<string, unknown>): Promise<databaseTypes.IMember[] | null> {
    try {
      const members = await mongoDbConnection.models.MemberModel.queryMembers(filter);
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

  public static async createMember(data: Partial<databaseTypes.IMember>): Promise<databaseTypes.IMember> {
    try {
      // create member
      const member = await mongoDbConnection.models.MemberModel.createMember(data as IMemberCreateInput);

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
    memberId: string,
    data: Partial<Omit<databaseTypes.IMember, '_id' | 'createdAt' | 'updatedAt'>>
  ): Promise<databaseTypes.IMember> {
    try {
      const member = await mongoDbConnection.models.MemberModel.updateMemberById(memberId, {
        ...data,
      });
      return member;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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

  public static async deleteMember(memberId: string): Promise<databaseTypes.IMember> {
    try {
      const member = await mongoDbConnection.models.MemberModel.updateMemberById(memberId, {
        deletedAt: new Date(),
      });
      return member;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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

  public static async addMember(memberId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IMember> {
    try {
      const updatedMember = await mongoDbConnection.models.MemberModel.addMember(memberId, user);

      return updatedMember;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    memberId: string,
    user: databaseTypes.IUser | string
  ): Promise<databaseTypes.IMember> {
    try {
      const updatedMember = await mongoDbConnection.models.MemberModel.removeMember(memberId, user);

      return updatedMember;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    memberId: string,
    user: databaseTypes.IUser | string
  ): Promise<databaseTypes.IMember> {
    try {
      const updatedMember = await mongoDbConnection.models.MemberModel.addInvitedBy(memberId, user);

      return updatedMember;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    memberId: string,
    user: databaseTypes.IUser | string
  ): Promise<databaseTypes.IMember> {
    try {
      const updatedMember = await mongoDbConnection.models.MemberModel.removeInvitedBy(memberId, user);

      return updatedMember;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    memberId: string,
    workspace: databaseTypes.IWorkspace | string
  ): Promise<databaseTypes.IMember> {
    try {
      const updatedMember = await mongoDbConnection.models.MemberModel.addWorkspace(memberId, workspace);

      return updatedMember;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    memberId: string,
    workspace: databaseTypes.IWorkspace | string
  ): Promise<databaseTypes.IMember> {
    try {
      const updatedMember = await mongoDbConnection.models.MemberModel.removeWorkspace(memberId, workspace);

      return updatedMember;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    memberId: string,
    project: databaseTypes.IProject | string
  ): Promise<databaseTypes.IMember> {
    try {
      const updatedMember = await mongoDbConnection.models.MemberModel.addProject(memberId, project);

      return updatedMember;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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
    memberId: string,
    project: databaseTypes.IProject | string
  ): Promise<databaseTypes.IMember> {
    try {
      const updatedMember = await mongoDbConnection.models.MemberModel.removeProject(memberId, project);

      return updatedMember;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
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

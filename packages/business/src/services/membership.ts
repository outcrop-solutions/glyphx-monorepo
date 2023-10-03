import {databaseTypes} from 'types';
import {error, constants} from 'core';

import mongoDbConnection from '../lib/databaseConnection';

export class MembershipService {
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
          {memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getMembers(filter?: Record<string, unknown>): Promise<databaseTypes.IMember[] | null> {
    try {
      const {results} = await mongoDbConnection.models.MemberModel.queryMembers(filter);
      if (results) {
        return results;
      } else {
        return null;
      }
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting members. See the inner error for additional details',
          'member',
          'getMembers',
          {filter},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async getPendingInvitations(email: string): Promise<databaseTypes.IMember[] | null> {
    try {
      const members = await MembershipService.getMembers({
        email,
        deletedAt: undefined,
        status: databaseTypes.constants.INVITATION_STATUS.PENDING,
        type: databaseTypes.constants.MEMBERSHIP_TYPE.WORKSPACE,
      });
      return members;
    } catch (err: any) {
      if (err instanceof error.DataNotFoundError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        return null;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while getting the member. See the inner error for additional details',
          'member',
          'getMembers',
          {email},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async remove(memberId: string): Promise<databaseTypes.IMember | null> {
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
          'An unexpected error occurred while updating the member. See the inner error for additional details',
          'member',
          'updateMember',
          {memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateRole(
    memberId: string,
    role: databaseTypes.constants.ROLE | databaseTypes.constants.PROJECT_ROLE
  ): Promise<databaseTypes.IMember | null> {
    try {
      if (role === databaseTypes.constants.ROLE.MEMBER || role === databaseTypes.constants.ROLE.OWNER) {
        const member = await mongoDbConnection.models.MemberModel.updateMemberById(memberId, {
          teamRole: role,
        });
        return member;
      } else if (
        role === databaseTypes.constants.PROJECT_ROLE.CAN_EDIT ||
        role === databaseTypes.constants.PROJECT_ROLE.READ_ONLY ||
        role === databaseTypes.constants.PROJECT_ROLE.OWNER
      ) {
        const member = await mongoDbConnection.models.MemberModel.updateMemberById(memberId, {
          projectRole: role,
        });
        return member;
      } else {
        return null;
      }
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the member. See the inner error for additional details',
          'member',
          'updateMember',
          {memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }

  public static async updateStatus(
    memberId: string,
    status: databaseTypes.constants.INVITATION_STATUS
  ): Promise<databaseTypes.IMember | null> {
    try {
      const member = await mongoDbConnection.models.MemberModel.updateMemberById(memberId, {
        status,
      });
      return member;
    } catch (err: any) {
      if (err instanceof error.InvalidArgumentError || err instanceof error.InvalidOperationError) {
        err.publish('', constants.ERROR_SEVERITY.WARNING);
        throw err;
      } else {
        const e = new error.DataServiceError(
          'An unexpected error occurred while updating the member. See the inner error for additional details',
          'member',
          'updateMember',
          {memberId},
          err
        );
        e.publish('', constants.ERROR_SEVERITY.ERROR);
        throw e;
      }
    }
  }
}

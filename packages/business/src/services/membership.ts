import {database, database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from 'lib/databaseConnection';

//eslint-disable-next-line
const prisma: any = {};

export class MembershipService {
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
    } catch (err) {
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

  public static async getMembers(
    filter?: Record<string, unknown>
  ): Promise<databaseTypes.IMember[] | null> {
    try {
      const members = await mongoDbConnection.models.MemberModel.queryMembers(
        filter
      );
      return members;
    } catch (err) {
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

  public static async getPendingInvitations(
    email: string
  ): Promise<databaseTypes.IMember[] | null> {
    try {
      const members = await MembershipService.getMembers({
        email,
        deletedAt: null,
        status: database.constants.INVITATION_STATUS.PENDING,
      });
      return members;
    } catch (err) {
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

  public static async remove(
    memberId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IMember | null> {
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
    } catch (err) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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

  public static async toggleRole(
    memberId: mongooseTypes.ObjectId | string,
    teamRole: databaseTypes.constants.ROLE
  ): Promise<databaseTypes.IMember | null> {
    try {
      const id =
        memberId instanceof mongooseTypes.ObjectId
          ? memberId
          : new mongooseTypes.ObjectId(memberId);
      const member =
        await mongoDbConnection.models.MemberModel.updateMemberById(id, {
          teamRole,
        });
      return member;
    } catch (err) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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
    memberId: mongooseTypes.ObjectId | string,
    status: databaseTypes.constants.INVITATION_STATUS
  ): Promise<databaseTypes.IMember | null> {
    try {
      const id =
        memberId instanceof mongooseTypes.ObjectId
          ? memberId
          : new mongooseTypes.ObjectId(memberId);
      const member =
        await mongoDbConnection.models.MemberModel.updateMemberById(id, {
          status,
        });
      return member;
    } catch (err) {
      if (
        err instanceof error.InvalidArgumentError ||
        err instanceof error.InvalidOperationError
      ) {
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

import {database} from '@glyphx/types';
import {prisma} from '@glyphx/database';
import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';
import {error, constants} from '@glyphx/core';
import mongoDbConnection from 'lib/databaseConnection';

export async function getMember(id) {
  return await prisma.member.findFirst({
    select: {teamRole: true},
    where: {id},
  });
}
export async function getMembers(slug) {
  return await prisma.member.findMany({
    select: {
      id: true,
      email: true,
      status: true,
      teamRole: true,
      member: {select: {name: true}},
    },
    where: {
      deletedAt: null,
      workspace: {
        deletedAt: null,
        slug,
      },
    },
  });
}

export async function getPendingInvitations(email) {
  return await prisma.member.findMany({
    select: {
      id: true,
      email: true,
      joinedAt: true,
      status: true,
      teamRole: true,
      invitedBy: {
        select: {
          email: true,
          name: true,
        },
      },
      workspace: {
        select: {
          createdAt: true,
          inviteCode: true,
          name: true,
          slug: true,
          workspaceCode: true,
          creator: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      },
    },
    where: {
      deletedAt: null,
      email,
      status: database.constants.INVITATION_STATUS.PENDING,
      workspace: {deletedAt: null},
    },
  });
}
export async function remove(id) {
  return await prisma.member.update({
    data: {deletedAt: new Date()},
    where: {id},
  });
}
export async function toggleRole(id, teamRole) {
  return await prisma.member.update({
    data: {teamRole},
    where: {id},
  });
}
export async function updateStatus(id, status) {
  return await prisma.member.update({
    data: {status},
    where: {id},
  });
}

export class MembershipService {
  public static async getMember(
    memberId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IMember | null> {
    try {
      const member = await mongoDbConnection.models.MemberModel.getMemberById(
        memberId
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
      const members = await mongoDbConnection.models.MemberModel.getMembers(
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

  public static async remove(
    memberId: mongooseTypes.ObjectId | string
  ): Promise<databaseTypes.IMember | null> {
    try {
      const member =
        await mongoDbConnection.models.MemberModel.updateMemberById(memberId, {
          deletedAt: new Date(),
        });
      return member;
    } catch (err) {
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

  public static async toggleRole(
    memberId: mongooseTypes.ObjectId | string,
    teamRole: databaseTypes.constants.ROLE
  ): Promise<databaseTypes.IMember | null> {
    try {
      const member =
        await mongoDbConnection.models.MemberModel.updateMemberById(memberId, {
          teamRole,
        });
      return member;
    } catch (err) {
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

  public static async updateStatus(
    memberId: mongooseTypes.ObjectId | string,
    status: databaseTypes.constants.INVITATION_STATUS
  ): Promise<databaseTypes.IMember | null> {
    try {
      const member =
        await mongoDbConnection.models.MemberModel.updateMemberById(memberId, {
          status,
        });
      return member;
    } catch (err) {
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

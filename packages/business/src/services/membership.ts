//@ts-nocheck
import {InvitationStatus} from '@prisma/client';
import {prisma} from '@glyphx/database';
// import {database} from '@glyphx/types';

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
      status: InvitationStatus.PENDING,
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

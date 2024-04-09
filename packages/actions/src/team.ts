'use server';
import {error, constants} from 'core';
import {getServerSession} from 'next-auth';
import {authOptions} from './auth';
import {databaseTypes} from 'types';
import {workspaceService, membershipService, activityLogService} from '../../business/src/services';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';

/**
 * Update team role
 * @param memberId
 * @param role
 * @returns
 */
export const updateRole = async (
  memberId: string,
  role: databaseTypes.constants.ROLE | databaseTypes.constants.PROJECT_ROLE
) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const member = await membershipService.getMember(memberId);
      await membershipService.updateRole(member?.id!, role);

      await activityLogService.createLog({
        actorId: session?.user?.id,
        resourceId: member?.id!,
        workspaceId: member?.workspace.id,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.MEMBER,
        action: databaseTypes.constants.ACTION_TYPE.ROLE_UPDATED,
      });
      revalidatePath('/[workspaceId]');
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred updating the team role', 'memberId', memberId, err);
    e.publish('team', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Removes member by Id
 * @param memberId
 * @returns
 */
export const removeMember = async (memberId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const member = await membershipService.remove(memberId);
      await activityLogService.createLog({
        actorId: session?.user?.id,
        resourceId: member?.id!,
        workspaceId: member?.workspace.id,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.MEMBER,
        action: databaseTypes.constants.ACTION_TYPE.DELETED,
      });
      revalidatePath('/[workspaceId]');
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error removing the member', 'memberId', memberId, err);
    e.publish('team', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Joins a workspace
 * @param workspaceCode
 */
export const joinWorkspace = async (workspaceCode: string) => {
  let workspaceId;
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const workspace = await workspaceService.joinWorkspace(
        workspaceCode,
        session?.user?.email as string,
        session?.user?.id as string,
        session?.user?.id as string // This will need to be differentiated when we start to track inviteLinks
      );
      workspaceId = workspace?.id;
      await activityLogService.createLog({
        actorId: session?.user?.id,
        resourceId: workspace?.id!,
        workspaceId: workspace?.id,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
        action: databaseTypes.constants.ACTION_TYPE.WORKSPACE_JOINED,
      });
      // FIXME: redirect serverside here
      revalidatePath('/[workspaceId]');
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error joining the workspace', 'workspaceCode', workspaceCode, err);
    e.publish('team', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
  redirect(`/${workspaceId}`);
};

/**
 * Decline Invitation
 * @param memberId
 */
export const declineInvitation = async (memberId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const member = await membershipService.updateStatus(memberId, databaseTypes.constants.INVITATION_STATUS.DECLINED);

      await activityLogService.createLog({
        actorId: session?.user?.id,
        resourceId: memberId,
        workspaceId: member?.workspace.id,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.MEMBER,
        action: databaseTypes.constants.ACTION_TYPE.INVITATION_DECLINED,
      });
    }
    revalidatePath('/[workspaceId]');
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error declining the workspace invitation',
      'memberId',
      memberId,
      err
    );
    e.publish('team', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Accept Invitation
 * @param memberId
 */
export const acceptInvitation = async (memberId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const member = await membershipService.updateStatus(memberId, databaseTypes.constants.INVITATION_STATUS.ACCEPTED);

      await activityLogService.createLog({
        actorId: session?.user?.id,
        resourceId: memberId,
        workspaceId: member?.workspace.id,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.MEMBER,
        action: databaseTypes.constants.ACTION_TYPE.INVITATION_ACCEPTED,
      });
      revalidatePath('/[workspaceId]');
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error accepting the workspace invitation',
      'memberId',
      memberId,
      err
    );
    e.publish('team', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

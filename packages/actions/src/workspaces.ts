'use server';
import {error, constants} from 'core';
import {getServerSession} from 'next-auth';
import {membershipService, workspaceService} from '../../business/src/services';
import {authOptions} from './auth';

/**
 * Get Workspaces
 */
export const getWorkspaces = async () => {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return await workspaceService.getWorkspaces(session?.user?.id!, session?.user?.email as string);
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred getting workspaces', '', {}, err);
    e.publish('workspace', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Get Pending Invitations
 */
export const getPendingInvitations = async () => {
  try {
    const session = await getServerSession(authOptions);
    return await membershipService.getPendingInvitations(session?.user?.email as string);
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred getting pending invitations', '', {}, err);
    e.publish('workspace', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

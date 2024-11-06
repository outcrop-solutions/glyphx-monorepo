'use server';
import {error, constants} from 'core';
import {getServerSession} from 'next-auth';
import {Route} from 'next';
import {membershipService, workspaceService, activityLogService} from '../../business/src/services';
import slugify from 'slugify';
import {authOptions} from './auth';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {databaseTypes, emailTypes} from 'types';
import emailClient from './email';
import Gateway from './auth/Gateway';

/**
 * Get or Create Default Workspace
 * redirect to first workspace or create default workspace and redirect
 */
export const getOrCreateWorkspace = async () => {
  let workspaceId;
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const workspaces = await workspaceService.getWorkspaces(session.user.id, session.user.email as string);
      if (workspaces) {
        workspaceId = workspaces[0].id;
      } else {
        const workspace = await workspaceService.createWorkspace(
          session?.user?.id,
          session?.user.email as string,
          'Default Workspace',
          'default-workspace'
        );
        if (workspace) {
          workspaceId = workspace.id;
        }
      }
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred getting or creating the workspace', '', {}, err);
    e.publish('workspace', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
  redirect(`/workspace/${workspaceId}` as Route);
};

/**
 * Create Workspace
 * @param workspaceId
 * @returns
 */
export const getWorkspace = async (workspaceId: string) => {
  try {
    const session = await getServerSession(authOptions);
    const isAuth = await Gateway.checkWorkspaceAuth(session, workspaceId);
    if (isAuth) {
      return await workspaceService.getSiteWorkspace(workspaceId as string);
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred updating the workspace',
      'workspaceId',
      workspaceId,
      err
    );
    e.publish('workspace', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Create Workspace
 * @param name
 */
export const createWorkspace = async (name: string) => {
  let workspaceId;
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const slug = slugify(name.toLowerCase());
      const workspace = await workspaceService.createWorkspace(
        session?.user?.id,
        session?.user?.email as string,
        name,
        slug
      );

      if (workspace) {
        workspaceId = workspace.id;

        const emailData = {
          type: emailTypes.EmailTypes.WORKSPACE_CREATED,
          workspaceName: workspace!.name,
          workspaceId: workspace!.id as string,
          email: session?.user?.email!,
          workspaceCode: workspace!.workspaceCode,
        } satisfies emailTypes.EmailData;

        await emailClient.init();
        await emailClient.sendEmail(emailData);

        await activityLogService.createLog({
          actorId: session?.user?.id,
          resourceId: workspace?.id!,
          workspaceId: workspace?.id,
          location: '',
          userAgent: {},
          onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
          action: databaseTypes.constants.ACTION_TYPE.CREATED,
        });
      }
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred creating the workspace', 'name', name, err);
    e.publish('workspace', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
  redirect(`/workspace/${workspaceId}`);
};

/**
 * Update Workspace Slug
 * @param workspaceId
 * @param slug
 */
export const updateWorkspaceSlug = async (workspaceId: string, slug: string) => {
  try {
    const session = await getServerSession(authOptions);
    const isAuth = await Gateway.checkWorkspaceAuth(session, workspaceId);
    if (isAuth) {
      await workspaceService.updateWorkspaceSlug(workspaceId as string, slug);
      await activityLogService.createLog({
        actorId: session!.user?.id, // session guranteed bu Gateway
        resourceId: workspaceId!,
        workspaceId: workspaceId,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
        action: databaseTypes.constants.ACTION_TYPE.UPDATED,
      });
      revalidatePath('/[workspaceId]');
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred updating the workspace slug',
      'workspaceId',
      workspaceId,
      err
    );
    e.publish('workspace', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Update Workspace Name
 * @param workspaceId
 * @param name
 * @returns
 */
export const updateWorkspaceName = async (workspaceId: string, name: string) => {
  try {
    const session = await getServerSession(authOptions);
    const isAuth = await Gateway.checkWorkspaceAuth(session, workspaceId);
    if (isAuth) {
      await workspaceService.updateWorkspaceName(session!.user?.id, session?.user?.email as string, name, workspaceId!);
      await activityLogService.createLog({
        actorId: session!.user?.id,
        resourceId: workspaceId as string,
        workspaceId: workspaceId as string,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
        action: databaseTypes.constants.ACTION_TYPE.UPDATED,
      });
      revalidatePath('/[workspaceId]');
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred updating the workspace name',
      'workspaceId',
      workspaceId,
      err
    );
    e.publish('workspace', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Get Members
 * @param workspaceSlug
 * @returns
 */
export const getMembers = async (workspaceSlug: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      return await membershipService.getMembers({slug: workspaceSlug});
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred getting worksapce members',
      'workspaceSlug',
      workspaceSlug,
      err
    );
    e.publish('workspace', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Invite users to a workspace
 * @param workspaceId
 * @param members
 * @returns
 */
export const inviteUsers = async (workspaceId: string, members: any[]) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const retval = await workspaceService.inviteUsers(
        session?.user?.id,
        session?.user?.email as string,
        members,
        workspaceId as string
      );
      if (retval?.workspace) {
        const workspace = retval?.workspace;
        const emailData = {
          type: emailTypes.EmailTypes.WORKSPACE_INVITATION,
          workspaceName: workspace.name,
          emails: members.map((member) => member.email),
          workspaceId: workspace.id!,
          inviteCode: workspace.inviteCode!,
        } satisfies emailTypes.EmailData;
        await emailClient.init();
        emailClient.sendEmail(emailData);
      }
      await activityLogService.createLog({
        actorId: session?.user?.id ?? '',
        resourceId: workspaceId,
        workspaceId: workspaceId,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
        action: databaseTypes.constants.ACTION_TYPE.INVITED,
      });
      revalidatePath('/[workspaceId]');
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred inviting the user to the workspace',
      'workspaceId',
      workspaceId,
      err
    );
    e.publish('workspace', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Delete Workspace
 * @param workspaceId
 * @returns
 */
export const deleteWorkspace = async (workspaceId: string) => {
  try {
    const session = await getServerSession(authOptions);
    const isAuth = await Gateway.checkWorkspaceAuth(session, workspaceId, true);
    if (isAuth) {
      await workspaceService.deleteWorkspace(session!.user.id, session!.user.email as string, workspaceId as string);

      await activityLogService.createLog({
        actorId: session!.user?.id,
        resourceId: workspaceId as string,
        workspaceId: workspaceId,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.WORKSPACE,
        action: databaseTypes.constants.ACTION_TYPE.DELETED,
      });
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred soft deleting the workspace',
      'workspaceId',
      workspaceId,
      err
    );
    e.publish('workspace', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
  redirect('/login');
};

/**
 * Checks if user is team owner
 * @param workspaceId
 * @returns
 */
export const isTeamOwner = async (workspaceId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const workspace = await workspaceService.getWorkspace(session?.user?.email as string, workspaceId as string);

      if (workspace) {
        const isTeamOwner = await workspaceService.isWorkspaceOwner(session?.user?.email as string, workspace);
        const inviteLink = `${process.env.APP_URL || 'http://localhost:3000'}/${workspace?.id}/teams?code=${encodeURI(
          workspace?.inviteCode
        )}`;
        return {isTeamOwner, inviteLink};
      }
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred checking wether the current user is a team owner',
      'workspaceId',
      workspaceId,
      err
    );
    e.publish('workspace', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

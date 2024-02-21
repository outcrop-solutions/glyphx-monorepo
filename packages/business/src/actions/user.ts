'use server';
import {error, constants} from 'core';
import {getServerSession} from 'next-auth';
import {userService, activityLogService} from '../services';
import {databaseTypes, emailTypes} from 'types';
import emailClient from '../email';
import {revalidatePath} from 'next/cache';
import {authOptions} from '../auth';

/**
 * Update user name
 * @param name
 */
export const updateUserName = async (name: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const user = await userService.updateName(session?.user?.id, name);
      await activityLogService.createLog({
        actorId: session?.user?.id,
        resourceId: user.id!,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.USER,
        action: databaseTypes.constants.ACTION_TYPE.UPDATED,
      });
      revalidatePath('/[workspaceId]');
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred updating the user name', 'name', name, err);
    e.publish('user', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Updates user email
 * @param email
 * @returns
 */
export const updateUserEmail = async (email: string) => {
  try {
    const session = await getServerSession(authOptions);

    if (session) {
      const user = await userService.updateEmail(session?.user?.id, email, session?.user?.email as string);

      const emailData = {
        type: emailTypes.EmailTypes.EMAIL_UPDATED,
        oldEmail: session?.user?.email,
        newEmail: email,
      } satisfies emailTypes.EmailData;

      await emailClient.init();
      await emailClient.sendEmail(emailData);

      await activityLogService.createLog({
        actorId: session?.user?.id,
        resourceId: user.id!,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.USER,
        action: databaseTypes.constants.ACTION_TYPE.UPDATED,
      });
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred updating the user email', 'email', email, err);
    e.publish('user', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

const ALLOW_DEACTIVATION = true;
/**
 * Deactivate User
 * @returns
 */
export const deactivateUser = async () => {
  try {
    const session = await getServerSession(authOptions);

    if (session && ALLOW_DEACTIVATION) {
      const user = await userService.deactivate(session?.user?.id);

      await activityLogService.createLog({
        actorId: session?.user?.id,
        resourceId: user.id!,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.USER,
        action: databaseTypes.constants.ACTION_TYPE.DELETED,
      });
    }
    revalidatePath('/[workspaceId]');
    // FIXME: add redirect server side here
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred decativating the user', '', null, err);
    e.publish('user', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

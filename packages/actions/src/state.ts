'use server';
import {error, constants} from 'core';
import {put} from '@vercel/blob';
import {getServerSession} from 'next-auth';
import {stateService, activityLogService, projectService} from '../../business/src/services';
import {databaseTypes, emailTypes, rustGlyphEngineTypes, webTypes} from 'types';
import {authOptions} from './auth';
import {revalidatePath} from 'next/cache';
import emailClient from './email';
import {getToken} from './utils/blobStore';
/**
 * Gets a state by id
 * @param stateId
 */
export const getState = async (stateId: string) => {
  try {
    return await stateService.getState(stateId);
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred getting the state by id', 'stateId', stateId, err);
    e.publish('state', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Creates a new state
 * @param name
 * @param camera
 * @param project
 * @param imageHash
 * @param aspectRatio
 * @param rowIds
 */
export const createState = async (
  name: string,
  camera: rustGlyphEngineTypes.ICameraData,
  project: databaseTypes.IProject,
  imageHash: string,
  aspectRatio: webTypes.Aspect,
  rowIds: number[]
) => {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const state = await stateService.createState(
        name,
        camera,
        project,
        session?.user?.id,
        aspectRatio,
        rowIds as unknown as string[],
        imageHash
      );

      const buffer = Buffer.from(imageHash, 'base64');
      const blob = new Blob([buffer], {type: 'image/png'});

      // upload state imageHash to Blob store
      const imageRetval = await put(`s${state?.id}`, blob, {
        access: 'public',
        addRandomSuffix: false,
        token: getToken(),
      });

      const retval = await projectService.getProject(project.id as string);

      if (retval?.members) {
        const emailData = {
          type: emailTypes.EmailTypes.STATE_CREATED,
          stateName: name,
          stateImage: imageRetval.url,
          emails: retval.members?.map((mem) => mem.email),
          projectId: project.id as string,
        } satisfies emailTypes.EmailData;

        await emailClient.init();
        await emailClient.sendEmail(emailData);
      }

      if (state) {
        await activityLogService.createLog({
          actorId: session?.user?.id,
          resourceId: state?.id!,
          workspaceId: state.workspace.id,
          location: '',
          userAgent: {},
          onModel: databaseTypes.constants.RESOURCE_MODEL.STATE,
          action: databaseTypes.constants.ACTION_TYPE.CREATED,
        });
      }
      revalidatePath(`/project/${project.id}`, 'layout');
      return retval;
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred creating the state', 'project', project, err);
    e.publish('state', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Update State Name
 * @param stateId
 * @param name
 */
export const updateState = async (stateId: string, name: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const state = await stateService.updateState(stateId, name);
      await activityLogService.createLog({
        actorId: session?.user?.id,
        resourceId: state.id!,
        workspaceId: state.project?.workspace?.toString(),
        projectId: state.project.id,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.STATE,
        action: databaseTypes.constants.ACTION_TYPE.UPDATED,
      });
      revalidatePath(`/project/${state.project.id}`, 'layout');
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred updating the state', 'stateId', stateId, err);
    e.publish('state', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Delete a state
 * @param stateId
 */
export const deleteState = async (stateId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const state = await stateService.deleteState(stateId);
      await activityLogService.createLog({
        actorId: session?.user?.id,
        resourceId: state.id!,
        workspaceId: state.project?.workspace?.toString(),
        projectId: state.project.id,
        location: '',
        userAgent: {},
        onModel: databaseTypes.constants.RESOURCE_MODEL.STATE,
        action: databaseTypes.constants.ACTION_TYPE.DELETED,
      });
      revalidatePath(`/project/${state.project.id}`, 'layout');
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred deleting the state', 'stateId', stateId, err);
    e.publish('state', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

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
import {ActionError} from 'core/src/error';
/**
 * Gets a state by id
 * @param stateId
 */
export const getState = async (stateId: string) => {
  try {
    return await stateService.getState(stateId);
  } catch (err) {
    const e = new ActionError('An unexpected error occurred getting the state by id', 'stateId', stateId, err);
    e.publish('state', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Separate function from createState
 * This is to be able to directly pass the binary data using FormData
 * It also allows us to stream it directly instead of incurring the 33% overhead of base64
 * @param formData
 */
export async function uploadFileAction(formData: FormData) {
  try {
    const file = formData.get('file') as Blob | null;
    const stateId = formData.get('stateId') as string;

    console.log({file, stateId});
    if (!file) {
      throw new Error('File is required');
    }

    // stream file to storage
    const blob = await put(`state/${stateId}`, file.stream(), {
      access: 'public', // Make the uploaded file publicly accessible
      addRandomSuffix: false,
      token: getToken(),
    });
    // Return the URL of the uploaded file
    return blob.url;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

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
  formData: FormData,
  name: string,
  camera: rustGlyphEngineTypes.ICameraData,
  projectId: databaseTypes.IProject['id'],
  aspectRatio: webTypes.Aspect,
  rowIds: number[]
) => {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const project = await projectService.getProject(projectId as string);

      if (project?.id) {
        const state = await stateService.createState(
          name,
          camera,
          project,
          session?.user?.id,
          aspectRatio,
          rowIds as unknown as string[]
        );

        if (!state?.id) {
          throw new ActionError('State was not created', 'createState', {state});
        }

        const file = formData.get('file') as Blob | null;
        if (!file) {
          throw new Error('File is required');
        }

        // stream file to storage
        const {url} = await put(`state/${state.id}`, file.stream(), {
          access: 'public', // Make the uploaded file publicly accessible
          addRandomSuffix: false,
          token: getToken(),
        });

        await stateService.updateState(state.id, name, url);
        await projectService.updateProject(project.id, {
          imageHash: url,
        });

        if (project?.members) {
          const emailData = {
            type: emailTypes.EmailTypes.STATE_CREATED,
            stateName: name,
            stateImage: url,
            emails: project.members?.map((mem) => mem.email),
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
          revalidatePath(`/project/${project.id}`, 'layout');
          return {state: state};
        } else {
          throw new ActionError('State was not created', 'createState', {state});
        }
      }
    }
  } catch (err) {
    const e = new ActionError('An unexpected error occurred creating the state', 'project', {projectId}, err);
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
    const e = new ActionError('An unexpected error occurred updating the state', 'stateId', stateId, err);
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
    const e = new ActionError('An unexpected error occurred deleting the state', 'stateId', stateId, err);
    e.publish('state', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

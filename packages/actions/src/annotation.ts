/* eslint-disable turbo/no-undeclared-env-vars */
'use server';
import {error, constants} from 'core';
import {membershipService, projectService, annotationService, stateService} from '../../business/src/services';
import {list, put} from '@vercel/blob';
import {getServerSession} from 'next-auth';
import {databaseTypes, emailTypes} from 'types';
import {authOptions} from './auth';
import {revalidatePath} from 'next/cache';
import emailClient from './email';
import Fuse from 'fuse.js';
import {getToken} from 'utils/getToken';

/**
 * Gets suggested members for combobox
 * @param projectId
 * @returns
 */
export const getSuggestedMembers = async (projectId: string, query: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session && projectId) {
      const project = await projectService.getProject(projectId as string);
      if (project) {
        const members = await membershipService.getMembers({project: project.id});
        const compOptions = {
          // isCaseSensitive: false,
          // includeScore: false,
          // shouldSort: true,
          // includeMatches: false,
          // findAllMatches: false,
          // minMatchCharLength: 1,
          // location: 0,
          // threshold: 0.6,
          // distance: 100,
          // useExtendedSearch: false,
          // ignoreLocation: false,
          // ignoreFieldNorm: false,
          // fieldNormWeight: 1,
          keys: ['email', 'member.name', 'member.username'],
        };
        if (members) {
          const memberFuse = new Fuse(members, compOptions);
          // pull relevant member fields
          const retval = memberFuse.search(query);
          const mentionList = retval.map((mem) => {
            return {
              email: mem.item.email,
              name: mem.item.member.name,
              username: mem.item.member.username,
            };
          });
          return mentionList;
        }
      }
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred getting the suggested memebrs',
      'projectId',
      projectId,
      err
    );
    e.publish('annotations', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Get Project Annotations
 * @param projectId
 * @returns
 */
export const getProjectAnnotations = async (projectId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      return await annotationService.getProjectAnnotations(projectId as string);
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred getting the project annotations',
      'projectId',
      projectId,
      err
    );
    e.publish('annotations', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 *  Get State Annotations
 * @param stateId
 * @returns
 */
export const getStateAnnotations = async (stateId: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      return await annotationService.getStateAnnotations(stateId as string);
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred getting the state annotations',
      'stateId',
      stateId,
      err
    );
    e.publish('annotations', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Create project annotation
 * @param projectId
 * @param value
 */
export const createProjectAnnotation = async (projectId: string, value: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      await annotationService.createProjectAnnotation({
        author: {...session.user} as databaseTypes.IUser,
        projectId: projectId as string,
        value,
      });

      const project = await projectService.getProject(projectId);
      const imageHash = project?.imageHash;
      const latestStateId = project?.stateHistory[0].id;

      // check if the image exists in the blob store
      const retval = await list({prefix: `state/${latestStateId}`, token: getToken()});

      if (imageHash && retval.blobs.length === 0) {
        // for backwards compatiblity, we need to put the state imageHash into the store if it does not already exist
        const buffer = Buffer.from(imageHash, 'base64');
        const blob = new Blob([buffer], {type: 'image/png'});

        // upload imageHash to Blob store
        await put(`state/${latestStateId}`, blob, {
          access: 'public',
          addRandomSuffix: false,
          token: getToken(),
        });
      }

      const members = await membershipService.getMembers({project: projectId});
      if (members && project) {
        const emailData = {
          type: emailTypes.EmailTypes.ANNOTATION_CREATED,
          stateName: project.name,
          stateImage: `https://aqhswtcebhzai9us.public.blob.vercel-storage.com/project/${projectId}`,
          annotation: value,
          emails: [...members.map((mem) => mem.email)],
        } satisfies emailTypes.EmailData;
        await emailClient.init();
        await emailClient.sendEmail(emailData);
      }
      revalidatePath(`/project/${projectId}`, 'layout');
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred creating the project annotation',
      'projectId',
      projectId,
      err
    );
    e.publish('annotations', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Create state annotation
 * @param stateId
 * @param value
 */
export const createStateAnnotation = async (stateId: string, value: string) => {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user) {
      const annotation = await annotationService.createStateAnnotation({
        author: {...session.user} as databaseTypes.IUser,
        stateId: stateId as string,
        value: value as string,
      });

      if (stateId) {
        const state = await stateService.getState(stateId);

        // check if the image exists in the blob store
        const retval = await list({prefix: `state/${state?.id}`, token: getToken()});
        const imageHash = state?.imageHash;

        if (imageHash && retval.blobs.length === 0) {
          // for backwards compatiblity, we need to put the state imageHash into the store if it does not already exist
          const buffer = Buffer.from(imageHash, 'base64');
          const blob = new Blob([buffer], {type: 'image/png'});

          // upload imageHash to Blob store
          await put(`state/${state?.id}`, blob, {
            access: 'public',
            addRandomSuffix: false,
            token: getToken(),
          });
        }

        if (state?.imageHash && annotation?.value) {
          const members = await membershipService.getMembers({project: state.project.id});
          if (members) {
            const emailData = {
              type: emailTypes.EmailTypes.ANNOTATION_CREATED,
              stateName: state.name,
              stateImage: `https://aqhswtcebhzai9us.public.blob.vercel-storage.com/state/${state?.id}`,
              annotation: annotation.value,
              emails: [...members.map((mem) => mem.email)],
            } satisfies emailTypes.EmailData;
            await emailClient.init();
            await emailClient.sendEmail(emailData);
          }
        }

        revalidatePath('/project/[projectId]');
      }
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred creating the state annotation',
      'stateId',
      stateId,
      err
    );
    e.publish('annotations', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

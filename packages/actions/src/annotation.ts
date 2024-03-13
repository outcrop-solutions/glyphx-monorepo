'use server';
import {error, constants} from 'core';
import {membershipService, projectService, annotationService, stateService} from '../../business/src/services';
import {put} from '@vercel/blob';
import {getServerSession} from 'next-auth';
import {databaseTypes, emailTypes} from 'types';
import {authOptions} from './auth';
import {revalidatePath} from 'next/cache';
import emailClient from './email';
import Fuse from 'fuse.js';

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
        if (state?.imageHash && annotation?.value) {
          const members = await membershipService.getMembers({project: state.project.id});
          if (members) {
            const emailData = {
              type: emailTypes.EmailTypes.ANNOTATION_CREATED,
              stateName: state.name,
              stateImage: `https://aqhswtcebhzai9us.public.blob.vercel-storage.com/${state?.id}`,
              annotation: annotation.value,
              emails: [...members.map((mem) => mem.email)],
            } satisfies emailTypes.EmailData;
            await emailClient.init();
            await emailClient.sendEmail(emailData);
          }
        }
      }
      revalidatePath('/project/[projectId]');
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

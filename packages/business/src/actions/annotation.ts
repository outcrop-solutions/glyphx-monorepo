'use server';
import {error, constants} from 'core';
import {Initializer} from '../init';
import {membershipService, projectService} from '../services';

/**
 * Gets suggested members for combobox
 * @param projectId
 * @returns
 */
export const getSuggestedMembers = async (projectId: string) => {
  try {
    await Initializer.init();
    if (projectId) {
      const project = await projectService.getProject(projectId as string);
      if (project) {
        const members = await membershipService.getMembers({project: project.id});
        if (members) {
          return members.map((mem) => ({name: mem?.member?.name, username: mem?.member?.username}));
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
    return {error: e};
  }
};

'use server';
import {error, constants} from 'core';
import {s3Connection} from '../../../business/src/lib';
import {HashResolver} from 'business/src/util/HashResolver';
import {projectService, stateService} from 'business';
import {getServerSession} from 'next-auth';
import {authOptions} from '../auth';
import {signUrls} from './signUrls';
import {ActionError} from 'core/src/error';

/**
 * NOTE: This is currently failing because
 * Created signed url to upload files
 * @param project
 * @param payloadHash
 * @returns
 */
export const signDataUrls = async (projectId: string, stateId: string = '') => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      // the question is whether this project has the filter included or not, as it forms the basis - it does
      const project = await projectService.getProject(projectId);
      const workspaceId = project?.workspace.id;
      // validate
      if (!project) {
        throw new ActionError('no project found', 'signDataUrls', {projectId});
      }
      if (!workspaceId) {
        throw new ActionError('no workspace associated with project found', 'signDataUrls', {projectId});
      }

      // init S3 client
      await s3Connection.init();
      const s3 = s3Connection.s3Manager;

      if (stateId) {
        const state = await stateService.getState(stateId);
        if (!state) {
          throw new ActionError('No state found for stateId', 'etl', {
            project,
            stateId,
          });
        }
        const resolver = new HashResolver(workspaceId, projectId, s3);
        const retval = await resolver.resolve({
          type: 'state',
          state,
        });
        if (!retval) {
          throw new ActionError('No file found for state', 'signDataUrls', {
            workspaceId,
            projectId,
          });
        }
        const {payloadHash} = retval;
        return await signUrls(workspaceId, projectId, payloadHash, s3);
      } else {
        // this hash is calculated after the project has included the state, and so was different than the one calculated in glyphengine
        const resolver = new HashResolver(workspaceId, projectId, s3);
        const retval = await resolver.resolve({
          type: 'project',
          project,
        });
        if (!retval) {
          throw new ActionError('No file found for project', 'signDataUrls', {
            workspaceId,
            projectId,
          });
        }
        const {payloadHash} = retval;
        return await signUrls(workspaceId, projectId, payloadHash, s3);
      }
    } else {
      throw new Error('Not Authorized');
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred running sign data urls', 'etl', {projectId}, err);
    console.dir({err}, {depth: null});

    e.publish('etl', constants.ERROR_SEVERITY.ERROR);
    return {error: e.data};
  }
};

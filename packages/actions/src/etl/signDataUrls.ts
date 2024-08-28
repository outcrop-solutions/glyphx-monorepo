'use server';
import {error, constants} from 'core';
import {s3Connection} from '../../../business/src/lib';
import {hashFiles, hashPayload, oldHashFunction} from 'business/src/util/hashFunctions';
import {projectService, stateService} from 'business';
import {S3Manager} from 'core/src/aws';
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
      // the question is whether this project has the filter included or not, as it forms the basis - id does
      const project = await projectService.getProject(projectId);
      const workspaceId = project?.workspace.id;
      // exit early
      if (!project) {
        throw new ActionError('no project found', 'signDataUrls', {projectId});
      }
      if (!workspaceId) {
        throw new ActionError('no workspace associated with project found', 'signDataUrls', {projectId});
      }
      // init S3 client
      await s3Connection.init();
      const s3Manager = s3Connection.s3Manager;

      if (stateId) {
        const state = await stateService.getState(stateId);
        if (state) {
          const hash = state.payloadHash;
          const checkFile = `client/${workspaceId}/${projectId}/output/${hash}.sgc`;
          const fileExists = await s3Manager.fileExists(checkFile);
          if (fileExists) {
            return await signUrls(workspaceId, projectId, hash, s3Manager);
          } else {
            throw new ActionError('No file found for state', 'etl', {
              project,
              stateId,
              hash,
              checkFile,
              fileExists,
            });
          }
        } else {
          throw new ActionError('No state found for stateId', 'etl', {
            project,
            stateId,
          });
        }
      } else {
        // this hash is calculated after the project has included the state, and so is different than the one calculated in glyphengine
        const newHash = hashPayload(hashFiles(project.files), project);
        const checkNewFile = `client/${workspaceId}/${projectId}/output/${newHash}.sgc`;
        const newFileExists = await s3Manager.fileExists(checkNewFile);
        //  hash exists
        if (newFileExists) {
          return await signUrls(workspaceId, projectId, newHash, s3Manager);
        } else {
          const oldHash = oldHashFunction(hashFiles(project.files), project);
          const checkOldFile = `client/${workspaceId}/${projectId}/output/${oldHash}.sgc`;
          const oldFileExists = await s3Manager.fileExists(checkOldFile);
          if (oldFileExists) {
            return await signUrls(workspaceId, projectId, oldHash, s3Manager);
          } else {
            throw new ActionError('No file found under either hash schemes', 'etl', {
              projectId,
              newFileExists,
              oldFileExists,
              oldHash,
              newHash,
              checkNewFile,
              checkOldFile,
            });
          }
        }
      }
    } else {
      throw new Error('Not Authorized');
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred running sign data urls', 'etl', {projectId}, err);
    e.publish('etl', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

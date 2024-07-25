'use server';
import {error, constants} from 'core';
import {s3Connection} from '../../../business/src/lib';
import {hashFileSystem, hashPayload, oldHashFunction} from 'business/src/util/hashFunctions';
import {projectService} from 'business';
import {S3Manager} from 'core/src/aws';
import {getServerSession} from 'next-auth';
import {authOptions} from '../auth';
import {signUrls} from './signUrls';

/**
 * Created signed url to upload files
 * @param project
 * @param payloadHash
 * @returns
 */
export const signDataUrls = async (projectId: string, isLastState: boolean = false, payloadHash: string = '') => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      const project = await projectService.getProject(projectId);
      const workspaceId = project?.workspace.id;
      if (project && workspaceId) {
        // init S3 client
        await s3Connection.init();
        const s3Manager = s3Connection.s3Manager;
        // open the last known state
        if (isLastState) {
          const idx = project.stateHistory.length - 1;
          const lastState = project.stateHistory[idx];
          const hash = lastState.payloadHash;
          const checkFile = `client/${workspaceId}/${projectId}/output/${hash}.sgc`;
          const fileExists = await s3Manager.fileExists(checkFile);
          if (fileExists) {
            return await signUrls(workspaceId, projectId, hash, s3Manager);
          } else {
            throw new error.ActionError('No file found for last state', 'etl', {
              project,
              lastState,
              hash,
              checkFile,
              fileExists,
            });
          }
        } else if (payloadHash) {
          const checkFile = `client/${workspaceId}/${projectId}/output/${payloadHash}.sgc`;
          const fileExists = await s3Manager.fileExists(checkFile);
          if (fileExists) {
            return await signUrls(workspaceId, projectId, payloadHash, s3Manager);
          } else {
            throw new error.ActionError('No file found for last state', 'etl', {
              project,
              payloadHash,
              checkFile,
              fileExists,
            });
          }
        } else {
          // if hash exists
          const newHash = hashPayload(hashFileSystem(project.files), project);
          const checkNewFile = `client/${workspaceId}/${projectId}/output/${newHash}.sgc`;
          // does file exist?
          const newFileExists = await s3Manager.fileExists(checkNewFile);
          if (newFileExists) {
            return await signUrls(workspaceId, projectId, newHash, s3Manager);
          } else {
            const oldHash = oldHashFunction(hashFileSystem(project.files), project);
            const checkOldFile = `client/${workspaceId}/${projectId}/output/${oldHash}.sgc`;
            // does file exist?
            const oldFileExists = await s3Manager.fileExists(checkOldFile);
            if (oldFileExists) {
              return await signUrls(workspaceId, projectId, oldHash, s3Manager);
            } else {
              throw new error.ActionError('No file found under either hash schemes', 'etl', {
                project,
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

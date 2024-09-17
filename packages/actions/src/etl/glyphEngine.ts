'use server';
import {error, constants} from 'core';
import {generalPurposeFunctions} from 'core';
import {HashResolver} from 'business/src/util/HashResolver';
import {GlyphEngine} from 'glyphengine';
import {processTrackingService, activityLogService, projectService, stateService} from '../../../business/src/services';
import {generateFilterQuery} from '../utils/generateFilterQuery';
import {isValidPayload} from '../utils/isValidPayload';
import {s3Connection, athenaConnection} from '../../../business/src/lib';
import {databaseTypes, fileIngestionTypes, glyphEngineTypes, webTypes} from 'types';
import {getServerSession} from 'next-auth';
import {authOptions} from '../auth';
import {revalidatePath} from 'next/cache';
import {LatestHashStrategy} from 'business/src/util/HashResolver';
import {signUrls} from './signUrls';
/**
 * Call Glyph Engine
 * @param project
 * @param payloadHash
 * @returns
 */
export const glyphEngine = async (project: databaseTypes.IProject, stateId?: string) => {
  try {
    // validate session
    const session = await getServerSession(authOptions);
    if (!session) {
      return {error: 'Not Authorized'};
    }

    // initialize vars
    const workspaceId = project?.workspace.id;
    const projectId = project?.id;

    if (!workspaceId || !projectId) {
      return {error: `Invalid project. projectId: ${projectId}, workspaceId: ${workspaceId}`};
    }
    // init S3 client
    await s3Connection.init();
    const s3 = s3Connection.s3Manager;

    // CASE 1: download existing state
    if (stateId) {
      const state = await stateService.getState(stateId);
      if (!state) {
        return {error: 'No state found for stateId'};
      }
      const resolver = new HashResolver(workspaceId, projectId, s3);
      const retval = await resolver.resolve({
        projectId,
        files: state.fileSystem,
        properties: state.properties,
      });
      if (!retval) {
        return {error: 'No file found for state'};
      }
      const {payloadHash} = retval;
      const urls = await signUrls(workspaceId, projectId, payloadHash, s3);
      return {...urls, isCreate: true};
    }

    // CASE 2: project state exists in its stateHistory and can be resolved
    // validate payload
    if (!isValidPayload(project.state.properties)) {
      return {error: 'Invalid Payload'};
    }

    const updatedProject = await projectService.updateProjectState(projectId, project.state);

    const properties = updatedProject.state.properties;
    const resolver = new HashResolver(workspaceId, projectId, s3);
    const retval = await resolver.resolve({
      projectId,
      files: updatedProject.files,
      properties: properties,
    });

    // project state is already generated, download it
    if (retval) {
      const {payloadHash} = retval;
      const urls = await signUrls(workspaceId, projectId, payloadHash, s3);
      return {...urls, isCreate: true};
    }

    // CASE 3: GlyphEngine needs to be run
    // We can't use the resolver as we have not created the assets yet at this point in the generation cycle
    const s = new LatestHashStrategy();
    const hashPayload = {
      projectId: updatedProject.id!,
      files: updatedProject.files,
      properties: updatedProject.state.properties,
    };
    const payloadHash = s.hashPayload(s.hashFiles(updatedProject.files), hashPayload);

    const payload = {
      model_id: projectId,
      payload_hash: payloadHash,
      client_id: workspaceId,
      // axes
      x_axis: properties[webTypes.constants.AXIS.X]['key'],
      y_axis: properties[webTypes.constants.AXIS.Y]['key'],
      z_axis: properties[webTypes.constants.AXIS.Z]['key'],
      // functions
      x_func: properties[webTypes.constants.AXIS.X]['interpolation'],
      y_func: properties[webTypes.constants.AXIS.Y]['interpolation'],
      z_func: properties[webTypes.constants.AXIS.Z]['interpolation'],
      // direction
      x_direction: properties[webTypes.constants.AXIS.X]['direction'],
      y_direction: properties[webTypes.constants.AXIS.Y]['direction'],
      z_direction: properties[webTypes.constants.AXIS.Z]['direction'],
      // dates & accumulator
      x_date_grouping:
        properties[webTypes.constants.AXIS.X]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.DATE &&
        !properties[webTypes.constants.AXIS.X]['dateGrouping']
          ? glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR
          : properties[webTypes.constants.AXIS.X]['dateGrouping'],
      y_date_grouping:
        properties[webTypes.constants.AXIS.Y]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.DATE &&
        !properties[webTypes.constants.AXIS.Y]['dateGrouping']
          ? glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR
          : properties[webTypes.constants.AXIS.Y]['dateGrouping'],
      accumulatorType: properties[webTypes.constants.AXIS.Z]['accumulatorType'],
      // filter
      filter: generateFilterQuery(properties),
    };

    // Setup process tracking
    const PROCESS_ID = generalPurposeFunctions.processTracking.getProcessId();
    const PROCESS_NAME = 'testingProcessUnique';
    await processTrackingService.createProcessTracking(PROCESS_ID, PROCESS_NAME);

    // construct GlyphEngine
    const glyphEngine = new GlyphEngine(s3, s3, athenaConnection.connection, PROCESS_ID);
    await glyphEngine.init();

    let data: Map<string, string>;
    // @ts-ignore
    data = new Map<string, string>([
      // axes
      ['x_axis', payload['x_axis']],
      ['y_axis', payload['y_axis']],
      ['z_axis', payload['z_axis']],
      // interpolation
      ['x_func', payload['x_func']],
      ['y_func', payload['y_func']],
      ['z_func', payload['z_func']],
      // direction
      ['x_direction', payload['x_direction']],
      ['y_direction', payload['y_direction']],
      ['z_direction', payload['z_direction']],
      // dates and accumulator
      ['x_date_grouping', payload['x_date_grouping']],
      ['y_date_grouping', payload['y_date_grouping']],
      ['accumulatorType', payload['accumulatorType']],
      // model info
      ['model_id', payload['model_id']],
      ['client_id', payload['client_id']],
      ['payload_hash', payload['payload_hash']],
      // filter
      ['filter', payload['filter']],
    ]);
    // process glyph engine
    await glyphEngine.process(data);
    // house keeping
    await activityLogService.createLog({
      actorId: session?.user?.id!,
      resourceId: payload.model_id,
      workspaceId: payload.client_id,
      projectId: payload.model_id,
      location: '',
      userAgent: {},
      onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT,
      action: databaseTypes.constants.ACTION_TYPE.MODEL_GENERATED,
    });
    revalidatePath(`/project/${updatedProject.id}`, 'layout');
    // return signed urls
    const urls = await signUrls(workspaceId, projectId, payloadHash, s3);

    return {...urls, isCreate: true};
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred running glyphengine', 'etl', {project}, err);
    e.publish('etl', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

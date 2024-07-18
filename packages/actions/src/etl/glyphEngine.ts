'use server';
import {error, constants} from 'core';
import {generalPurposeFunctions} from 'core';
import {GlyphEngine} from 'glyphengine';
import {processTrackingService, activityLogService, projectService} from '../../../business/src/services';
import {generateFilterQuery} from '../utils/generateFilterQuery';
import {isValidPayload} from '../utils/isValidPayload';
import {s3Connection, athenaConnection} from '../../../business/src/lib';
import {databaseTypes, fileIngestionTypes, glyphEngineTypes, webTypes} from 'types';
import {getServerSession} from 'next-auth';
import {authOptions} from '../auth';
import {revalidatePath} from 'next/cache';
import {hashFileSystem} from 'business';
import {hashPayload} from 'business/src/util/hashFunctions';

/**
 * Call Glyph Engine
 * @param project
 * @param payloadHash
 * @returns
 */
export const glyphEngine = async (project) => {
  try {
    const session = await getServerSession(authOptions);
    if (session) {
      if (!isValidPayload(project.state.properties)) {
        // fails silently
        return {error: 'Invalid Payload'};
      } else {
        const properties = project.state.properties;
        const payloadHash = hashPayload(hashFileSystem(project.files), project);
        const payload = {
          model_id: project.id,
          payload_hash: payloadHash,
          client_id: project?.workspace.id,
          x_axis: properties[webTypes.constants.AXIS.X]['key'],
          x_date_grouping:
            properties[webTypes.constants.AXIS.X]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.DATE &&
            !properties[webTypes.constants.AXIS.X]['dateGrouping']
              ? glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR
              : properties[webTypes.constants.AXIS.X]['dateGrouping'],
          y_axis: properties[webTypes.constants.AXIS.Y]['key'],
          y_date_grouping:
            properties[webTypes.constants.AXIS.Y]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.DATE &&
            !properties[webTypes.constants.AXIS.Y]['dateGrouping']
              ? glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR
              : properties[webTypes.constants.AXIS.Y]['dateGrouping'],
          z_axis: properties[webTypes.constants.AXIS.Z]['key'],
          accumulatorType: properties[webTypes.constants.AXIS.Z]['accumulatorType'],
          x_func: properties[webTypes.constants.AXIS.X]['interpolation'],
          y_func: properties[webTypes.constants.AXIS.Y]['interpolation'],
          z_func: properties[webTypes.constants.AXIS.Z]['interpolation'],
          x_direction: properties[webTypes.constants.AXIS.X]['direction'],
          y_direction: properties[webTypes.constants.AXIS.Y]['direction'],
          z_direction: properties[webTypes.constants.AXIS.Z]['direction'],
          filter: generateFilterQuery(project),
        };

        // Setup process tracking
        const PROCESS_ID = generalPurposeFunctions.processTracking.getProcessId();
        const PROCESS_NAME = 'testingProcessUnique';
        await processTrackingService.createProcessTracking(PROCESS_ID, PROCESS_NAME);

        // construct GlyphEngine
        await s3Connection.init();
        const glyphEngine = new GlyphEngine(
          s3Connection.s3Manager,
          s3Connection.s3Manager,
          athenaConnection.connection,
          PROCESS_ID
        );
        await glyphEngine.init();

        let data: Map<string, string>;
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
        const {sdtFileName, sgnFileName, sgcFileName} = await glyphEngine.process(data);
        const updatedProject = await projectService.updateProjectState(project.id, project.state);

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

        return {sdtFileName, sgnFileName, sgcFileName, updatedProject};
      }
    } else {
      throw new Error('Not Authorized');
    }
  } catch (err) {
    const e = new error.ActionError('An unexpected error occurred running glyphengine', 'etl', {project}, err);
    e.publish('etl', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

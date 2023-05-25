import type { NextApiRequest, NextApiResponse } from 'next';
import { generalPurposeFunctions } from '@glyphx/core';
import { Session } from 'next-auth';
import { GlyphEngine } from '@glyphx/glyphengine';
import { ATHENA_DB_NAME, S3_BUCKET_NAME } from 'config/constants';
import { processTrackingService, activityLogService, projectService, stateService } from '@glyphx/business';
import { database as databaseTypes, web as webTypes } from '@glyphx/types';
import { formatUserAgent } from 'lib/utils/formatUserAgent';
import { generateFilterQuery } from 'lib/client/helpers';
import { isValidPayload } from 'lib/utils/isValidPayload';
/**
 * Call Glyph Engine
 *
 * @note calls glyph engine
 * @route POST /api/model
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 *
 */

// const isZNumber = (proj) => {
//   // is incoming column both z and an number
//   // is existing z populated and a number
//   return proj.state.properties[webTypes.constants.AXIS.Z].dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER;
// };

// const isETLSafe = (proj): boolean => {
//   const propsSafe = checkProps(proj);
//   const isZNum = isZNumber(proj);
//   return propsSafe && isZNum;
// };

// are there 3 properties dropped for x, y & z?
// export const arePropsAlreadyDroppedSelector = selector<boolean>({
//   key: 'arePropsAlreadyDroppedSelector',
//   get: ({ get }) => {
//     const project = get(projectAtom);
//     const axisArray = Object.values(webTypes.constants.AXIS);
//     let retval = true;
//     for (const axis of axisArray.slice(0, 3)) {
//       const prop = project?.state?.properties[`${axis}`];
//       if (prop?.key === '' || prop?.key.includes('Column ')) {
//         retval = false;
//       }
//     }
//     return retval;
//   },
// });

// is z-axis numeric?
// export const isZAxisNumericSelector = selector<boolean>({
//   key: 'isZAxisNumericSelector',
//   get: ({ get }) => {
//     const project = get(projectAtom);
//     return (
//       project?.state?.properties[webTypes.constants.AXIS.Z].dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER
//     );
//   },
// });

// can we call ETL?
// export const canCallETLSelector = selector<boolean>({
//   key: 'canCallETLSelector',
//   get: ({ get }) => {
//     const propsSafe = get(arePropsAlreadyDroppedSelector);
//     const zAxisNumeric = get(isZAxisNumericSelector);
//     return propsSafe && zAxisNumeric;
//   },
// });

export const glyphEngine = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const { project, isFilter, payloadHash } = req.body;

  if (!isValidPayload(project.state.properties)) {
    // fails silently
    res.status(404).json({ errors: { error: { msg: 'Invalid Payload' } } });
  } else {
    const properties = project.state.properties;

    const payload = {
      model_id: project._id,
      payload_hash: payloadHash,
      client_id: project.workspace._id,
      x_axis: properties[webTypes.constants.AXIS.X]['key'],
      y_axis: properties[webTypes.constants.AXIS.Y]['key'],
      z_axis: properties[webTypes.constants.AXIS.Z]['key'],
      x_func: properties[webTypes.constants.AXIS.X]['interpolation'],
      y_func: properties[webTypes.constants.AXIS.Y]['interpolation'],
      z_func: properties[webTypes.constants.AXIS.Z]['interpolation'],
      x_direction: properties[webTypes.constants.AXIS.X]['direction'],
      y_direction: properties[webTypes.constants.AXIS.Y]['direction'],
      z_direction: properties[webTypes.constants.AXIS.Z]['direction'],
      filter: isFilter
        ? `${generateFilterQuery(properties[webTypes.constants.AXIS.X])} AND ${generateFilterQuery(
            properties[webTypes.constants.AXIS.Y]
          )} AND ${generateFilterQuery(properties[webTypes.constants.AXIS.Z])}`
        : '',
    };

    try {
      // Setup process tracking
      const PROCESS_ID = generalPurposeFunctions.processTracking.getProcessId();
      const PROCESS_NAME = 'testingProcessUnique';
      await processTrackingService.createProcessTracking(PROCESS_ID, PROCESS_NAME);

      // construct GlyphEngine
      const glyphEngine = new GlyphEngine(S3_BUCKET_NAME, S3_BUCKET_NAME, ATHENA_DB_NAME, PROCESS_ID);
      await glyphEngine.init();

      let data: Map<string, string>;
      data = new Map<string, string>([
        ['x_axis', payload['x_axis']],
        ['y_axis', payload['y_axis']],
        ['z_axis', payload['z_axis']],
        ['x_func', payload['x_func']],
        ['y_func', payload['y_func']],
        ['z_func', payload['z_func']],
        ['x_direction', payload['x_direction']],
        ['y_direction', payload['y_direction']],
        ['z_direction', payload['z_direction']],
        ['model_id', payload['model_id']],
        ['client_id', payload['client_id']],
        ['payload_hash', payload['payload_hash']],
        ['filter', payload['filter']],
      ]);

      // process glyph engine
      const { sdtFileName, sgnFileName, sgcFileName } = await glyphEngine.process(data);

      const updatedProject = await projectService.updateProjectState(project._id, project.state);

      const name = new Date().toISOString();
      // add new state to project to prevent redundant glyphengine runs
      const state = await stateService.createState(
        name,
        {
          pos: { x: 0, y: 0, z: 0 },
          dir: { x: 0, y: 0, z: 0 },
        },
        updatedProject._id,
        session.user.userId
      );
      await projectService.addStates(updatedProject._id, [state]);

      const { agentData, location } = formatUserAgent(req);
      await activityLogService.createLog({
        actorId: session?.user?.userId,
        resourceId: payload.model_id,
        workspaceId: payload.client_id,
        projectId: payload.model_id,
        location: location,
        userAgent: agentData,
        onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT,
        action: databaseTypes.constants.ACTION_TYPE.MODEL_GENERATED,
      });

      res.status(200).json({ data: { sdtFileName, sgnFileName, sgcFileName, updatedProject } });
    } catch (error) {
      res.status(404).json({ errors: { error: { msg: error.message } } });
    }
  }
};

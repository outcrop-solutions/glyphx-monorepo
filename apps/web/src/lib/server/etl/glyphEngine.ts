import type {NextApiRequest, NextApiResponse} from 'next';
import {generalPurposeFunctions} from 'core';

import {GlyphEngine} from 'glyphengine';
import {
  processTrackingService,
  activityLogService,
  projectService,
  stateService,
  athenaConnection,
  s3Connection,
} from 'business';
import {databaseTypes, fileIngestionTypes, glyphEngineTypes, webTypes} from 'types';
import {formatUserAgent} from 'lib/utils/formatUserAgent';
import {generateFilterQuery} from 'lib/client/helpers';
import {isValidPayload} from 'lib/utils/isValidPayload';
import {Session} from 'next-auth';
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
  const {project, payloadHash} = req.body;
  console.log({project, payloadHash});

  if (!isValidPayload(project.state.properties)) {
    console.log('INVALID PAYLOAD');
    // fails silently
    res.status(404).json({errors: {error: {msg: 'Invalid Payload'}}});
  } else {
    const properties = project.state.properties;

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

    try {
      // Setup process tracking
      const PROCESS_ID = generalPurposeFunctions.processTracking.getProcessId();
      const PROCESS_NAME = 'testingProcessUnique';
      await processTrackingService.createProcessTracking(PROCESS_ID, PROCESS_NAME);

      // construct GlyphEngine
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

      const name = new Date().toISOString();
      // add new state to project to prevent redundant glyphengine runs
      // const state = await stateService.createState(
      //   name,
      //   {
      //     pos: { x: 0, y: 0, z: 0 },
      //     dir: { x: 0, y: 0, z: 0 },
      //   },
      //   updatedProject.id,
      //   session.user?.id,
      //   { height: 300, width: 300 }
      // );

      const {agentData, location} = formatUserAgent(req);
      await activityLogService.createLog({
        actorId: session?.user?.id!,
        resourceId: payload.model_id,
        workspaceId: payload.client_id,
        projectId: payload.model_id,
        location: location,
        userAgent: agentData,
        onModel: databaseTypes.constants.RESOURCE_MODEL.PROJECT,
        action: databaseTypes.constants.ACTION_TYPE.MODEL_GENERATED,
      });

      res.status(200).json({data: {sdtFileName, sgnFileName, sgcFileName, updatedProject}});
    } catch (error) {
      console.log({error});
      res.status(404).json({errors: {error: {msg: error.message}}});
    }
  }
};

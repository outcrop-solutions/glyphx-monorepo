import type { NextApiRequest, NextApiResponse } from 'next';
import { generalPurposeFunctions } from '@glyphx/core';
import { GlyphEngine } from '@glyphx/glyphengine';
import { ATHENA_DB_NAME, S3_BUCKET_NAME } from 'config/constants';
import { processTrackingService } from '@glyphx/business';
import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
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

const isValidPayload = (properties) => {
  let retval = true;
  const axisArray = Object.values(webTypes.constants.AXIS);
  for (const axis of axisArray.slice(0, 3)) {
    const prop = properties[axis];
    // check if all props have values and Z is numeric
    if (
      prop?.key === '' ||
      prop?.key.includes('Column ') ||
      (axis === webTypes.constants.AXIS.Z && prop.dataType !== fileIngestionTypes.constants.FIELD_TYPE.NUMBER)
    ) {
      retval = false;
    }
  }
  return retval;
};

export const createModel = async (req: NextApiRequest, res: NextApiResponse) => {
  const { axis, column, project } = req.body;

  const deepMerge = {
    ...project,
    state: {
      ...project.state,
      properties: {
        ...project.state.properties,
        [axis]: {
          axis: axis,
          accepts: column.type, //added by DnD Lib
          key: column.key,
          dataType: column.dataType,
          interpolation: project.state.properties[axis].interpolation,
          direction: project.state.properties[axis].direction,
          filter: {
            ...project.state.properties[axis].filter,
          },
        },
      },
    },
  };
  // console.dir({ deepMerge }, { depth: null });

  if (!isValidPayload(deepMerge.state.properties)) {
    // fails silently
    res.status(404).json({ errors: { error: { msg: 'Invalid Payload' } } });
  } else {
    const properties = deepMerge.state.properties;

    const payload = {
      model_id: deepMerge._id,
      // model_id: `642ae3b1c976ba8cc7ac445e`,
      client_id: deepMerge.workspace._id,
      // client_id: 'testclientid02d78bf6f54f485f81295ec510841742',
      // filter: filter,
      x_axis: properties[webTypes.constants.AXIS.X]['key'],
      y_axis: properties[webTypes.constants.AXIS.Y]['key'],
      z_axis: properties[webTypes.constants.AXIS.Z]['key'],
      x_func: properties[webTypes.constants.AXIS.X]['interpolation'],
      y_func: properties[webTypes.constants.AXIS.Y]['interpolation'],
      z_func: properties[webTypes.constants.AXIS.Z]['interpolation'],
      x_direction: properties[webTypes.constants.AXIS.X]['direction'],
      y_direction: properties[webTypes.constants.AXIS.Y]['direction'],
      z_direction: properties[webTypes.constants.AXIS.Z]['direction'],
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
      ]);

      // process glyph engine
      const { sdtFileName, sgnFileName, sgcFileName } = await glyphEngine.process(data);

      res.status(200).json({ data: { sdtFileName, sgnFileName, sgcFileName } });
    } catch (error) {
      res.status(404).json({ errors: { error: { msg: error.message } } });
    }
  }
};

import type { NextApiRequest, NextApiResponse } from 'next';
import { generalPurposeFunctions } from '@glyphx/core';
import { GlyphEngine } from '@glyphx/glyphengine';
import { ATHENA_DB_NAME, S3_BUCKET_NAME } from 'config/constants';
import { processTrackingService } from '@glyphx/business';
/**
 * Call Glyph Engine
 *
 * @note calls glyph engine
 * @route POST /api/model
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 *
 */

export const createModel = async (req: NextApiRequest, res: NextApiResponse) => {
  const { payload } = req.body;
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
      ['type_x', payload['type_x']],
      ['type_y', payload['type_y']],
      ['type_z', payload['type_z']],
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
};

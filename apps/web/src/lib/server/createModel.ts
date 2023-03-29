import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Call Glyph Engine
 *
 * @note calls glyph engine
 * @route POST /api/model
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 *
 */

const GLYPHX_ENGINE_URL = 'https://adj71mzk16.execute-api.us-east-2.amazonaws.com/default/sgx-api-build-model';

export const createModel = async (req: NextApiRequest, res: NextApiResponse) => {
  const { payload } = req.body;
  try {
    const response = await fetch(GLYPHX_ENGINE_URL, {
      method: 'POST',
      // mode: "no-cors",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
      }),
    });
    const resData = await response.json();
    res.status(200).json({ data: { ...resData } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};

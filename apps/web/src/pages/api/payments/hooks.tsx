import { Initializer } from '@glyphx/business';
import { stripeHooks } from 'lib/server';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = { api: { bodyParser: false } };

const hooks = async (req: NextApiRequest, res: NextApiResponse) => {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }
  // execute the appropriate handler
  return stripeHooks(req, res);
};

export default hooks;

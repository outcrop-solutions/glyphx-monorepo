import { Initializer } from '@glyphx/business';
import { stripeHooks } from 'lib/server';

export const config = { api: { bodyParser: false } };

const hooks = async (req, res) => {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }
  // execute the appropriate handler
  return stripeHooks(req, res);
};

export default hooks;

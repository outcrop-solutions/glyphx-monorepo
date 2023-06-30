import { web as webTypes } from '@glyphx/types';
import { Session } from 'next-auth';
import { validateSession, Initializer } from '@glyphx/business';
import { initStripePaymentSession } from 'business/actions';

const payment = async (req, res) => {
  // initialize the business layer
  if (!Initializer.initedField) {
    await Initializer.init();
  }

  // check for valid session
  const session = (await validateSession(req, res)) as Session;
  if (!session.user.userId) return res.status(401).end();

  // execute the appropriate handler
  switch (req.method) {
    case webTypes.constants.HTTP_METHOD.POST:
      return initStripePaymentSession(req, res, session);
    default:
      res.setHeader('Allow', [webTypes.constants.HTTP_METHOD.POST]);
      return res.status(405).json({ error: `${req.method} method unsupported` });
  }
};

export default payment;

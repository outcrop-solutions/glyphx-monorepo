import { buffer } from 'micro';

import { StripeClient, customerPaymentService, Initializer } from '@glyphx/business';

export const config = { api: { bodyParser: false } };

const handler = async (req, res) => {
  if (!Initializer.initedField) {
    await Initializer.init();
  }

  const reqBuffer = await buffer(req);
  const signature = req.headers['stripe-signature'];
  let event = null;

  try {
    event = StripeClient.stripe.webhooks.constructEvent(reqBuffer, signature, process.env.PAYMENTS_SIGNING_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event) {
    const { metadata } = event.data.object;

    switch (event.type) {
      case 'charge.succeeded':
        if (metadata?.customerId && metadata?.type) {
          await customerPaymentService.updateSubscription(metadata.customerId, metadata.type);
        }
        break;
      default:
        res.status(400).send(`Webhook Error: Unhandled event type ${event.type}`);
    }
  } else {
    return res.status(400).send(`Webhook Error: Event not created`);
  }

  res.status(200).send({ received: true });
};

export default handler;

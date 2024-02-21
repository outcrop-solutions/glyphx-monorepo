import type {NextApiRequest, NextApiResponse} from 'next';
import type {Session} from 'next-auth';
import {loadStripe} from '@stripe/stripe-js';
import {buffer} from 'micro';
import {StripeClient, customerPaymentService} from 'business';

export async function redirectToCheckout(sessionId) {
  if (process.env.NEXT_PUBLIC_PUBLISHABLE_KEY) {
    const clientStripe = await loadStripe(process.env.NEXT_PUBLIC_PUBLISHABLE_KEY);
    await clientStripe?.redirectToCheckout({sessionId});
  }
}

/**
 * Stripe Webhook handling
 *
 * @note Handles stripe hooks
 * @route POST /api/payments/hooks
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const stripeHooks = async (req: NextApiRequest, res: NextApiResponse) => {
  const reqBuffer = await buffer(req);
  const signature = req.headers['stripe-signature'];
  let event: any = null;

  try {
    event = StripeClient.stripe.webhooks.constructEvent(reqBuffer, signature, process.env.PAYMENTS_SIGNING_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event) {
    const {metadata} = event.data.object;

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

  res.status(200).send({received: true});
};

/**
 * Stripe Payment Session Initialization
 *
 * @note Handles stripe payment session init
 * @route POST /api/payments/[priceId]
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const initStripePaymentSession = async (req: NextApiRequest, res: NextApiResponse, session: Session) => {
  const {priceId} = req.query;
  const [customerPayment, price] = await Promise.all([
    customerPaymentService.getPayment(session?.user?.email as string),
    StripeClient.stripe.prices.retrieve(priceId),
  ]);
  const product = await StripeClient.stripe.products.retrieve(price.product);
  const lineItems = [
    {
      price: price.id,
      quantity: 1,
    },
  ];
  const paymentSession = await StripeClient.stripe.checkout.sessions.create({
    customer: customerPayment?.paymentId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: `${process.env.APP_URL}/account/payment?status=success`,
    cancel_url: `${process.env.APP_URL}/account/payment?status=cancelled`,
    metadata: {
      customerId: customerPayment?.customer.id,
      type: product.metadata.type,
    },
  });
  res.status(200).json({data: {sessionId: paymentSession.id}});
};

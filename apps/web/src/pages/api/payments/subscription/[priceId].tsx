import { StripeClient, validateSession, customerPaymentService, Initializer } from '@glyphx/business';
import { Session } from 'next-auth';

const handler = async (req, res) => {
  await Initializer.init()
  
  const { method } = req;
  if (method === 'POST') {
    const session = (await validateSession(req, res)) as Session;
    const { priceId } = req.query;
    const [customerPayment, price] = await Promise.all([
      customerPaymentService.getPayment(session?.user?.email),
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
      customer: customerPayment.paymentId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${process.env.APP_URL}/account/payment?status=success`,
      cancel_url: `${process.env.APP_URL}/account/payment?status=cancelled`,
      metadata: {
        customerId: customerPayment.customer._id,
        type: product.metadata.type,
      },
    });
    res.status(200).json({ data: { sessionId: paymentSession.id } });
  } else {
    res.status(405).json({ errors: { error: { msg: `${method} method unsupported` } } });
  }
};

export default handler;

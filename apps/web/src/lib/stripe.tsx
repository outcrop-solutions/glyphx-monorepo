import {loadStripe} from '@stripe/stripe-js';

export async function redirectToCheckout(sessionId) {
  if (process.env.NEXT_PUBLIC_PUBLISHABLE_KEY) {
    const clientStripe = await loadStripe(
      process.env.NEXT_PUBLIC_PUBLISHABLE_KEY
    );
    await clientStripe?.redirectToCheckout({sessionId});
  }
}

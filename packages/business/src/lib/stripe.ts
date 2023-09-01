import {error, constants} from 'core';
import Stripe from 'stripe';

export class StripeClient {
  public static stripe: any;
  public static async init() {
    try {
      StripeClient.stripe = new Stripe(process.env.PAYMENTS_SECRET_KEY ?? '', {
        apiVersion: '2020-08-27',
      });
    } catch (err) {
      const e = new error.UnexpectedError(
        'An unexpected error occurred while initializing the stripe client. See the inner error for additional details',
        err
      );
      e.publish('', constants.ERROR_SEVERITY.ERROR);
      throw e;
    }
  }
  static async createCustomer(email) {
    return await StripeClient.stripe?.customers.create({
      email,
    });
  }

  static async getInvoices(customer) {
    const invoices = await StripeClient.stripe.invoices.list({customer});
    return invoices?.data;
  }

  static async getProducts() {
    const [products, prices] = await Promise.all([
      StripeClient.stripe.products.list(),
      StripeClient.stripe.prices.list(),
    ]);
    const productPrices = {};
    prices?.data.map(price => (productPrices[price.product] = price));
    products?.data.map(product => (product.prices = productPrices[product.id]));
    return products?.data.reverse();
  }
}

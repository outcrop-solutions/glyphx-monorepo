import initStripe from 'stripe';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
// eslint-disable-next-line @typescript-eslint/naming-convention
const stripe = initStripe(process.env.PAYMENTS_SECRET_KEY);

export async function createCustomer(email) {
  return await stripe.customers.create({
    email,
  });
}

export async function getInvoices(customer) {
  const invoices = await stripe.invoices.list({customer});
  return invoices?.data;
}

export async function getProducts() {
  const [products, prices] = await Promise.all([
    stripe.products.list(),
    stripe.prices.list(),
  ]);
  const productPrices = {};
  prices?.data.map(price => (productPrices[price.product] = price));
  products?.data.map(product => (product.prices = productPrices[product.id]));
  return products?.data.reverse();
}

export default stripe;

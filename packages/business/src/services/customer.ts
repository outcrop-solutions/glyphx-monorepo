import {createCustomer} from 'lib/server/stripe';
import {prisma} from '@glyphx/database';

export async function createPaymentAccount(email, customerId) {
  const paymentAccount = await createCustomer(email);
  return await prisma.customerPayment.create({
    data: {
      customerId,
      email,
      paymentId: paymentAccount.id,
    },
  });
}

export async function getPayment(email) {
  return await prisma.customerPayment.findUnique({where: {email}});
}

export async function updateSubscription(customerId, subscriptionType) {
  return await prisma.customerPayment.update({
    data: {subscriptionType},
    where: {customerId},
  });
}

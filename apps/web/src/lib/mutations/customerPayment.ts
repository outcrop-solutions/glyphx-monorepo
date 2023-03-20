import { web as webTypes } from '@glyphx/types';
// CUSTOMER PAYMENT MUTATIONS

/**
 * Creates a new subscription in stripe
 * @note uses customerPaymentService.getPayment() in business package
 * @param priceId corresponds to stripe priceId
 */
export const _createSubscription = (priceId: string): webTypes.IFetchConfig => {
  return {
    url: `/api/payments/subscription/${priceId}`,
    options: {
      method: 'POST',
    },
    successMsg: 'Subscription successfully created',
  };
};

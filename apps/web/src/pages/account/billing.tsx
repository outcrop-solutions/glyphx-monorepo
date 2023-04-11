import { Suspense } from 'react';
import { getSession } from 'next-auth/react';
import { ErrorBoundary } from 'react-error-boundary';

import { StripeClient, customerPaymentService, Initializer } from '@glyphx/business';

import Meta from 'components/Meta';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import { AccountLayout } from 'layouts';
import BillingView from 'views/billing';

import { _createSubscription } from 'lib/client';

const Billing = ({ invoices, products }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      <Suspense fallback={SuspenseFallback}>
        <AccountLayout>
          <Meta title="Glyphx - Billing" />
          <BillingView invoices={invoices} products={products} />
        </AccountLayout>
      </Suspense>
    </ErrorBoundary>
  );
};

export const getServerSideProps = async (context) => {
  if (!Initializer.initedField) {
    await Initializer.init();
  }
  const session = await getSession(context);

  const customerPayment = await customerPaymentService.getPayment(session?.user?.email);

  const [invoices, products] = await Promise.all([
    StripeClient.getInvoices(customerPayment?.paymentId),
    StripeClient.getProducts(),
  ]);
  return {
    props: JSON.parse(
      JSON.stringify({
        invoices,
        products,
      })
    ),
  };
};

export default Billing;

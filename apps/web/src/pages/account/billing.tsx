import { Suspense } from 'react';
import { getSession } from 'next-auth/react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';

import Meta from 'components/Meta';
import { AccountLayout } from 'layouts';
import { _createSubscription } from 'lib/client';
import { StripeClient, customerPaymentService, Initializer } from '@glyphx/business';
import BillingView from 'views/billing';

const Billing = ({ invoices, products }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      {/* Fallback for when data is loading */}
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
  await Initializer.init();
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

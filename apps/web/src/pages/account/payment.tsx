import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import { PublicLayout } from 'layouts';
import Meta from 'components/Meta';
import PaymentView from 'views/payment';

const Payment = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      {/* Fallback for when data is loading */}
      <Suspense fallback={SuspenseFallback}>
        <PublicLayout>
          <Meta title="Glyphx - Subscription Status" />
          <PaymentView />
        </PublicLayout>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Payment;

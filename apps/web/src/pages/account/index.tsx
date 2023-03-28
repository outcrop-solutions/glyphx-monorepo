import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import { AccountLayout } from 'layouts';
import Meta from 'components/Meta';
import WelcomeView from 'views/welcome';

const Welcome = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      {/* Fallback for when data is loading */}
      <Suspense fallback={SuspenseFallback}>
        <AccountLayout>
          <Meta title="Glyphx - Dashboard" />
          <WelcomeView />
        </AccountLayout>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Welcome;

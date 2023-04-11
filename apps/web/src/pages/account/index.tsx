import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Meta from 'components/Meta';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import { AccountLayout } from 'layouts';
import WelcomeView from 'views/welcome';

const Welcome = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
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

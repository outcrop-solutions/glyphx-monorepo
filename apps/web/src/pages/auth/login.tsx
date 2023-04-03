import { AuthLayout } from 'layouts/index';
import LoginView from 'views/login';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import Meta from 'components/Meta/index';

const Login = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      <Suspense fallback={SuspenseFallback}>
        <AuthLayout>
          <Meta title="Glyphx | Login" description="Data exploration for enterprise" />
          <LoginView />
        </AuthLayout>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Login;

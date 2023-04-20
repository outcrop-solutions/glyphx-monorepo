import { Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Meta from 'components/Meta/index';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import AdvancedView from 'views/advanced';
import { AccountLayout } from 'layouts/index';

import { _deleteWorkspace, useWorkspace } from 'lib/client';
import { workspaceAtom } from 'state';
import { useSetRecoilState } from 'recoil';

const Advanced = () => {
  const { data, isLoading } = useWorkspace();
  const setWorkspace = useSetRecoilState(workspaceAtom);

  useEffect(() => {
    if (!isLoading && data) {
      setWorkspace(data?.workspace);
    }
  }, [data, isLoading, setWorkspace]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      <Suspense fallback={SuspenseFallback}>
        <AccountLayout>
          <Meta title={`Glyphx - ${data?.workspace?.name} | Advanced Settings`} />
          <AdvancedView />
        </AccountLayout>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Advanced;

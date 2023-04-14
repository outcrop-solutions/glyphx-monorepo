import { Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import Meta from 'components/Meta/index';
import { AccountLayout } from 'layouts/index';
import GeneralView from 'views/general';
import { _updateWorkspaceName, _updateWorkspaceSlug, useWorkspace } from 'lib/client';
import { useSetRecoilState } from 'recoil';
import { workspaceAtom } from 'state';

const General = () => {
  const { data, isLoading } = useWorkspace();
  const setWorkspace = useSetRecoilState(workspaceAtom);

  useEffect(() => {
    if (!isLoading && !isLoading) {
      setWorkspace(data?.workspace);
    }
  }, [data, isLoading, setWorkspace]);

  return (
    !isLoading && (
      <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
        <Suspense fallback={SuspenseFallback}>
          <AccountLayout>
            <Meta title={`Glyphx - ${data?.workspace?.name} | Settings`} />
            <GeneralView />
          </AccountLayout>
        </Suspense>
      </ErrorBoundary>
    )
  );
};

export default General;

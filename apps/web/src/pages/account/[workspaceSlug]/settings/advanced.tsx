import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Meta from 'components/Meta/index';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import AdvancedView from 'views/advanced';
import { AccountLayout } from 'layouts/index';

import { _deleteWorkspace, useWorkspace } from 'lib/client';
import { workspaceAtom } from 'state';
import { useRecoilValue } from 'recoil';

const Advanced = () => {
  const workspace = useRecoilValue(workspaceAtom);
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      <Suspense fallback={SuspenseFallback}>
        <AccountLayout>
          <Meta title={`Glyphx - ${workspace?.name} | Advanced Settings`} />
          <AdvancedView />
        </AccountLayout>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Advanced;

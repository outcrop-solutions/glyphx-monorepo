import { Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import Meta from 'components/Meta';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import { AccountLayout } from 'layouts';
import TeamView from 'views/team';
import { useWorkspace } from 'lib/client';
import { useSetRecoilState } from 'recoil';
import { workspaceAtom } from 'state';

const Team = ({ isTeamOwner }) => {
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
            <Meta title={`Glyphx - ${data?.workspace?.name} | Team Management`} />
            <TeamView />
          </AccountLayout>
        </Suspense>
      </ErrorBoundary>
    )
  );
};

export default Team;

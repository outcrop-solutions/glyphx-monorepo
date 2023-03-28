import { Suspense } from 'react';
import { getSession } from 'next-auth/react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';

import Meta from 'components/Meta/index';
import { AccountLayout } from 'layouts/index';
import { _updateWorkspaceName, _updateWorkspaceSlug, api } from 'lib';
import { workspaceService, Initializer } from '@glyphx/business';
import GeneralView from 'views/general';

const General = ({ isTeamOwner, workspace }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      {/* Fallback for when data is loading */}
      <Suspense fallback={SuspenseFallback}>
        <AccountLayout>
          <Meta title={`Glyphx - ${workspace.name} | Settings`} />
          <GeneralView isTeamOwner={isTeamOwner} workspace={workspace} />
        </AccountLayout>
      </Suspense>
    </ErrorBoundary>
  );
};

export const getServerSideProps = async (context) => {
  await Initializer.init();
  const session = await getSession(context);
  let isTeamOwner = false;
  let workspace = null;

  if (session) {
    workspace = await workspaceService.getWorkspace(
      session?.user?.userId,
      session?.user?.email,
      context.params.workspaceSlug
    );
    if (workspace) {
      isTeamOwner = await workspaceService.isWorkspaceOwner(session?.user?.email, workspace);
    }
  }

  return {
    props: JSON.parse(
      JSON.stringify({
        isTeamOwner,
        workspace,
      })
    ),
  };
};

export default General;

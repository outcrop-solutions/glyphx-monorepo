import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { getSession } from 'next-auth/react';
import { workspaceService, Initializer } from '@glyphx/business';

import Meta from 'components/Meta';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import { AccountLayout } from 'layouts';
import TeamView from 'views/team';
import { _createMember, _removeMember, _updateRole } from 'lib/client';

const Team = ({ isTeamOwner, workspace }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      <Suspense fallback={SuspenseFallback}>
        <AccountLayout>
          <Meta title={`Glyphx - ${workspace?.name} | Team Management`} />
          <TeamView isTeamOwner={isTeamOwner} workspace={workspace} />
        </AccountLayout>
      </Suspense>
    </ErrorBoundary>
  );
};

export const getServerSideProps = async (context) => {
  if (!Initializer.initedField) {
    await Initializer.init();
  }
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
      workspace.inviteLink = `${process.env.APP_URL}/teams/invite?code=${encodeURI(workspace?.inviteCode)}`;
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

export default Team;

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/react';

import { workspaceService, Initializer } from '@glyphx/business';

import Meta from 'components/Meta/index';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import AdvancedView from 'views/advanced';
import { AccountLayout } from 'layouts/index';

import { _deleteWorkspace, useWorkspace } from 'lib/client';

const Advanced = ({ isCreator }) => {
  const { workspace } = useWorkspace();

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      <Suspense fallback={SuspenseFallback}>
        <AccountLayout>
          <Meta title={`Glyphx - ${workspace?.name} | Advanced Settings`} />
          <AdvancedView isCreator={isCreator} />
        </AccountLayout>
      </Suspense>
    </ErrorBoundary>
  );
};

export const getServerSideProps = async (context) => {
  if (!Initializer.inited) {
    await Initializer.init();
  }
  const session = await getSession(context);
  let isCreator = false;

  if (session) {
    const workspace = await workspaceService.getWorkspace(
      session?.user?.userId,
      session?.user?.email,
      context.params.workspaceSlug
    );
    isCreator = await workspaceService.isWorkspaceCreator(session?.user?.userId, workspace.creator._id);
  }

  return { props: JSON.parse(JSON.stringify({ isCreator })) };
};

export default Advanced;

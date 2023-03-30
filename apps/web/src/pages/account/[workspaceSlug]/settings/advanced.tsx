import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import Meta from 'components/Meta/index';
import { AccountLayout } from 'layouts/index';
import { _deleteWorkspace, useWorkspace } from 'lib/client';
import { workspaceService, Initializer } from '@glyphx/business';
import { getSession } from 'next-auth/react';
import AdvancedView from 'views/advanced';
import { useRouter } from 'next/router';

const Advanced = ({ isCreator }) => {
  const router = useRouter();
  const { workspaceSlug } = router.query;
  const { workspace } = useWorkspace(workspaceSlug);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      {/* Fallback for when data is loading */}
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
  await Initializer.init();
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

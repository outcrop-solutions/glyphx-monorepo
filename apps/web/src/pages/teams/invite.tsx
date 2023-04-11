import React, { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';

import { workspaceService, Initializer } from '@glyphx/business';

import { ErrorFallback, SuspenseFallback } from 'partials/fallback';

import { useSetRecoilState } from 'recoil';
import { workspaceAtom } from 'state';
import InviteView from 'views/invite';

const Invite = ({ workspace }) => {
  // set workspace in recoil
  const setWorkspace = useSetRecoilState(workspaceAtom);
  useMemo(() => setWorkspace(workspace), [setWorkspace, workspace]);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      <Suspense fallback={SuspenseFallback}>
        <InviteView />
      </Suspense>
    </ErrorBoundary>
  );
};

export const getServerSideProps = async (context) => {
  Initializer.init();
  const { code } = context.query;
  const workspace = await workspaceService.getInvitation(code);
  return { props: JSON.parse(JSON.stringify({ workspace })) };
};

export default Invite;

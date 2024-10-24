'use client';
import React from 'react';
import {RecoilRoot} from 'recoil';
import {AuthProviders} from 'app/_components/AuthProviders';
import {workspaceAtom} from 'state';

const WorkspaceProvider = ({workspace, children}) => {
  return (
    <RecoilRoot
      initializeState={({set}) => {
        set(workspaceAtom, workspace);
      }}
    >
      <AuthProviders>{children}</AuthProviders>
    </RecoilRoot>
  );
};

export default WorkspaceProvider;

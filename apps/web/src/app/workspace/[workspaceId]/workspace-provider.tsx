'use client';
import React from 'react';
import {RecoilRoot} from 'recoil';
import {AuthProviders} from 'app/_components/AuthProviders';
import {workspaceAtom} from 'state';
import {Modals} from 'app/_components/Modals';
import {Loading} from 'app/_components/Loaders/Loading';

const WorkspaceProvider = ({workspace, permissions, children}) => {
  return (
    <RecoilRoot
      initializeState={({set}) => {
        set(workspaceAtom, workspace);
      }}
    >
      <AuthProviders permissions={permissions}>
        <Modals />
        <Loading />
        {children}
      </AuthProviders>
    </RecoilRoot>
  );
};

export default WorkspaceProvider;

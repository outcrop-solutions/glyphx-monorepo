'use client';
import React from 'react';
import {useSetRecoilState} from 'recoil';
import {workspaceAtom} from 'state';

const WorkspaceProvider = ({workspace, children}) => {
  const setWorkspace = useSetRecoilState(workspaceAtom);
  setWorkspace(workspace);
  return <>{children}</>;
};

export default WorkspaceProvider;

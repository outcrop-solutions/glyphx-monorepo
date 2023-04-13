import React from 'react';
import { useRouter } from 'next/router';
import { projectControls, workspaceControls } from 'config/menu/controls';

export const Controls = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const pControls = projectControls();
  const wControls = workspaceControls();

  const renderProjectControls = () => {
    return pControls.map((item, idx) => <div key={idx}>{item.component()}</div>);
  };
  const renderWorkspaceControls = () => {
    return wControls.map((item, idx) => <div key={idx}>{item.component()}</div>);
  };

  return (
    <div className="flex justify-end items-center space-x-2">
      {projectId ? renderProjectControls() : renderWorkspaceControls()}
    </div>
  );
};

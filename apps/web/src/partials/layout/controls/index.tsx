import React from 'react';
import { useRouter } from 'next/router';
import { projectControls, workspaceControls, homeControls } from 'config/menu/controls';
import { useSession } from 'next-auth/react';

export const Controls = () => {
  const router = useRouter();
  const { data } = useSession();
  const isGlyphxUser = data?.user?.email?.endsWith('@glyphx.co');
  const { projectId, workspaceSlug } = router.query;
  const pControls = projectControls();
  const wControls = workspaceControls();
  const hControls = homeControls();

  const renderProjectControls = () => {
    if (isGlyphxUser) {
      return pControls
        .filter((_, idx) => idx !== 0 && idx !== 1)
        .map((item, idx) => <div key={idx}>{item.component()}</div>);
    } else {
      return pControls.map((item, idx) => <div key={idx}>{item.component()}</div>);
    }
  };
  const renderWorkspaceControls = () => {
    return wControls.map((item, idx) => <div key={idx}>{item.component()}</div>);
  };
  const renderHomeControls = () => {
    return hControls.map((item, idx) => <div key={idx}>{item.component()}</div>);
  };

  return (
    <div className="flex justify-end items-center space-x-2">
      {projectId ? renderProjectControls() : workspaceSlug ? renderWorkspaceControls() : renderHomeControls()}
    </div>
  );
};

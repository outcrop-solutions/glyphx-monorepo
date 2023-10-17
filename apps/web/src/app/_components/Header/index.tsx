'use client';
import {Controls} from 'app/[workspaceId]/_components/controls';
import {WorkspaceControls} from './WorkspaceControls';
import {ProjectControls} from './ProjectControls';
import {useParams, useSelectedLayoutSegments} from 'next/navigation';

const Header = () => {
  const params = useParams();
  const {workspaceId} = params as {workspaceId: string};
  const segments = useSelectedLayoutSegments();

  // determine which controls to render
  const isProject = workspaceId && segments.includes('project');

  return (
    <>
      {!isProject ? (
        <div
          className={`flex flex-row h-[56px] sticky z-60 top-0 items-center justify-between pr-4 bg-secondary-midnight pl-8 pt-4 mt-0 md:pt-0`}
        >
          <WorkspaceControls />
          <Controls />
        </div>
      ) : (
        <div
          className={`flex flex-row h-[56px] sticky z-60 top-0 items-center justify-between pr-4 bg-secondary-space-blue border-b border-gray pl-8 pt-4 md:pt-0`}
        >
          <ProjectControls />
          <Controls />
        </div>
      )}
    </>
  );
};

export default Header;

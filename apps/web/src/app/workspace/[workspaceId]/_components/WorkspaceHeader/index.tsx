'use client';
import {Controls} from 'app/workspace/[workspaceId]/_components/controls';
import {WorkspaceControls} from './WorkspaceControls';

const WorkspaceHeader = () => {
  return (
    <div
      className={`flex flex-row h-[56px] sticky z-60 top-0 items-center justify-between pr-4 bg-secondary-midnight pl-8 pt-4 mt-0 md:pt-0`}
    >
      <WorkspaceControls />
      <Controls />
    </div>
  );
};

export default WorkspaceHeader;

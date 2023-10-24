'use client';
import {Controls} from 'app/[workspaceId]/_components/controls';
import {ProjectControls} from './ProjectControls';

const Header = () => {
  return (
    <div
      className={`flex flex-row h-[56px] sticky z-60 top-0 items-center justify-between pr-4 bg-secondary-space-blue border-b border-gray pt-4 md:pt-0`}
    >
      <ProjectControls />
      <Controls />
    </div>
  );
};

export default Header;

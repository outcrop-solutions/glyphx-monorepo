'use client';
import {ClientSideSuspense} from '@liveblocks/react';
import {Controls} from 'app/workspace/[workspaceId]/_components/controls';
import {ProjectControls} from './ProjectControls';
import {DocumentHeaderAvatars} from 'collab/components/DocumentHeaderAvatars';
import {useFeatureIsOn} from '@growthbook/growthbook-react';

const Header = () => {
  // check if collab is enabled from growthbook endpoint
  const enabled = useFeatureIsOn('collaboration');
  return (
    <div
      className={`flex flex-row h-[56px] sticky z-60 top-0 items-center justify-between pr-4 bg-secondary-space-blue border-b border-gray pt-4 md:pt-0`}
    >
      <ProjectControls />
      <div className="flex items-center">
        {enabled && (
          <div className="mr-4">
            <ClientSideSuspense fallback={null}>{() => <DocumentHeaderAvatars />}</ClientSideSuspense>
          </div>
        )}
        <Controls />
      </div>
    </div>
  );
};

export default Header;

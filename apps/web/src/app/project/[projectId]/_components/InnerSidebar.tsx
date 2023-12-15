'use client';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {projectSegmentAtom} from 'state';
import {FilesSidebar} from './ProjectSidebar/FilesSidebar';
import {ModelSidebar} from './ProjectSidebar/ModelSidebar';
import {AIThreadsSidebar} from './ProjectSidebar/CollabSidebar';
import {ModelConfigSidebar} from './ProjectSidebar/ModelConfigSidebar';
import {ThreadsSidebar} from './ProjectSidebar/ThreadsSidebar';
import {useFeatureIsOn} from '@growthbook/growthbook-react';

export const InnerSidebar = () => {
  const segment = useRecoilValue(projectSegmentAtom);
  // check if feature is enabled from growthbook endpoint
  const isAIEnabled = useFeatureIsOn('ai');
  const isWebGPUEnabled = useFeatureIsOn('webgpu');

  return (
    <>
      {(() => {
        switch (segment) {
          case 'FILES':
            return <FilesSidebar />;
          case 'MODEL':
            return <ModelSidebar />;
          case 'COLLAB':
            return <ThreadsSidebar />;
          case 'AI':
            return isAIEnabled && <AIThreadsSidebar />;
          case 'CONFIG':
            return isWebGPUEnabled && <ModelConfigSidebar />;
          default:
            break;
        }
      })()}
    </>
  );
};

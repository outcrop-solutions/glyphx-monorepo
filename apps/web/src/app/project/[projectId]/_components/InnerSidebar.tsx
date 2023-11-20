'use client';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {projectSegmentAtom} from 'state';
import {FilesSidebar} from './ProjectSidebar/FilesSidebar';
import {ModelSidebar} from './ProjectSidebar/ModelSidebar';
import {CollabSidebar} from './ProjectSidebar/CollabSidebar';
import {ModelConfigSidebar} from './ProjectSidebar/ModelConfigSidebar';
import {ThreadsSidebar} from './ProjectSidebar/ThreadsSidebar';
import {useEnv} from 'lib/client/hooks';

export const InnerSidebar = () => {
  const segment = useRecoilValue(projectSegmentAtom);
  const {isProd} = useEnv();
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
            return !isProd && <CollabSidebar />;
          case 'CONFIG':
            return !isProd && <ModelConfigSidebar />;
          default:
            break;
        }
      })()}
    </>
  );
};

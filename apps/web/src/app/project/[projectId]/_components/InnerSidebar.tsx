'use client';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {projectSegmentAtom} from 'state';
import {FilesSidebar} from './ProjectSidebar/FilesSidebar';
import {ModelSidebar} from './ProjectSidebar/ModelSidebar';
import {CollabSidebar} from './ProjectSidebar/CollabSidebar';

export const InnerSidebar = () => {
  const segment = useRecoilValue(projectSegmentAtom);
  return (
    <>
      {(() => {
        switch (segment) {
          case 'FILES':
            return <FilesSidebar />;
          case 'MODEL':
            return <ModelSidebar />;
          case 'COLLAB':
            return <CollabSidebar />;
          case 'AI':
            return <CollabSidebar />;
          case 'CONFIG':
            return <CollabSidebar />;
          default:
            break;
        }
      })()}
    </>
  );
};

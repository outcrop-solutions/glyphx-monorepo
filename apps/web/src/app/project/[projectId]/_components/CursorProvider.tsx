'use client';
import React, {useRef} from 'react';
import {ClientSideSuspense} from '@liveblocks/react';
import {Cursors} from 'collab/components/Cursors';
import {useFeatureIsOn} from '@growthbook/growthbook-react';

export const CursorProvider = ({children}) => {
  const projectViewRef = useRef(null);
  // check if collab is enabled from growthbook endpoint
  const enabled = useFeatureIsOn('collaboration');
  return (
    <div ref={projectViewRef} className="flex flex-col h-full w-full overflow-y-auto bg-transparent">
      {enabled && <ClientSideSuspense fallback={null}>{() => <Cursors element={projectViewRef} />}</ClientSideSuspense>}
      {children}
    </div>
  );
};

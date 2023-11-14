'use client';
import React, {useRef} from 'react';
import {ClientSideSuspense} from '@liveblocks/react';
// import {Cursors} from 'collab/components/Cursors';

export const CursorProvider = ({children}) => {
  const projectViewRef = useRef(null);
  return (
    <div ref={projectViewRef} className="flex flex-col h-full w-full overflow-y-auto bg-transparent">
      {/* <ClientSideSuspense fallback={null}>{() => <Cursors element={projectViewRef} />}</ClientSideSuspense> */}
      {children}
    </div>
  );
};

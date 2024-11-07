'use client';
import React from 'react';
// Live Page Structure
import {LiveMap} from '@liveblocks/client';
import {InitialDocumentProvider} from 'collab/lib/client';
import {RoomProvider} from 'liveblocks.config';
import {useInitialize} from 'services/useInitialize';

export enum EVENTS {
  SELECTED_GLYPHS = 'SELECTED_GLYPHS',
  SCREENSHOT_TAKEN = 'SCREENSHOT_TAKEN',
}

export const CollabProvider = ({project, doc, children}: {project: any; doc: any; children: React.ReactNode}) => {
  const {projectViewRef} = useInitialize(project, doc);

  return doc && project ? (
    <RoomProvider
      id={project?.docId as string}
      initialPresence={{cursor: null}}
      // @ts-ignore
      initialStorage={{notes: new LiveMap()}}
    >
      <InitialDocumentProvider initialDocument={doc}>
        <div ref={projectViewRef} className="flex w-full h-full">
          {children}
        </div>
      </InitialDocumentProvider>
    </RoomProvider>
  ) : (
    <div ref={projectViewRef} className="flex w-full h-full">
      {children}
    </div>
  );
};

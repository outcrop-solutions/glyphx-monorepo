import React from 'react';
import {Metadata} from 'next';
import LeftSidebar from './_components/LeftSidebar';
import ProjectHeader from './_components/ProjectHeader';
import {ProjectProvider} from './provider';
import {InnerSidebar} from './_components/InnerSidebar';
import {RightSidebar} from 'app/[workspaceId]/_components/rightSidebar';

export const metadata: Metadata = {
  title: 'Project | Glyphx',
  description: 'Glyphx Project',
};

export default async function ProjectLayout({children}) {
  return (
    <div className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
      <ProjectProvider>
        <LeftSidebar />
        <div className="flex flex-col h-full w-full overflow-y-auto bg-transparent">
          <ProjectHeader />
          <div className="flex flex-row w-full h-full">
            <InnerSidebar />
            {children}
          </div>
        </div>
        <RightSidebar />
      </ProjectProvider>
    </div>
  );
}

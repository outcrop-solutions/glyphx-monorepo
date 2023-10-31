import React from 'react';
import {Metadata} from 'next';
import LeftSidebar from './_components/LeftSidebar';
import ProjectHeader from './_components/ProjectHeader';
import {ProjectProvider} from './provider';
import {InnerSidebar} from './_components/InnerSidebar';
import {RightSidebar} from 'app/[workspaceId]/_components/rightSidebar';
import {ServerDocumentManager} from 'collab/lib/server/ServerDocumentManager';
import {Initializer, projectService} from 'business';
import {notFound} from 'next/navigation';

export const metadata: Metadata = {
  title: 'Project | Glyphx',
  description: 'Glyphx Project',
};

export default async function ProjectLayout({children, params}) {
  const projectId = params.projectId;
  const serverDoc = new ServerDocumentManager();
  await Initializer.init();
  const project = await projectService.getProject(projectId);

  if (!project) {
    notFound();
  }

  const {data} = await serverDoc.getDocument({documentId: project.docId!});

  return (
    <div className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
      <ProjectProvider project={project} doc={data}>
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

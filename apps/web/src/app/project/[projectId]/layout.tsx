import React from 'react';
import {Metadata} from 'next';
import LeftSidebar from './_components/LeftSidebar';
import ProjectHeader from './_components/ProjectHeader';
import ProjectProvider from './project-provider';
import {CollabProvider} from './provider';
import {InnerSidebar} from './_components/InnerSidebar';
import {RightSidebar} from 'app/workspace/[workspaceId]/_components/rightSidebar';
import {ServerDocumentManager} from 'collab/lib/server/ServerDocumentManager';
import {Initializer, projectService, projectTemplateService} from 'business';
import {notFound} from 'next/navigation';
import {CursorProvider} from './_components/CursorProvider';

export const metadata: Metadata = {
  title: 'Project | Glyphx',
  description: 'Glyphx Project',
};

// @ts-ignore
export const maxDuration = 300;

export default async function ProjectLayout({children, params}) {
  const projectId = params.projectId;
  const serverDoc = new ServerDocumentManager();
  await Initializer.init();
  const project = await projectService.getProject(projectId);
  const templates = await projectTemplateService.getProjectTemplates({});
  if (!project) {
    notFound();
  }

  const {data} = await serverDoc.getDocument({documentId: project.docId!});

  return (
    <div className="relative flex flex-col w-screen h-screen space-x-0 text-white md:flex-row bg-secondary-midnight">
      <ProjectProvider project={project} templates={templates}>
        <CollabProvider project={project} doc={data}>
          <LeftSidebar />
          <CursorProvider>
            <ProjectHeader />
            <div className="flex flex-row w-full h-full">
              <InnerSidebar />
              {children}
            </div>
          </CursorProvider>
          <RightSidebar />
        </CollabProvider>
      </ProjectProvider>
    </div>
  );
}

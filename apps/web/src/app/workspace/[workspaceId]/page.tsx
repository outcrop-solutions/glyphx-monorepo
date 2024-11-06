import React from 'react';
import {Initializer, workspaceService} from 'business';
import {GridContainer} from './_components/workspace/GridContainer';
import {PinnedProjects, Templates} from './_components/workspace';
import WorkspaceProvider from './workspace-provider';
import {getServerSession} from 'next-auth';
import {authOptions} from 'actions/src/auth';
import {notFound} from 'next/navigation';

export default async function WorkspacePage({params}) {
  const workspaceId = params?.workspaceId;
  await Initializer.init();
  const session = await getServerSession(authOptions);
  let workspace, projects;

  if (workspaceId) {
    workspace = await workspaceService.getSiteWorkspace(workspaceId);
    projects = workspace?.projects && workspace.projects.filter((proj) => !proj.deletedAt);
  }

  const role = session?.user.teamRoles[workspaceId];

  if (!role) {
    notFound();
  }
  const permissions = {
    isOwner: role === 'owner',
    isMember: role === 'member',
  };

  return (
    workspace && (
      <WorkspaceProvider workspace={workspace} permissions={permissions}>
        <div className="flex flex-col h-full w-full space-y-5 overflow-y-auto bg-transparent">
          <div className="relative flex flex-col w-full h-full">
            <div className="h-full">
              <div className="flex grow relative h-full">
                <div className="w-full flex text-white h-full ">
                  <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
                    <PinnedProjects />
                    {workspace?.projects && workspace.projects.filter((proj) => !proj.deletedAt)?.length > 0 ? (
                      <GridContainer projects={projects} />
                    ) : (
                      <Templates />
                    )}
                  </div>
                  {/* <RightSidebar /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </WorkspaceProvider>
    )
  );
}

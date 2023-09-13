// layout
import {RightSidebar} from './_components/rightSidebar';
import {Initializer, workspaceService} from 'business';
import {GridContainer} from './_components/workspace/GridContainer';
import {PinnedProjects, Templates} from './_components/workspace';

export default async function WorkspacePage({params}) {
  const workspaceId = params?.workspaceId;
  await Initializer.init();
  const workspace = await workspaceService.getSiteWorkspace(workspaceId);

  const projects = workspace?.projects && workspace.projects.filter((proj) => !proj.deletedAt);

  return (
    workspace && (
      <div className="flex flex-col h-full w-full px-5 space-y-5 overflow-y-auto md:px-10 bg-transparent">
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
                <RightSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

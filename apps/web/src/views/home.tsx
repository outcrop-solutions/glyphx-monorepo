import React from 'react';

// Layout
import { PinnedProjects, ProjectDetails } from 'partials';

// Project Overiew
import { Templates } from 'partials';
import { TableView } from 'partials';
import { GridView } from 'partials';
// import { ProjectDetails } from 'partials';

// Hooks
import { useRecoilValue } from 'recoil';
import { projectDetailsAtom, showProjectsGridViewAtom, workspaceAtom } from 'state';

export default function Home() {
  const isGridView = useRecoilValue(showProjectsGridViewAtom);
  const workspace = useRecoilValue(workspaceAtom);
  const projectDetails = useRecoilValue(projectDetailsAtom);
  return (
    <>
      <div className="relative flex flex-col w-full">
        <div className="h-full overflow-y-scroll">
          <div className="flex grow relative h-full">
            <div className="w-full flex text-white">
              <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
                <PinnedProjects />
                {workspace?.projects && workspace?.projects?.length > 0 ? (
                  <>{isGridView ? <GridView /> : <TableView />}</>
                ) : (
                  <Templates />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="right-side-bars" className="">
        {projectDetails ? <ProjectDetails /> : <></>}
      </div>
    </>
  );
}

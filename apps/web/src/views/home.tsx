import React from 'react';

// Layout
import { PinnedProjects, RightSidebar } from 'partials';

// Project Overiew

import { Templates, TableView, GridView } from 'partials';

// Hooks
import { useRecoilValue } from 'recoil';
import { showProjectsGridViewAtom, workspaceAtom } from 'state';

export default function Home() {
  const isGridView = useRecoilValue(showProjectsGridViewAtom);
  const workspace = useRecoilValue(workspaceAtom);

  return (
    <>
      <div className="relative flex flex-col w-full h-full">
        <div className="overflow-y-scroll h-full">
          <div className="flex grow relative h-full">
            <div className="w-full flex text-white h-full ">
              <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
                <PinnedProjects />
                {workspace?.projects && workspace.projects.filter((proj) => !proj.deletedAt)?.length > 0 ? (
                  <>{isGridView ? <GridView /> : <TableView />}</>
                ) : (
                  <Templates />
                )}
              </div>
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

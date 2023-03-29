import React, { useState } from 'react';

// Layout
import { PinnedProjects } from 'partials';

// Project Overiew
import { Templates } from 'partials';
import { TableView } from 'partials';
import { GridView } from 'partials';
import { AddProjectModal } from 'partials';
import { ProjectDetails } from 'partials';

// Hooks
import { useRecoilValue } from 'recoil';
import { showProjectsGridViewAtom, projectDetailsAtom, showAddProjectAtom, workspaceAtom } from 'recoil';

export default function Home() {
  const isGridView = useRecoilValue(showProjectsGridViewAtom);
  const projectDetails = useRecoilValue(projectDetailsAtom);
  const showAddProject = useRecoilValue(showAddProjectAtom);
  const workspace = useRecoilValue(workspaceAtom);
  return (
    <>
      {showAddProject ? <AddProjectModal /> : null}
      {workspace?.projects && workspace?.projects?.length > 0 ? (
        <div className="relative flex flex-col w-full">
          <div className="h-full overflow-y-scroll">
            <div className="flex grow relative h-full">
              <div className="w-full flex text-white">
                <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
                  <PinnedProjects />
                  {isGridView ? <GridView /> : <TableView />}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // <MainDropzone />
        <Templates />
      )}
      <div id="right-side-bars" className="">
        {projectDetails ? <ProjectDetails /> : <></>}
      </div>
    </>
  );
}

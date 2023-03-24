import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { GetServerSideProps } from 'next';
import sortArray from 'sort-array';

// Layout
import { Header, MainDropzone } from 'partials';
import { MainSidebar } from 'partials';
import { Info } from 'partials/info';
import { PinnedProjects } from 'partials';

// Project Overiew
import { Templates } from 'partials';
import { TableView } from 'partials';
import { GridView } from 'partials';
import { AddProjectModal } from 'partials';
import { ProjectDetails } from 'partials';

// Hooks
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isGridViewAtom, projectDetailsAtom, projectsAtom, showAddProjectAtom } from 'state';
import { useRouter } from 'next/router';
import { useProjects } from 'lib/client';
import { SuspenseFallback } from 'partials/fallback';

export default function Home({ workspace }) {
  const router = useRouter();
  // useUser(); //gets user
  // useProjects(); //gets projects assigned to user
  // const projects = useRecoilValue(projectsAtom);
  const isGridView = useRecoilValue(isGridViewAtom);
  const projectDetails = useRecoilValue(projectDetailsAtom);
  const showAddProject = useRecoilValue(showAddProjectAtom);

  const [isLoading, setLoading] = useState(true);

  // if (isLoading) {
  //   return (
  //     <div className="flex flex-col h-screen w-screen">
  //       <SuspenseFallback />
  //     </div>
  //   );
  // } else {
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
        <MainDropzone />
        // <Templates />
      )}
      <div id="right-side-bars" className="">
        {projectDetails ? <ProjectDetails /> : <></>}
      </div>
    </>
  );
}

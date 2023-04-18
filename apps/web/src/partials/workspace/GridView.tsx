import { useEffect } from 'react';
import { ProjectCard } from './ProjectCard';
// import { PinnedProjects } from "./PinnedProjects";
import React from 'react';
import { useRecoilValue } from 'recoil';
import { workspaceAtom } from 'state';

export const GridView = () => {
  const workspace = useRecoilValue(workspaceAtom);

  return (
    <>
      {/* Page header */}
      {/* <PinnedProjects /> */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8 bg-primary-blue ">
        <div className="mb-4 sm:mb-0">
          <p className="font-rubik font-light text-lg leading-[21px] tracking-[0.01em] text-white ">
            Recently Viewed Projects
          </p>
        </div>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-12 gap-6 bg-primary-blue">
        {/* <AddProject /> */}
        {workspace.projects
          .filter((proj) => !proj.deletedAt)
          .map((project, idx) => {
            return <ProjectCard key={project._id.toString()} idx={idx} project={project} />;
          })}
      </div>
    </>
  );
};

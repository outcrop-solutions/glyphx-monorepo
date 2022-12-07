import { useEffect } from "react";
import { ProjectCard } from "./ProjectCard";
import { AddProject } from "./AddProject";
// import { PinnedProjects } from "./PinnedProjects";
import React from "react";
import { useRecoilValue } from "recoil";
import { projectsAtom } from "@/state/app";

export const GridView = () => {
  const projects = useRecoilValue(projectsAtom);
  return (
    <>
      {/* Page header */}
      {/* <PinnedProjects /> */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8 bg-primary-blue ">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <p className="font-rubik font-light text-lg leading-[21px] tracking-[0.01em] text-white ">
            Recently Viewed Projects
          </p>
        </div>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-12 gap-6 bg-primary-blue">
        {/* <AddProject /> */}
        {projects.map((item, idx) => {
          return (
            <ProjectCard
              idx={idx}
              key={item.id}
              project={item}
              updatedAt={item.updatedAt}
              name={item.name}
            />
          );
        })}
      </div>
    </>
  );
};

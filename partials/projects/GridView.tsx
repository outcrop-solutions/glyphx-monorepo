import { ProjectCard } from "./ProjectCard";
import { AddProject } from "./AddProject";
import { PinnedProjects } from "./PinnedProjects";
import React from "react";
import { useRecoilValue } from "recoil";
import { projectsSelector } from "@/state/globals";

export const GridView = () => {
  const projects = useRecoilValue(projectsSelector);
  return (
    <>
      {/* Page header */}
      <PinnedProjects />
      <div className="sm:flex sm:justify-between sm:items-center mb-8 bg-primary-blue">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl md:text-2xl text-white font-thin">
            Recent Projects
          </h1>
        </div>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-12 gap-6 bg-primary-blue">
        <AddProject />
        {projects.map((item, idx) => {
          return (
            <ProjectCard
              idx={idx}
              key={item.id}
              project={item}
              updatedAt={item.updatedAt}
              name={item.name}
              link={"#0"}
            />
          );
        })}
      </div>
    </>
  );
};

import ProjectCard from "./ProjectCard";

import { AddProject } from "./AddProject";

export const GridView = ({
  user,
  projects,
  setProject,
  fetchProjects,
  showAddProject,
  setShowAddProject,
}) => {
  return (
    <>
      {/* Page header */}
      <div className="sm:flex sm:justify-between sm:items-center mb-8">
        {/* Left: Title */}
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl md:text-2xl text-white font-thin">
            Recently Used Templates
          </h1>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-12 gap-6">
        {/* <AddProject setShowAddProject={setShowAddProject} /> */}
        {projects.map((item, idx) => {
          return (
            <ProjectCard
              key={item.id}
              project={item}
              setProject={setProject}
              idx={idx}
              updatedAt={item.updatedAt}
              id={item.id}
              name={item.name}
              link={"#0"}
              description={item.description}
            />
          );
        })}
      </div>
    </>
  );
};

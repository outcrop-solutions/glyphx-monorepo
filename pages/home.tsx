import React, { useState, useEffect, useCallback } from "react";
import { GetServerSideProps } from "next";
import QWebChannel from "qwebchannel";
import update from "immutability-helper";
import * as dayjs from "dayjs";
import sortArray from "sort-array";
// Amplify
import { API, withSSRContext, graphqlOperation, Storage } from "aws-amplify";

import { listProjects } from "graphql/queries";
import { createProject } from "graphql/mutations";
import { ListProjectsQuery } from "../API";

// Layout
import { Header } from "partials";
import { MainSidebar } from "partials";

// Project Overiew
import { Templates } from "partials";
import { TableView } from "partials";
import { GridView } from "partials";
import { AddProjectModal } from "partials";
import { ProjectDetails } from "partials";

// Hooks
import { useProjects } from "services/useProjects";
import { useUser } from "services/useUser";
import { useStateChange } from "services/useStateChange";
import { useFileSystem } from "services/useFileSystem";
import { useStates } from "services/useStates";
import { updateProject } from "../graphql/mutations";

export default function Projects({
  userData,
  authenticated,
  data,
  // setProjects,
}) {
  const { projects, setProjects } = useProjects(data);
  const { user, setUser } = useUser(userData);
  const [error, setError] = useState(null);
  const [grid, setGrid] = useState(null);
  const [project, setProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);

  const { states, state, setState, deleteState, setStates } =
    useStates(project);
  useStateChange(state);

  const [showAddProject, setShowAddProject] = useState(false);

  
  return (
    <div className="flex h-screen w-screen scrollbar-none bg-primary-dark-blue">
      {showAddProject ? (
        <AddProjectModal user={user} setShowAddProject={setShowAddProject} />
      ) : null}
      {/* Sidebar */}
      <MainSidebar
        project={project}
        user={user}
      />
      {projectDetails ? (
        <ProjectDetails
          user={user}
          projectDetails={projectDetails}
          setProjectDetails={setProjectDetails}
        />
      ) : null}
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden scrollbar-none bg-primary-dark-blue">
        {/*  Site header */}
        <Header
          project={project}
          setProject={setProject}
          setShowAddProject={setShowAddProject}
          grid={grid}
          setGrid={setGrid}
        />
        {/* <hr className={project ? "mx-0" : "mx-6"} /> */}
        <main className="h-full">
          <div className="flex grow relative h-full">
            <div className="w-full flex">
              {projects && projects.length > 0 ? (
                <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
                  {grid ? (
                    <TableView user={user} projects={projects} />
                  ) : (
                    <GridView
                      user={user}
                      projects={projects}
                      setProjects={setProjects}
                      setProject={setProject}
                      setProjectDetails={setProjectDetails}
                      setShowAddProject={setShowAddProject}
                    />
                  )}
                </div>
              ) : (
                <Templates
                  userData={userData}
                  setProject={setProject}
                  setProjects={setProjects}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { Auth } = await withSSRContext(context);
  const SSR = withSSRContext({ req: context.req });

  try {
    const user = await Auth.currentAuthenticatedUser();
    const response = (await SSR.API.graphql(
      graphqlOperation(listProjects)
    )) as {
      data: ListProjectsQuery;
    };
    const filtered = response.data.listProjects.items.filter(
      (el) => el?.shared?.includes(user.username) || el.author === user.id
    );
    let sorted = sortArray(filtered, {
      by: "updatedAt",
      order: "desc",
    });
    return {
      props: {
        authenticated: true,
        userData: JSON.stringify(user),
        data: sorted,
      },
    };
  } catch (error) {
    return {
      props: {
        authenticated: false,
      },
    };
  }
};

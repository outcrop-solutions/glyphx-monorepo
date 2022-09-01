import React, { useState, useEffect, useCallback } from "react";
import { GetServerSideProps } from "next";
import sortArray from "sort-array";
// Amplify
import { withSSRContext, graphqlOperation } from "aws-amplify";

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
import { useRecoilState, useRecoilValue } from "recoil";
import { isGridViewAtom, projectsAtom, showAddProjectAtom } from "../state";

export default function Projects({
  userData,
  authenticated,
  data,
  // setProjects,
}) {
  const projects = useRecoilValue(projectsAtom);
  const isGridView = useRecoilValue(isGridViewAtom);
  const { user, setUser } = useUser(userData);

  const [projectDetails, setProjectDetails] = useState(null);

  const [showAddProject, setShowAddProject] =
    useRecoilState(showAddProjectAtom);

  return (
    <div className="flex h-screen w-screen scrollbar-none bg-primary-dark-blue">
      {showAddProject ? (
        <AddProjectModal user={user} setShowAddProject={setShowAddProject} />
      ) : null}
      {/* Sidebar */}
      <MainSidebar user={user} />
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
        <Header setShowAddProject={setShowAddProject} />
        {/* <hr className={project ? "mx-0" : "mx-6"} /> */}
        <main className="h-full">
          <div className="flex grow relative h-full">
            <div className="w-full flex">
              {projects && projects.length > 0 ? (
                <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
                  {isGridView ? (
                    <TableView user={user} />
                  ) : (
                    <GridView setProjectDetails={setProjectDetails} />
                  )}
                </div>
              ) : (
                <Templates userData={userData} />
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
    console.log({ filtered });
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

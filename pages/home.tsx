import React from "react";
import { GetServerSideProps } from "next";
import sortArray from "sort-array";

// Amplify
import { withSSRContext, graphqlOperation } from "aws-amplify";

import { listProjects } from "graphql/queries";
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
import { useRecoilState, useRecoilValue } from "recoil";
import {
  isGridViewAtom,
  projectDetailsAtom,
  projectsAtom,
  showAddProjectAtom,
} from "../state";

export default function Projects({
  userData,
  data,
  // authenticated,
  // setProjects,
}) {
  const [projects, setProjects] = useRecoilState(projectsAtom);
  setProjects(data);

  const isGridView = useRecoilValue(isGridViewAtom);
  const projectDetails = useRecoilValue(projectDetailsAtom);
  const showAddProject = useRecoilValue(showAddProjectAtom);

  return (
    <div className="flex h-screen w-screen scrollbar-none bg-primary-dark-blue">
      {showAddProject ? <AddProjectModal /> : null}
      <MainSidebar />
      {projectDetails ? <ProjectDetails /> : null}
      <div className="relative flex flex-col flex-1 overflow-hidden bg-primary-dark-blue scrollbar-none">
        {/*  Site header */}
        <Header />
        <main className="h-full overflow-y-scroll">
          <div className="flex grow relative h-full">
            <div className="w-full flex">
              {projects && projects.length > 0 ? (
                <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
                  {isGridView ? <TableView /> : <GridView />}
                </div>
              ) : (
                <Templates />
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

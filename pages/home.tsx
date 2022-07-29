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
import { useStateChange } from "services/useStateChange";
import { useFileSystem } from "services/useFileSystem";
import { useStates } from "services/useStates";
import { updateProject } from "../graphql/mutations";

let socket = null;

export default function Projects({
  user,
  authenticated,
  data,
  // setProjects,
}) {
  const { projects, setProjects } = useProjects(data);
  const [error, setError] = useState(null);
  const [grid, setGrid] = useState(null);
  const [project, setProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);

  const { states, state, setState, deleteState, setStates } =
    useStates(project);
  useStateChange(state);

  const [showAddProject, setShowAddProject] = useState(false);
  const [sendDrawerPositionApp, setSendDrawerPositionApp] = useState(false);

  useEffect(() => {
    var baseUrl = "ws://localhost:12345";
    openSocket(baseUrl);
  }, []);
  const openSocket = (baseUrl) => {
    if (!socket) {
      socket = new WebSocket(baseUrl);
    }
    socket.onclose = function () {
      console.error("web channel closed");
    };
    socket.onerror = function (error) {
      console.error("web channel error: " + error);
    };
    socket.onopen = function () {
      console.log("WebSocket connected, setting up QWebChannel.");
      new QWebChannel.QWebChannel(socket, function (channel) {
        try {
          // make core object accessible globally
          window.core = channel.objects.core;
          window.core.KeepAlive.connect(function (message) {
            //Issued every 30 seconds from Qt to prevent websocket timeout
            console.log(message);
          });
          window.core.GetDrawerPosition.connect(function (message) {
            setSendDrawerPositionApp(true);
          });

          //core.ToggleDrawer("Toggle Drawer"); 	// A Show/Hide toggle for the Glyph Drawer
          //core.ResizeEvent("Resize Event");		// Needs to be called when sidebars change size
          //core.UpdateFilter("Update Filter");	// Takes a SQL query based on current filters
          //core.ChangeState("Change State");		// Takes the Json information for the selected state
          //core.ReloadDrawer("Reload Drawer");	// Triggers a reload of the visualization currently in the drawer. This does not need to be called after a filter update.
        } catch (e) {
          console.error(e.message);
        }
      });
    };
  };
  return (
    <div className="flex h-screen max-w-screen scrollbar-none bg-primary-dark-blue">
      {showAddProject ? (
        <AddProjectModal user={user} setShowAddProject={setShowAddProject} />
      ) : null}
      {/* Sidebar */}
      <MainSidebar
        project={project}
        setProject={setProject}
        user={user}
        // sidebarOpen={sidebarOpen}
        // setSidebarOpen={setSidebarOpen}
      />
      {projectDetails ? (
        <ProjectDetails
          user={user}
          projectDetails={projectDetails}
          setProjectDetails={setProjectDetails}
        />
      ) : null}
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto scrollbar-none bg-primary-dark-blue">
        {/*  Site header */}
        <Header
          project={project}
          setProject={setProject}
          setShowAddProject={setShowAddProject}
          grid={grid}
          setGrid={setGrid}
        />
        <hr className={project ? "mx-0" : "mx-6"} />
        <main className="h-full">
          <div className="flex grow relative h-full">
            <div className="w-full flex">
              {data && data.length > 0 ? (
                <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
                  {grid ? (
                    <TableView
                      setProjectDetails={setProjectDetails}
                      user={user}
                      projects={projects}
                      setProject={setProject}
                    />
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
                  setProject={setProject}
                  setProjects={setProjects}
                  user={user}
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
        user: JSON.stringify(user),
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

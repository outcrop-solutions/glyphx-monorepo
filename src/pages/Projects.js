import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import QWebChannel from "qwebchannel";

import Header from "../partials/header";
import TableView from "../partials/projects/TableView";
import { GridView } from "../partials/projects/GridView";
import { ProjectSidebar } from "../partials/sidebars/project";
import { CommentsSidebar } from "../partials/sidebars/comments";
import { MainSidebar } from "../partials/sidebars/main";
import { useUrl } from "../services/useUrl";
import { useStateChange } from "../services/useStateChange";
import { useFileSystem } from "../services/useFileSystem";
import { useFilterChange } from "../services/useFilterChange";
import { Datagrid } from "../partials/datagrid";
import { AddFiles } from "../partials/addFiles.js";
import { Templates } from "../partials/projects/Templates";
import { Invite } from "../partials/invite";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import update from "immutability-helper";

import { usePosition } from "../services/usePosition";

let socket = null;
// import { Horizontal } from '../partials/dnd/Pages'

export const Projects = ({ user, setIsLoggedIn, projects }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [grid, setGrid] = useState(false);
  const [state, setState] = useState(null);
  const [project, setProject] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState([]);
  const [showAddProject, setShowAddProject] = useState(false);

  const { isStateChanged } = useStateChange(state);
  const { isFilterChanged } = useFilterChange(filtersApplied);
  // pass signed url
  const { isUrlSigned } = useUrl(project);
  const location = useLocation();
  const [sendDrawerPositionApp, setSendDrawerPositionApp] = useState(false);

  // comments and filter sidebar positions
  // position state can be destructured as follows... { bottom, height, left, right, top, width, x, y } = position
  //position state dynamically changes with transitions
  const [commentsPosition, setCommentsPosition] = useState({});
  const [filterSidebarPosition, setFilterSidebarPosition] = useState({});
  useEffect(() => {
    if (sendDrawerPositionApp) {
      window.core.SendDrawerPosition(
        JSON.stringify({
          filterSidebar: filterSidebarPosition.values,
          commentsSidebar: commentsPosition.values,
        })
      );
      // setSendDrawerPositionApp(false)
    }
  }, [commentsPosition, filterSidebarPosition, sendDrawerPositionApp]);

  useEffect(() => {
    var baseUrl = "ws://localhost:12345";
    openSocket(baseUrl);
  }, [location.pathname]);
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

  // projectSidebar state and utilities
  const [projectSidebarOpen, setProjectSidebarOpen] = useState(true);
  const [showCols, setShowCols] = useState(false);
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const projPosition = usePosition(sidebar);
  const storedSidebarExpanded = localStorage.getItem(
    "project-sidebar-expanded"
  );
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  useEffect(() => {
    setSidebarExpanded(true);
  }, [project]);
  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });
  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!sidebarOpen || keyCode !== 219) return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });
  //handle sidebar state in localStorage
  useEffect(() => {
    localStorage.setItem("project-sidebar-expanded", sidebarExpanded);
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("project-sidebar-expanded");
    } else {
      document
        .querySelector("body")
        .classList.remove("project-sidebar-expanded");
    }
  }, [sidebarExpanded]);
  // set projectsSidebar position on transition
  useEffect(() => {
    setFilterSidebarPosition((prev) => {
      if (sidebar.current !== null) {
        return {
          values: sidebar.current.getBoundingClientRect(),
        };
      }
    });
  }, [sidebarExpanded, projPosition]);
  const handleStateChange = (state) => {
    setState((prev) => {
      let data = state;
      return data;
    });
  };

  //data grid state
  const [dataGrid, setDataGrid] = useState({ rows: [], columns: [] });
  const [propertiesArr, setPropertiesArr] = useState([
    { axis: "Z", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "X", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "Y", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "1", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "2", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "3", accepts: "COLUMN_DRAG", lastDroppedItem: null },
  ]);
  const [droppedProps, setDroppedProps] = useState([]);
  const isDropped = (propName) => {
    return droppedProps.indexOf(propName) > -1;
  };
  const handleDrop = useCallback(
    (index, item) => {
      const { key } = item;
      setDroppedProps(
        update(droppedProps, key ? { $push: [key] } : { $push: [] })
      );
      setPropertiesArr(
        update(propertiesArr, {
          [index]: {
            lastDroppedItem: {
              $set: item,
            },
          },
        })
      );
    },
    [droppedProps, propertiesArr]
  );

  const [isEditing, setIsEditing] = useState(false);
  const [share, setShare] = useState(false);
  const { fileSystem, setFiles } = useFileSystem(project);

  return (
    <div className="flex h-screen overflow-hidden scrollbar-none bg-gray-900">
      {/* Sidebar */}
      <MainSidebar
        project={project}
        setProject={setProject}
        user={user}
        setIsLoggedIn={setIsLoggedIn}
        // sidebarOpen={sidebarOpen}
        // setSidebarOpen={setSidebarOpen}
      />

      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto scrollbar-none overflow-x-hidden">
        {/*  Site header */}
        <Header
          project={project}
          setProject={setProject}
          showAddProject={showAddProject}
          setShowAddProject={setShowAddProject}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          grid={grid}
          setGrid={setGrid}
          setShare={setShare}
        />

        <main className="h-full">
          <div className="flex relative h-full">
            {project ? (
              <>
                <DndProvider backend={HTML5Backend}>
                  <ProjectSidebar
                    fileSystem={fileSystem}
                    setFiles={setFiles}
                    setDataGrid={setDataGrid}
                    sidebar={sidebar}
                    sidebarOpen={sidebarOpen}
                    sidebarExpanded={sidebarExpanded}
                    setSidebarExpanded={setSidebarExpanded}
                    project={project}
                    isEditing={isEditing}
                    propertiesArr={propertiesArr}
                    filtersApplied={filtersApplied}
                    setFiltersApplied={setFiltersApplied}
                    handleStateChange={handleStateChange}
                    showCols={showCols}
                    setShowCols={setShowCols}
                    handleDrop={handleDrop}
                  />
                  <div className="w-full h-full flex">
                    <div className={`min-w-0 flex-auto overflow-auto`}>
                      {share ? (
                        <Invite setShare={setShare} />
                      ) : (
                        <div className="overflow-x-auto flex-col mx-auto">
                          {fileSystem && fileSystem.length ? (
                            <Datagrid
                              isDropped={isDropped}
                              setIsEditing={setIsEditing}
                              dataGrid={dataGrid}
                              setDataGrid={setDataGrid}
                            />
                          ) : null}
                        </div>
                      )}
                      {fileSystem && fileSystem.length ? null : (
                        <AddFiles
                          setDataGrid={setDataGrid}
                          project={project}
                          fileSystem={fileSystem}
                          setFileSystem={setFiles}
                        />
                      )}
                    </div>
                    <CommentsSidebar
                      user={user}
                      project={project}
                      setCommentsPosition={setCommentsPosition}
                    />
                  </div>
                </DndProvider>
              </>
            ) : (
              <>
                {false ? (
                  <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
                    {grid ? (
                      <TableView
                        user={user}
                        projects={projects}
                        setProject={setProject}
                      />
                    ) : (
                      <GridView
                        showAddProject={showAddProject}
                        setShowAddProject={setShowAddProject}
                        user={user}
                        projects={projects}
                        setProject={setProject}
                      />
                    )}
                  </div>
                ) : (
                  <Templates setProject={setProject} user={user} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

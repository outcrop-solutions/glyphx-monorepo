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
import { Storage } from "aws-amplify";
import update from "immutability-helper";
import { useStates } from "../services/useStates";

let socket = null;
// import { Horizontal } from '../partials/dnd/Pages'

export const Projects = ({ user, setIsLoggedIn, projects }) => {
  const [grid, setGrid] = useState(false);
  // const [state, setState] = useState(null);

  const [project, setProject] = useState(false);
  const { states, state, setState, setStates } = useStates(project);
  useStateChange(state);

  const [showAddProject, setShowAddProject] = useState(false);

  const { isStateChanged } = useStateChange(state);

  // pass signed url
  // const { isUrlSigned } = useUrl(project);
  const location = useLocation();
  const [sendDrawerPositionApp, setSendDrawerPositionApp] = useState(false);

  // comments and filter sidebar positions
  // position state can be destructured as follows... { bottom, height, left, right, top, width, x, y } = position
  //position state dynamically changes with transitions
  const [commentsPosition, setCommentsPosition] = useState({});
  const [filterSidebarPosition, setFilterSidebarPosition] = useState({});

  // useEffect(() => {
  //   console.log({ filterSidebarPosition, commentsPosition });
  // }, [filterSidebarPosition, commentsPosition]);

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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  // projectSidebar state and utilities
  const [showCols, setShowCols] = useState(false);
  const storedSidebarExpanded = localStorage.getItem(
    "project-sidebar-expanded"
  );
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
  );

  useEffect(() => {
    if (sendDrawerPositionApp) {
      // console.log({ filterSidebarPosition, commentsPosition });
      window.core.SendDrawerPosition(
        JSON.stringify({
          filterSidebar: filterSidebarPosition.values,
          commentsSidebar: commentsPosition.values,
        })
      );
      // setSendDrawerPositionApp(false)
    }
  }, [commentsPosition, filterSidebarPosition, sendDrawerPositionApp]);
  const handleStateChange = (state) => {
    setState((prev) => {
      let data = state;
      return data;
    });
  };

  //data grid state
  const [dataGrid, setDataGrid] = useState({ rows: [], columns: [] });
  const [propertiesArr, setPropertiesArr] = useState([
    { axis: "X", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "Y", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "Z", accepts: "COLUMN_DRAG", lastDroppedItem: null },
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

  const [full, setFull] = useState(false);
  // listen to properties array drops and call ETL on XYZ full
  useEffect(() => {
    // check if xyz are populated
    // if yes set "full" to true, show spinner and call etl endpoint
    // take signedurl response and pass to Bryan
    // if no, do nothing
    const handleETL = async () => {
      let propsArr = propertiesArr.filter((item) => item.lastDroppedItem);
      let filterArr = propertiesArr
        .slice(3)
        .filter((item) => item.lastDroppedItem);
      if (propsArr && propsArr.length >= 3) {
        setFull(true);
        const body = {
          model_id: project.id,
          x_axis: propertiesArr[0].lastDroppedItem.key,
          y_axis: propertiesArr[1].lastDroppedItem.key,
          z_axis: propertiesArr[2].lastDroppedItem.key,
          filters: filterArr,
        };
        window.core.ToggleDrawer(false);
        console.log({ body });
        // let signedUrl = await Storage.get("mcgee_sku_model.zip");
        // console.log({ signedUrl });
        if (project && window && window.core) {
          let response = await fetch(
            "https://vkepitqt88.execute-api.us-east-1.amazonaws.com/Prod/etl/model",
            { method: "POST", body: JSON.stringify(body) }
          );
          console.log({ response });
          window.core.OpenProject(JSON.stringify(response));
        }
      } else {
        setFull(false);
      }
    };

    handleETL();
  }, [propertiesArr, project]);

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
                    setFilterSidebarPosition={setFilterSidebarPosition}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    sidebarExpanded={sidebarExpanded}
                    setSidebarExpanded={setSidebarExpanded}
                    project={project}
                    isEditing={isEditing}
                    propertiesArr={propertiesArr}
                    setPropertiesArr={setPropertiesArr}
                    handleStateChange={handleStateChange}
                    showCols={showCols}
                    setShowCols={setShowCols}
                    handleDrop={handleDrop}
                    state={state}
                    states={states}
                    setState={setState}
                    setStates={setStates}
                  />
                  <div className="w-full h-full flex">
                    <div className={`min-w-0 flex-auto overflow-auto`}>
                      {full ? (
                        <>
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
                        </>) : (<div className="text-3xl text-white">loading....</div>)
                      }
                    </div>
                    <CommentsSidebar
                      state={state}
                      states={states}
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

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
import { FileHeader } from "../partials/datagrid/FileHeader";
import { ModelFooter } from "../partials/datagrid/ModelFooter";
import { AddFiles } from "../partials/addFiles.js";
import { Templates } from "../partials/projects/Templates";
import { Invite } from "../partials/invite";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Storage } from "aws-amplify";
import update from "immutability-helper";
import { useStates } from "../services/useStates";
import { AddProjectModal } from "../partials/projects/AddProjectModal";
import GridLoader from "react-spinners/GridLoader";

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
  const [selectedFile, setSelectedFile] = useState("");
  const [dataGridLoading, setDataGridLoading] = useState(false);
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
  const [uploaded, setUploaded] = useState(false);

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
      console.log({ propsArr });
      if (propsArr && propsArr.length >= 3 && uploaded) {
        // setFull(true);
        const body = {
          model_id: project.id,
          x_axis: propertiesArr[0].lastDroppedItem.key,
          y_axis: propertiesArr[1].lastDroppedItem.key,
          z_axis: propertiesArr[2].lastDroppedItem.key,
          filters: filterArr,
        };
        // window.core.ToggleDrawer(false);
        console.log({ body });
        // let signedUrl = await Storage.get("mcgee_sku_model.zip");
        // console.log({ signedUrl });
        // if (project && window && window.core) {
        let response = await fetch(
          "https://vkepitqt88.execute-api.us-east-1.amazonaws.com/Prod/etl/model",
          { method: "POST", mode: "no-cors", body: JSON.stringify(body) }
        );
        console.log({ response });
        // window.core.OpenProject(JSON.stringify(response));
        // }
      } else {
        setFull(false);
      }
    };

    handleETL();
  }, [propertiesArr, project, uploaded]);

  const [isEditing, setIsEditing] = useState(false);
  const [share, setShare] = useState(false);
  const [sdt, setSdt] = useState("Hello");
  const [filesOpen, setFilesOpen] = useState([]);
  const { fileSystem, setFiles } = useFileSystem(project);

  // // handle case if transitioning from n to n-1 filesOpen where n-1 !== 0
  // useEffect(() => {

  // }, [filesOpen])  

  return (
    <div className="flex h-screen overflow-hidden scrollbar-none bg-primary-dark-blue">
      {showAddProject ? (
        <AddProjectModal
          user={user}
          setShowAddProject={setShowAddProject}
          setProject={setProject}
        />
      ) : null}

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
      <div className="relative flex flex-col flex-1 overflow-y-auto scrollbar-none overflow-x-hidden bg-primary-dark-blue">
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
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    setDataGridLoading={setDataGridLoading}
                    uploaded={uploaded}
                    setUploaded={setUploaded}
                    fileSystem={fileSystem}
                    setFiles={setFiles}
                    filesOpen={filesOpen}
                    setFilesOpen={setFilesOpen}
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
                    <div className="min-w-0 flex-auto w-full">
                      {/* {full ? (
                        <> */}
                      {share ? (
                        <Invite setShare={setShare} />
                      ) : (
                        <div className="flex-col mx-auto h-full">
                          {filesOpen && filesOpen.length > 0 && (
                            <FileHeader
                              selectedFile={selectedFile}
                              setSelectedFile={setSelectedFile}
                              setDataGrid={setDataGrid}
                              fileSystem={fileSystem}
                              filesOpen={filesOpen}
                              setFilesOpen={setFilesOpen}
                            />
                          )}
                          {dataGridLoading ? (
                            <div className="h-full w-full flex justify-center items-center border-none">
                              <GridLoader
                                loading={dataGridLoading}
                                size={100}
                                color={"yellow"}
                              />
                            </div>
                          ) : (
                            <>
                              {fileSystem &&
                              fileSystem.length &&
                              dataGrid.rows.length > 0 ? (
                                <Datagrid
                                  isDropped={isDropped}
                                  setIsEditing={setIsEditing}
                                  dataGrid={dataGrid}
                                  setDataGrid={setDataGrid}
                                />
                              ) : (
                                <AddFiles
                                  setFilesOpen={setFilesOpen}
                                  uploaded={uploaded}
                                  setUploaded={setUploaded}
                                  setDataGrid={setDataGrid}
                                  project={project}
                                  fileSystem={fileSystem}
                                  setFileSystem={setFiles}
                                />
                              )}
                            </>
                          )}

                          <ModelFooter sdt={sdt} />
                        </div>
                      )}

                      {/* </>) : (<div className="text-3xl text-white">loading....</div>) */}
                      {/* } */}
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
              <div className="w-full">
                {projects && projects.length > 0 ? (
                  <div className="px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
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
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

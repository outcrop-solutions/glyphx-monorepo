import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import QWebChannel from "qwebchannel";
import Header from "../partials/header";
import TableView from "../partials/projects/TableView";
import { GridView } from "../partials/projects/GridView";
import { ProjectSidebar } from "../partials/sidebars/project";
import { CommentsSidebar } from "../partials/sidebars/comments";
import { MainSidebar } from "../partials/sidebars/main";
import { useStateChange } from "../services/useStateChange";
import { useFileSystem } from "../services/useFileSystem";
import { Datagrid } from "../partials/datagrid";
import { FileHeader } from "../partials/datagrid/FileHeader";
import { ModelFooter } from "../partials/datagrid/ModelFooter";
import { AddFiles } from "../partials/addFiles.js";
import { Templates } from "../partials/projects/Templates";
import { Invite } from "../partials/invite";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import update from "immutability-helper";
import { useStates } from "../services/useStates";
import { AddProjectModal } from "../partials/projects/AddProjectModal";
import GridLoader from "react-spinners/GridLoader";
import { ReorderConfirmModal } from "../partials/datagrid/ReorderConfirmModal";
import { ToastContainer } from "react-toastify";

let socket = null;
// import { Horizontal } from '../partials/dnd/Pages'

export const Projects = ({ user, setIsLoggedIn, projects }) => {
  const [grid, setGrid] = useState(false);
  const [project, setProject] = useState(false);

  const { states, state, setState, setStates } = useStates(project);
  useStateChange(state);
  useStateChange(state);

  const [showAddProject, setShowAddProject] = useState(false);

  const location = useLocation();
  const [sendDrawerPositionApp, setSendDrawerPositionApp] = useState(false);

  // comments and filter sidebar positions
  // position state can be destructured as follows... { bottom, height, left, right, top, width, x, y } = position
  //position state dynamically changes with transitions
  const [commentsPosition, setCommentsPosition] = useState({});
  const [filterSidebarPosition, setFilterSidebarPosition] = useState({});

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
      console.log({ filterSidebarPosition, commentsPosition });
      window.core.SendDrawerPosition(
        JSON.stringify({
          filterSidebar: filterSidebarPosition.values,
          commentsSidebar: commentsPosition
            ? commentsPosition.values
            : { ...filterSidebarPosition.values, left: window.innerWidth },
        })
      );
      setSendDrawerPositionApp(false);
    }
  }, [commentsPosition, filterSidebarPosition, sendDrawerPositionApp]);
  const handleStateChange = (state) => {
    setState((prev) => {
      let data = state;
      return data;
    });
  };

  const [reorderConfirm, setReorderConfirm] = useState(false);
  const [propertiesArr, setPropertiesArr] = useState([
    { axis: "X", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "Y", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "Z", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "1", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "2", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    { axis: "3", accepts: "COLUMN_DRAG", lastDroppedItem: null },
  ]);
  const [droppedProps, setDroppedProps] = useState([]);
  const [oldDropped, setOldDropped] = useState([]);
  const isDropped = (propName) => {
    return droppedProps.indexOf(propName) > -1;
  };
  const handleDrop = useCallback(
    (index, item) => {
      // let propsArr = propertiesArr.filter((item) => item.lastDroppedItem);
      // console.log({ droppedProps });
      // if first three items have changed, throw modal, else do nothing

      const { key } = item;
      setOldDropped(droppedProps);
      setDroppedProps(update(droppedProps, { [index]: { $set: key } }));
      // TODO:
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
  const [uploaded, setUploaded] = useState(false);
  const [url, setUrl] = useState(false);
  const toastRef = React.useRef(null);
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
      if (propsArr && propsArr.length >= 3) {
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
        if (project && window && window.core) {
          let response = await fetch("https://api.glyphx.co/etl/model", {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(body),
          });
          console.log({ response });

          // TODO: Set Url state to toggle drawer from bottom drawer
          if (response.ok) {
            window.core.OpenProject(JSON.stringify(response.signedUrl));
            setUrl(response.signedUrl);
            setSdt(response.sdt);
          } else {
            window.core.OpenProject(JSON.stringify({}));
          }
        }
      }
    };
    let propsArr = propertiesArr.filter((item) => item.lastDroppedItem);
    const equals = (a, b) =>
      a.length === b.length && a.every((v, i) => v === b[i]);
    let propsSliced = propsArr
      .slice(0, 3)
      .map((item) => item.lastDroppedItem.key);

    let oldDroppedSliced = oldDropped.slice(0, 3).filter((el) => el);
    let droppedSliced = droppedProps.slice(0, 3).filter((el) => el);
    console.log({
      propsArr,
      oldDropped,
      oldDroppedSliced,
      propsSliced,
      equals: !equals(propsSliced, oldDroppedSliced),
    });
    if (
      oldDropped &&
      oldDroppedSliced.length === 3 &&
      !equals(propsSliced, oldDroppedSliced)
    ) {
      setReorderConfirm(true);
      return;
    }

    if (
      propsArr &&
      propsArr.length >= 3 &&
      propsSliced &&
      propsSliced.length >= 3 &&
      droppedSliced &&
      droppedSliced.length >= 3 &&
      equals(propsSliced, droppedSliced)
    ) {
      console.log("handleETl called");
      handleETL();
    }
  }, [propertiesArr, project, uploaded]);

  const [isEditing, setIsEditing] = useState(false);
  const [share, setShare] = useState(false);

  useEffect(() => {
    setPropertiesArr([
      { axis: "X", accepts: "COLUMN_DRAG", lastDroppedItem: null },
      { axis: "Y", accepts: "COLUMN_DRAG", lastDroppedItem: null },
      { axis: "Z", accepts: "COLUMN_DRAG", lastDroppedItem: null },
      { axis: "1", accepts: "COLUMN_DRAG", lastDroppedItem: null },
      { axis: "2", accepts: "COLUMN_DRAG", lastDroppedItem: null },
      { axis: "3", accepts: "COLUMN_DRAG", lastDroppedItem: null },
    ]);
    setOldDropped([]);
    setReorderConfirm(false);
    setDroppedProps([]);
  }, [project]);

  const {
    fileSystem,
    setFiles,
    filesOpen,
    setFilesOpen,
    openFile,
    selectFile,
    closeFile,
    clearFiles,
    selectedFile,
    setSelectedFile,
    sdt,
    setSdt,
    dataGrid,
    setDataGrid,
    dataGridLoading,
    setDataGridLoading,
  } = useFileSystem(project);

  useEffect(() => {
    if ((share || reorderConfirm) && window && window.core) {
      window.core.ToggleDrawer(false);
    }
  }, [share, reorderConfirm]);

  return (
    <div className="flex h-screen overflow-hidden scrollbar-none bg-primary-dark-blue">
      {/* <ToastContainer
        position="bottom-left"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> */}
      {showAddProject ? (
        <AddProjectModal
          user={user}
          clearFiles={clearFiles}
          setShowAddProject={setShowAddProject}
          setProject={setProject}
        />
      ) : null}
      {reorderConfirm ? (
        <ReorderConfirmModal
          project={project}
          setReorderConfirm={setReorderConfirm}
          user={user}
          setShowAddProject={setShowAddProject}
          setProject={setProject}
          setOldDropped={setOldDropped}
          setPropertiesArr={setPropertiesArr}
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
                    openFile={openFile}
                    selectFile={selectFile}
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
                    toastRef={toastRef}
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
                              selectFile={selectFile}
                              closeFile={closeFile}
                              selectedFile={selectedFile}
                              filesOpen={filesOpen}
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
                              {dataGrid.rows.length > 0 ? (
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

                          <ModelFooter sdt={sdt} url={url} />
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
                        setFileSystem={setFiles}
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

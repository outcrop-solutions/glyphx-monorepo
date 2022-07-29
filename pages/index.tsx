import React, { useState, useEffect, useCallback } from "react";
import QWebChannel from "qwebchannel";
import update from "immutability-helper";
import * as dayjs from "dayjs";

// Layout
import { Header } from "partials";
import { ProjectSidebar } from "partials";
import { CommentsSidebar } from "partials";
import { MainSidebar } from "partials";

// Project Overiew
import { Templates } from "partials";
import { TableView } from "partials";
import { GridView } from "partials";
import { AddProjectModal } from "partials";
import { ProjectDetails } from "partials";

// Project View
import GridLoader from "react-spinners/GridLoader";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Datagrid } from "partials";
import { FileHeader } from "partials";
import { ModelFooter } from "partials";
import { AddFiles } from "partials";
import { Invite } from "partials";

// Hooks
import { useStateChange } from "services/useStateChange";
import { useFileSystem } from "services/useFileSystem";
import { useStates } from "services/useStates";
import { ReorderConfirmModal } from "partials";
import { updateProject } from "../graphql/mutations";
import { API, graphqlOperation, Storage } from "aws-amplify";

let socket = null;

export default function Projects({
  user,
  setIsLoggedIn,
  projects,
  setProjects,
}) {
  const [error, setError] = useState(false);
  const [grid, setGrid] = useState(false);
  const [project, setProject] = useState(false);
  const [projectDetails, setProjectDetails] = useState(false);

  const { states, state, setState, deleteState, setStates } =
    useStates(project);
  useStateChange(state);

  const [showAddProject, setShowAddProject] = useState(false);
  const [sendDrawerPositionApp, setSendDrawerPositionApp] = useState(false);

  // comments and filter sidebar positions
  // position state can be destructured as follows... { bottom, height, left, right, top, width, x, y } = position
  //position state dynamically changes with transitions
  const [commentsPosition, setCommentsPosition] = useState({});
  const [filterSidebarPosition, setFilterSidebarPosition] = useState({});

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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  // keeps track of whether project is open in qt
  const [isQtOpen, setIsQtOpen] = useState(false);
  // projectSidebar state and utilities
  const [showCols, setShowCols] = useState(false);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  useEffect(() => {
    if (sendDrawerPositionApp && window && window.core) {
      window.core.SendDrawerPosition(
        JSON.stringify({
          filterSidebar: {
            // y: filterSidebarPosition.values.y,
            y: 64,
            right: Math.round(filterSidebarPosition.values.right),
            height: filterSidebarPosition.values.height,
          },
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
      let dropped = [];
      if (project.properties) {
        dropped = project.properties
          .map((el) => {
            return el.split("-")[0];
          })
          .filter((el) => el !== "");
      }
      const { key } = item;
      setOldDropped(droppedProps.length > 0 ? droppedProps : dropped);
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
    [droppedProps, propertiesArr, project]
  );
  const [uploaded, setUploaded] = useState(false);
  const [url, setUrl] = useState(false);
  const [expiry, setExpiry] = useState(false);
  const toastRef = React.useRef(null);

  // handle project change
  useEffect(() => {
    let dropped = [];
    if (project.properties) {
      dropped = project.properties
        .map((el) => {
          return el.split("-")[0];
        })
        .filter((el) => el !== "");
    }
    setPropertiesArr((prev) => {
      if (project.properties && project.properties.length > 0) {
        const existingProps = project.properties.map((el, idx) => {
          switch (idx) {
            case 0:
              return {
                axis: "X",
                accepts: "COLUMN_DRAG",
                lastDroppedItem:
                  el === ""
                    ? null
                    : {
                        id: el.split("-")[2],
                        key: el.split("-")[0],
                        dataType: el.split("-")[1],
                      },
              };

            case 1:
              return {
                axis: "Y",
                accepts: "COLUMN_DRAG",
                lastDroppedItem:
                  el === ""
                    ? null
                    : {
                        id: el.split("-")[2],
                        key: el.split("-")[0],
                        dataType: el.split("-")[1],
                      },
              };

            case 2:
              return {
                axis: "Z",
                accepts: "COLUMN_DRAG",
                lastDroppedItem:
                  el === ""
                    ? null
                    : {
                        id: el.split("-")[2],
                        key: el.split("-")[0],
                        dataType: el.split("-")[1],
                      },
              };

            case 3:
              return {
                axis: "1",
                accepts: "COLUMN_DRAG",
                lastDroppedItem:
                  el === ""
                    ? null
                    : {
                        id: el.split("-")[2],
                        key: el.split("-")[0],
                        dataType: el.split("-")[1],
                      },
              };

            case 4:
              return {
                axis: "2",
                accepts: "COLUMN_DRAG",
                lastDroppedItem:
                  el === ""
                    ? null
                    : {
                        id: el.split("-")[2],
                        key: el.split("-")[0],
                        dataType: el.split("-")[1],
                      },
              };

            case 5:
              return {
                axis: "3",
                accepts: "COLUMN_DRAG",
                lastDroppedItem:
                  el === ""
                    ? null
                    : {
                        id: el.split("-")[2],
                        key: el.split("-")[0],
                        dataType: el.split("-")[1],
                      },
              };

            default:
              break;
          }
        });
        return existingProps;
      } else {
        const cleanProps = [
          { axis: "X", accepts: "COLUMN_DRAG", lastDroppedItem: null },
          { axis: "Y", accepts: "COLUMN_DRAG", lastDroppedItem: null },
          { axis: "Z", accepts: "COLUMN_DRAG", lastDroppedItem: null },
          { axis: "1", accepts: "COLUMN_DRAG", lastDroppedItem: null },
          { axis: "2", accepts: "COLUMN_DRAG", lastDroppedItem: null },
          { axis: "3", accepts: "COLUMN_DRAG", lastDroppedItem: null },
        ];
        return cleanProps;
      }
    });
    setSdt(project.filePath ? project.filePath : false);
    setUrl(project.url ? project.url : false);
    setExpiry(project.expiry ? project.expiry : false);
    setOldDropped([...dropped]);
    console.log({ dropped });
    setReorderConfirm(false);
    setDroppedProps([]);
    if (window.core && window.core) {
      window.core.CloseModel();
      setIsQtOpen(false);
    }
  }, [project]);

  // handle ETL
  useEffect(() => {
    // Formatted variables
    let propsArr = propertiesArr.filter((item) => item.lastDroppedItem);
    let filteredArr = propertiesArr
      .slice(3)
      .filter((item) => item.lastDroppedItem);
    let propsSliced = propsArr
      .slice(0, 3)
      .map((item) => item.lastDroppedItem.key);
    let oldDroppedSliced = oldDropped.slice(0, 3).filter((el) => el);
    let droppedSliced = droppedProps.slice(0, 3).filter((el) => el);

    // utilties
    const equals = (a, b) =>
      a.length === b.length && a.every((v, i) => v === b[i]);
    const isUrlValid = () => {
      const date1 = dayjs();
      let difference = date1.diff(dayjs(project.expiry), "minute");
      if (difference < 10 || typeof project.url === "undefined") {
        return true;
      } else {
        return false;
      }
    };
    const isPropsValid = () => {
      if (
        propsArr &&
        propsArr.length >= 3 &&
        propsSliced &&
        propsSliced.length >= 3 &&
        droppedSliced &&
        droppedSliced.length >= 3 &&
        equals(propsSliced, droppedSliced)
      ) {
        return true;
      } else {
        return false;
      }
    };

    const doesKeyExist = async () => {
      try {
        const data = await Storage.list(`${project.id}/output/`);
        console.log({ data });
        if (
          data
            .map((el) => el.key)
            .includes(`${project.id}/output/_etl_data_lake.csv`)
        ) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.log({ error });
      }
    };
    const updateProjectState = async (res) => {
      if (res.statusCode === 200) {
        setIsQtOpen(true);
        setUrl(res.url);
        setSdt(res.sdt);

        // update Dynamo Project Item
        const updateProjectInput = {
          id: project.id,
          filePath: res.sdt,
          expiry: new Date().toISOString(),
          properties: propertiesArr.map((el) =>
            el.lastDroppedItem
              ? el.lastDroppedItem.key
                ? `${el.lastDroppedItem.key}-${el.lastDroppedItem.dataType}-${el.lastDroppedItem.id}`
                : ""
              : ""
          ),
          url: res.url,
        };
        try {
          const result = await API.graphql(
            graphqlOperation(updateProject, { input: updateProjectInput })
          );
          console.log({ result });
        } catch (error) {
          console.log({ error });
        }
      }
      // TODO: add error handling
    };
    const callETl = async (propsArr, filteredArr) => {
      console.log("callEtl");
      if (
        project &&
        window &&
        window.core &&
        propsArr &&
        propsArr.length >= 3
      ) {
        console.log("call endpoint");
        // call ETl endpoint
        let response = await fetch("https://api.glyphx.co/etl/model", {
          method: "POST",
          mode: "cors",
          body: JSON.stringify({
            model_id: project.id,
            x_axis: propertiesArr[0].lastDroppedItem.key,
            y_axis: propertiesArr[1].lastDroppedItem.key,
            z_axis: propertiesArr[2].lastDroppedItem.key,
            filters: filteredArr,
          }),
        });
        let res = await response.json();
        await updateProjectState(res);
      }
    };
    const handleETL = async () => {
      console.log("handle etl");
      // TODO: track which properties come from which file keys once we add file delete funcitonality to ensure we don't run etl on non existent keys
      // check if file exists in s3 to prevent running ETL on non-existent keys
      let isSafe = await doesKeyExist();
      if (isSafe) {
        await callETl(propsArr, filteredArr);
      } else {
        setError(
          "File not available to ETL yet. Please wait and try again once the file has finished uploading"
        );
        setTimeout(() => {
          setError(false);
        }, 3000);
        console.log({ error: `File not available to ETL yet ${isSafe}` });
      }
    };
    // If reordering props, create new model
    if (
      oldDropped &&
      oldDroppedSliced.length === 3 &&
      !equals(propsSliced, oldDroppedSliced)
    ) {
      console.log("Called Reorder Confirm");
      setReorderConfirm(true);
      return;
    }
    // handle initial ETL
    console.log({
      project,
      projectId: project.id,
      propsValid: isPropsValid(),
      urlValid: isUrlValid(),
    });
    if (project && project.id && isPropsValid()) {
      handleETL();
    }
  }, [propertiesArr, project, uploaded, expiry]);

  useEffect(() => {
    console.log({ propertiesArr });
  }, [propertiesArr]);

  // const handleSave = async () => {
  //   let id = "";
  //   let proj = {};
  //   // utilities
  //   const createProj = async () => {
  //     try {
  //       const createProjectInput = {
  //         id: newId,
  //         name: `${project.name} Copy`,
  //         description: "",
  //         author: user.username,
  //         expiry: new Date().toISOString(),
  //         properties: propertiesArr.map((el) =>
  //           el.lastDroppedItem
  //             ? el.lastDroppedItem.key
  //               ? `${el.lastDroppedItem.key}-${el.lastDroppedItem.dataType}-${el.lastDroppedItem.id}`
  //               : ""
  //             : ""
  //         ),
  //         shared: [user.username],
  //       };
  //       const result = await API.graphql(
  //         graphqlOperation(createProject, { input: createProjectInput })
  //       );
  //       return {
  //         projId: result.data.createProject.id,
  //         projectData: result.data.createProject,
  //       };
  //     } catch (error) {
  //       console.log({ error });
  //     }
  //   };
  //   const copyFiles = async (id) => {
  //     try {
  //       const data = await Storage.list(`${project.id}/input/`);
  //       for (let i = 0; i < data.length; i++) {
  //         const copied = await Storage.copy(
  //           { key: `${data[i].key}` },
  //           { key: `${id}${data[i].key.slice(36)}` }
  //         );
  //         return copied;
  //       }
  //     } catch (error) {
  //       console.log({ error });
  //     }
  //   };

  //   const callETL = async (propsArr, filteredArr) => {
  //     if (
  //       project &&
  //       window &&
  //       window.core &&
  //       propsArr &&
  //       propsArr.length >= 3
  //     ) {
  //       // call ETl endpoint
  //       let response = await fetch("https://api.glyphx.co/etl/model", {
  //         method: "POST",
  //         mode: "cors",
  //         body: JSON.stringify({
  //           model_id: project.id,
  //           x_axis: propertiesArr[0].lastDroppedItem.key,
  //           y_axis: propertiesArr[1].lastDroppedItem.key,
  //           z_axis: propertiesArr[2].lastDroppedItem.key,
  //           filters: filteredArr,
  //         }),
  //       });
  //       let res = await response.json();
  //       await updateProjectState(res);
  //     }
  //   };

  //   let { projId, projectData } = await createProj();
  //   let isCopied = await copyFiles(projId);
  //   if (isCopied) {
  //     await callETL();
  //   }

  //   // copy S3 files
  //   // call ETL
  //   // create new project with updated properties
  //   // set project state

  //   setReorderConfirm(false);
  // };

  const [isEditing, setIsEditing] = useState(false);
  const [share, setShare] = useState(false);
  const [progress, setProgress] = useState(false);

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

  // handle Open project
  useEffect(() => {
    console.log({ url, sdt, project });
    if (project && window && window.core) {
      if (url) {
        window?.core.OpenProject(JSON.stringify(url));
      } else {
        window?.core.OpenProject({});
      }
    }
  }, [sdt, url, project]);

  // handle close project drawer
  useEffect(() => {
    if ((share || reorderConfirm) && window && window.core) {
      window.core.ToggleDrawer(false);
    }
  }, [share, reorderConfirm]);

  return (
    <div className="flex h-screen max-w-screen scrollbar-none bg-primary-dark-blue">
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
          setReorderConfirm={setReorderConfirm}
          setShowAddProject={setShowAddProject}
          // handleSave={handleSave}
        />
      ) : null}
      {/* Sidebar */}
      <MainSidebar
        project={project}
        setProject={setProject}
        user={user}
        setIsQtOpen={setIsQtOpen}
        setIsLoggedIn={setIsLoggedIn}
        setProgress={setProgress}
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
          showAddProject={showAddProject}
          setShowAddProject={setShowAddProject}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          grid={grid}
          setGrid={setGrid}
          setShare={setShare}
        />
        <hr className={project ? "mx-0" : "mx-6"} />
        <main className="h-full">
          <div className="flex grow relative h-full">
            {project ? (
              <>
                <DndProvider backend={HTML5Backend}>
                  <ProjectSidebar
                    error={error}
                    sdt={sdt}
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
                    deleteState={deleteState}
                    setState={setState}
                    setStates={setStates}
                    toastRef={toastRef}
                  />
                  <div className="w-full flex overflow-auto">
                    <div className="min-w-0 flex-auto w-full">
                      {/* {progress ? (
                        <Progress />
                      ) : ( */}
                      <>
                        {share ? (
                          <Invite setShare={setShare} />
                        ) : (
                          <div className="flex flex-col h-full">
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
                                  <>
                                    <div className="flex flex-col grow max-h-full">
                                      <Datagrid
                                        isDropped={isDropped}
                                        dataGrid={dataGrid}
                                      />
                                      <ModelFooter
                                        sdt={sdt}
                                        url={url}
                                        project={project}
                                        setExpiry={setExpiry}
                                        isQtOpen={isQtOpen}
                                        setIsQtOpen={setIsQtOpen}
                                        setProgress={setProgress}
                                      />
                                    </div>
                                  </>
                                ) : (
                                  <AddFiles
                                    setFilesOpen={setFilesOpen}
                                    uploaded={uploaded}
                                    setUploaded={setUploaded}
                                    setDataGrid={setDataGrid}
                                    project={project}
                                    fileSystem={fileSystem}
                                    setFileSystem={setFiles}
                                    setSelectedFile={setSelectedFile}
                                  />
                                )}
                              </>
                            )}
                            {/* <div style={{ height: "80px" }} /> */}
                          </div>
                        )}
                      </>
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
              <div className="w-full flex">
                {projects && projects.length > 0 ? (
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

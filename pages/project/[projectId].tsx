import React, { useState } from "react";
import { GetServerSideProps } from "next";
// Amplify
import {
  API,
  withSSRContext,
  graphqlOperation,
  Storage,
} from "aws-amplify";

import { getProject } from "graphql/queries";
import { createProject } from "graphql/mutations";

// Layout
import { Header } from "partials";
import { ProjectSidebar } from "partials";
import { CommentsSidebar } from "partials";
import { MainSidebar } from "partials";

// Project View
import GridLoader from "react-spinners/GridLoader";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Datagrid } from "partials";
import { GridHeader } from "partials";
import { ModelFooter } from "partials";
import { AddFiles } from "partials";
import { Invite } from "partials";

// Hooks
import { useStateChange } from "services/useStateChange";
import { useFileSystem } from "services/useFileSystem";
import { useStates } from "services/useStates";
import { ReorderConfirmModal } from "partials";
import { updateProject } from "graphql/mutations";
import { GetProjectQuery } from "API";
import { useRouter } from "next/router";
import { useProject } from "services";
import { useSocket } from "services";

export default function Projects({ user, authenticated, data }) {
  const [error, setError] = useState(false);

  const { query } = useRouter();
  const { projectId } = query;

  // Qt hook
  const {
    commentsPosition,
    setCommentsPosition,
    filterSidebarPosition,
    setFilterSidebarPosition,
  } = useSocket();

  // Filesystem hook
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
  } = useFileSystem(projectId);

  // Project Hook
  const {
    project,
    setProject,
    reorderConfirm,
    setReorderConfirm,
    propertiesArr,
    setPropertiesArr,
    droppedProps,
    setDroppedProps,
    isDropped,
    handleDrop,
  } = useProject(data, projectId, sdt, setSdt);

  // State Hook
  const { states, state, setState, deleteState, setStates } =
    useStates(project);
  useStateChange(state);

  const [showAddProject, setShowAddProject] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleStateChange = (state) => {
    setState((prev) => {
      let data = state;
      return data;
    });
  };

  const [url, setUrl] = useState(false);
  const toastRef = React.useRef(null);

  //  FORK PROJECT
  const handleSave = async () => {
    let id = "";
    let proj = {};
    // utilities
    const createProj = async () => {
      try {
        const createProjectInput = {
          id: newId,
          name: `${project.name} Copy`,
          description: "",
          author: user.username,
          expiry: new Date().toISOString(),
          properties: propertiesArr.map((el) =>
            el.lastDroppedItem
              ? el.lastDroppedItem.key
                ? `${el.lastDroppedItem.key}-${el.lastDroppedItem.dataType}-${el.lastDroppedItem.id}`
                : ""
              : ""
          ),
          shared: [user.username],
        };
        const result = await API.graphql(
          graphqlOperation(createProject, { input: createProjectInput })
        );
        return {
          projId: result.data.createProject.id,
          projectData: result.data.createProject,
        };
      } catch (error) {
        console.log({ error });
      }
    };
    const copyFiles = async (id) => {
      try {
        const data = await Storage.list(`${project.id}/input/`);
        for (let i = 0; i < data.length; i++) {
          const copied = await Storage.copy(
            { key: `${data[i].key}` },
            { key: `${id}${data[i].key.slice(36)}` }
          );
          return copied;
        }
      } catch (error) {
        console.log({ error });
      }
    };

    const callETL = async (propsArr, filteredArr) => {
      if (
        project &&
        window &&
        window.core &&
        propsArr &&
        propsArr.length >= 3
      ) {
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

    let { projId, projectData } = await createProj();
    let isCopied = await copyFiles(projId);
    if (isCopied) {
      await callETL();
    }

    // copy S3 files
    // call ETL
    // create new project with updated properties
    // set project state
    setReorderConfirm(false);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [share, setShare] = useState(false);
  const [progress, setProgress] = useState(false);

  return (
    <div className="flex h-screen max-w-5xl-screen overflow-hidden scrollbar-none bg-primary-dark-blue">
      {reorderConfirm ? (
        <ReorderConfirmModal
          setReorderConfirm={setReorderConfirm}
          setShowAddProject={setShowAddProject}
          handleSave={handleSave}
        />
      ) : null}
      {/* Sidebar */}
      <MainSidebar
        project={project}
        user={user}
      />
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-auto scrollbar-none bg-primary-dark-blue">
        {/*  Site header */}
        <Header
          project={project}
          setProject={setProject}
          setShowAddProject={setShowAddProject}
          setShare={setShare}
        />
        {/* <hr className={project ? "mx-0" : "mx-6"} /> */}
        <main className="h-full">
          <div className="flex grow relative h-full">
            <DndProvider backend={HTML5Backend}>
              <ProjectSidebar
                error={error}
                sdt={sdt}
                openFile={openFile}
                selectFile={selectFile}
                selectedFile={selectedFile}
                setSelectedFile={setSelectedFile}
                fileSystem={fileSystem}
                setFiles={setFiles}
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
                  {share ? (
                    <Invite setShare={setShare} />
                  ) : (
                    <div className="flex flex-col h-full">
                      {filesOpen && filesOpen.length > 0 && (
                        <GridHeader
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
                          {dataGrid?.rows?.length > 0 ? (
                            <>
                              <div className="flex flex-col grow max-h-full">
                                <Datagrid
                                  isDropped={isDropped}
                                  dataGrid={dataGrid}
                                  setDataGrid={setDataGrid}
                                />
                                <ModelFooter
                                  sdt={sdt}
                                  url={url}
                                  project={project}
                                  setProgress={setProgress}
                                />
                              </div>
                            </>
                          ) : (
                            <AddFiles
                              setFilesOpen={setFilesOpen}
                              setDataGrid={setDataGrid}
                              project={project}
                              fileSystem={fileSystem}
                              setFileSystem={setFiles}
                              setSelectedFile={setSelectedFile}
                            />
                          )}
                        </>
                      )}
                    </div>
                  )}
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
          </div>
        </main>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;
  console.log({ params });
  const { Auth } = await withSSRContext(context);
  const SSR = withSSRContext({ req: context.req });

  try {
    const user = await Auth.currentAuthenticatedUser();
    const response = (await SSR.API.graphql(
      graphqlOperation(getProject, { id: params.id })
    )) as {
      data: GetProjectQuery;
    };
    console.log({ user, response });

    return {
      props: {
        authenticated: true,
        user: JSON.stringify(user),
        data: response.data.getProject,
      },
    };
  } catch (error) {
    console.log({ error });
    return {
      props: {
        authenticated: false,
      },
    };
  }
};

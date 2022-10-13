import React, { useEffect, useState } from "react";

import { getProject } from "graphql/queries";
import { createProject } from "graphql/mutations";

// Layout
import { Header } from "partials";
import { ProjectSidebar } from "partials";
import { CommentsSidebar } from "partials";
import { MainSidebar } from "partials";
import { GridErrorModal } from "partials";

// Project View
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { ShareModule } from "partials";
import { Info } from "partials/info";
import { GridLoadingAnimation, LoadingModelAnimation } from "@/partials/loaders";

// Hooks
import { useRouter } from "next/router";
import { useProject } from "services";
import { useSocket } from "services";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { GridContainer } from "@/partials/datagrid/GridContainer";
import { projectIdAtom } from "@/state/project";
import { shareOpenAtom } from "@/state/share";
import { showInfoAtom } from "@/state/info";
import { dataGridLoadingAtom, GridModalErrorAtom,modelCreationLoadingAtion } from "../state";

export default function Project() {
  const [error, setError] = useState(false);
  const { query } = useRouter();
  const { projectId } = query;
  const setProjectId = useSetRecoilState(projectIdAtom);
  useEffect(() => {
    if (projectId) setProjectId(projectId);
  }, [projectId]);

  const dataGridLoading = useRecoilValue(dataGridLoadingAtom);
  const gridModalError = useRecoilValue(GridModalErrorAtom);
  const modelCreationLoading = useRecoilValue(modelCreationLoadingAtion);
  // const showReorderConfirm = useRecoilValue(showReorderConfirmAtom);

  // Qt hook
  useSocket();

  // Project Hook
  const { isDropped, handleDrop } = useProject();

  const toastRef = React.useRef(null);
  // const [share, setShare] = useState(false);

  // Check if share model has been turned on
  const [showShareModel, setShareModel] = useRecoilState(shareOpenAtom);
  const [showInfo, setShowInfo] = useRecoilState(showInfoAtom);

  return (
    <div className="flex h-screen max-w-5xl-screen overflow-hidden scrollbar-none bg-primary-dark-blue">
      {/* {showReorderConfirm ? <ReorderConfirmModal /> : null} */}
      {/* Sidebar */}
      <MainSidebar />
      {/* Content area */}
      <div className="relative flex flex-col flex-1 overflow-y-clip scrollbar-none bg-primary-dark-blue">
        {/*  Site header */}
        <Header />
        {/* <hr className={project ? "mx-0" : "mx-6"} /> */}
        <main className="flex flex-row h-full">
          <div className="flex grow relative h-full">
            <DndProvider backend={HTML5Backend}>
              <ProjectSidebar
                error={error}
                // setFilterSidebarPosition={setFilterSidebarPosition}
                handleDrop={handleDrop}
                toastRef={toastRef}
              />
              <div className="w-full flex overflow-auto">
                <div className="min-w-0 flex-auto w-full">
                  <div className="flex flex-col h-full">

                    {
                      gridModalError.show ? //if error
                      <GridErrorModal
                        title={gridModalError.title}
                        message={gridModalError.message}
                        devErrorMessage={gridModalError.devError}
                      />
                      :
                      dataGridLoading ? ( //if something is loading
                        <GridLoadingAnimation/>
                      ) : (
                        modelCreationLoading ? //if creating model
                        (
                          <LoadingModelAnimation/>
                        )
                        :(
                          <GridContainer isDropped={isDropped} />
                        )
                        
                      )
                    }
                    
                    
                    
                  </div>
                </div>
                {/* <>{share ? <Invite setShare={setShare} /> : <></>}</> */}
                {/* <CommentsSidebar setCommentsPosition={setCommentsPosition} /> */}
              </div>
            </DndProvider>
          </div>
          {/* FIXME: FIGURE OUT HOW TO GET SIDEBAR TO BE A SIDEBAR AND NOT AN OVERLAY */}
          <div id="right-side-bars" className="z-50">
            {showShareModel ? <ShareModule setShare={setShareModel} /> : <></>}
            {showInfo ? <Info setInfo={setShowInfo} /> : <></>}
          </div>
        </main>
      </div>
    </div>
  );
}

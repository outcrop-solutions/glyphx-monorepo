import React, { useEffect, useState } from 'react';

// Layout
import { ProjectHeader } from 'partials';
import { ProjectSidebar } from 'partials';
import { CommentsSidebar } from 'partials';
import { MainSidebar } from 'partials';
import { GridErrorModal } from 'partials';

// Project View
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { ShareModule } from 'partials';
import { Info } from 'partials/info';
import { Notification } from '@/partials/notification';
import { GridLoadingAnimation, LoadingModelAnimation } from 'partials/loaders';

// Hooks
import { useRouter } from 'next/router';
import { useProject } from 'services';
import { useSocket } from 'services';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { GridContainer } from 'partials/datagrid/GridContainer';
import { projectIdAtom } from 'state/project';
import { shareOpenAtom } from 'state/share';
import { showInfoAtom } from 'state/info';
import { showNotificationAtom } from 'state/notification';
import { dataGridLoadingAtom, GridModalErrorAtom, modelCreationLoadingAtom } from '../state';
import dynamic from 'next/dynamic';

const DynamicDecisionModal = dynamic(() => import('partials/files/DecisionModal'), {
  ssr: false,
});

export default function Project() {
  const { query } = useRouter();
  const { projectId } = query;
  const setProjectId = useSetRecoilState(projectIdAtom);
  useEffect(() => {
    if (projectId) setProjectId(projectId);
  }, [projectId]);

  const dataGridLoading = useRecoilValue(dataGridLoadingAtom);
  const gridModalError = useRecoilValue(GridModalErrorAtom);
  const modelCreationLoading = useRecoilValue(modelCreationLoadingAtom);
  // const showReorderConfirm = useRecoilValue(showReorderConfirmAtom);

  // Qt hook
  try {
    useSocket();
  } catch (error) {}

  // Project Hook
  const { isDropped, handleDrop } = useProject();
  // const [share, setShare] = useState(false);

  // Check if share model has been turned on
  const [showShareModel, setShareModel] = useRecoilState(shareOpenAtom);
  const [showInfo, setShowInfo] = useRecoilState(showInfoAtom);
  const [showNotification, setNotification] = useRecoilState(showNotificationAtom);

  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden scrollbar-none bg-primary-dark-blue">
      {/* <DynamicDecisionModal /> */}
      <div className="w-[40px]">
        <MainSidebar />
      </div>
      <div className="flex flex-col h-full w-full">
        <ProjectHeader />
        <div className="flex flex-row h-full w-full">
          <DndProvider backend={HTML5Backend}>
            {/* Project sidebar */}
            <div className="w-[250px] shrink-0">
              <ProjectSidebar handleDrop={handleDrop} />
            </div>
            {/* Grid View */}
            <div className="w-full border-r border-gray">
              {gridModalError.show ? ( //if error
                <GridErrorModal
                  title={gridModalError.title}
                  message={gridModalError.message}
                  devErrorMessage={gridModalError.devError}
                />
              ) : dataGridLoading ? (
                <GridLoadingAnimation />
              ) : modelCreationLoading ? ( //if creating model
                <LoadingModelAnimation />
              ) : (
                <GridContainer isDropped={isDropped} />
              )}
            </div>
          </DndProvider>
          {/* Right Sidebar */}
          <div id="right-side-bars" className="">
            {showShareModel ? <ShareModule setShare={setShareModel} /> : <></>}
            {showInfo ? <Info setInfo={setShowInfo} setShare={setShareModel} /> : <></>}
            {showNotification ? <Notification setNotif={setNotification} /> : <></>}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

// Layout
import { ProjectHeader } from 'partials';
import { ProjectSidebar } from 'partials';
import { CommentsSidebar } from 'partials';
import { MainSidebar } from 'partials';

// Project View
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { ShareModule } from 'partials';
import { Info } from 'partials/info';
import { Notification } from 'partials/notification';
import { GridLoadingAnimation, LoadingModelAnimation } from 'partials/loaders';

// Hooks
import { useRouter } from 'next/router';
import { useProject, useSocket } from 'services';
import { GridContainer } from 'partials/datagrid/GridContainer';

// state
import { projectIdAtom } from 'state/project';
import { showShareModalOpenAtom, showNotificationDropdownAtom, showInfoDropdownAtom } from 'state/ui';
import { showDataGridLoadingAtom, showModelCreationLoadingAtom } from 'state/ui';
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
  }, [projectId, setProjectId]);

  const dataGridLoading = useRecoilValue(showDataGridLoadingAtom);
  const modelCreationLoading = useRecoilValue(showModelCreationLoadingAtom);
  // const showReorderConfirm = useRecoilValue(showReorderConfirmAtom);

  // Qt hook
  try {
    useSocket();
  } catch (error) {}

  // Project Hook
  const { isDropped, handleDrop } = useProject();
  // const [share, setShare] = useState(false);

  // Check if share model has been turned on
  const [showShareModel, setShareModel] = useRecoilState(showShareModalOpenAtom);
  const [showInfo, setShowInfo] = useRecoilState(showInfoDropdownAtom);
  const [showNotification, setNotification] = useRecoilState(showNotificationDropdownAtom);

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
              {dataGridLoading ? (
                <GridLoadingAnimation />
              ) : modelCreationLoading ? (
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

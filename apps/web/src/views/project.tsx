import React from 'react';
import { useRecoilState } from 'recoil';

// Project View
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

// Layout
import { MainSidebar, ProjectSidebar, ProjectHeader, ShareModule } from 'partials';

import { Info } from 'partials/info';
import { Notification } from 'partials/notification';

// Hooks
import { GridContainer } from 'partials/datagrid/GridContainer';

// state
import { showShareModalOpenAtom, showNotificationDropdownAtom, showInfoDropdownAtom } from 'state/ui';
import dynamic from 'next/dynamic';
import { useSocket } from 'services';

// const DynamicDecisionModal = dynamic(() => import('partials/files/DecisionModal'), {
//   ssr: false,
// });

export default function Project() {
  // Check if share model has been turned on
  const [showShareModel, setShareModel] = useRecoilState(showShareModalOpenAtom);
  const [showInfo, setShowInfo] = useRecoilState(showInfoDropdownAtom);
  const [showNotification, setNotification] = useRecoilState(showNotificationDropdownAtom);
  // Qt hook
  try {
    useSocket();
  } catch (error) {}

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
              <ProjectSidebar />
            </div>
            {/* Grid View */}
            <div className="w-full border-r border-gray">
              <GridContainer />
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

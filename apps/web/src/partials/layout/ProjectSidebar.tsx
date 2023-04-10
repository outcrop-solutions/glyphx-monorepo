import { useRef, useEffect, useState } from 'react';
// import { ExpandCollapse } from "./ExpandCollapse";
import { Files, States, Properties as Axes, Filters, Visualizations, VisualizationProps } from 'partials';
import { usePosition } from 'services/usePosition';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { viewerPositionAtom } from 'state';
import { useSendPosition } from 'services';
// import { glyphViewerDetails } from 'state/ui';

export const ProjectSidebar = () => {
  //utilities
  const sidebar = useRef(null);
  // trigger sendPosition when sidebar changes
  const pos = usePosition(sidebar);
  // const setViewer = useSetRecoilState(viewerPositionAtom);
  const { sendPosition } = useSendPosition();
  // set projectsSidebar position on transition
  useEffect(() => {
    if (sidebar.current !== null) {
      const coords = sidebar.current.getBoundingClientRect();
      sendPosition(coords);
    }
  }, [sendPosition, pos]);

  return (
    <div
      id="sidebar"
      ref={sidebar}
      className={`flex grow flex-col bg-secondary-space-blue absolute z-30 left-0 top-0 lg:static border-r border-l border-t border-gray lg:left-auto lg:top-auto  h-full w-full scrollbar-none`}
    >
      <div className="overflow-y-auto w-full scrollbar-none ">
        <Files />
        <Axes />
        <Filters />
        <States />
      </div>
    </div>
  );
};

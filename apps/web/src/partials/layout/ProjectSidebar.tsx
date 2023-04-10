import { useRef, useEffect, useState } from 'react';
// import { ExpandCollapse } from "./ExpandCollapse";
import { Files, States, Properties as Axes, Filters, Visualizations, VisualizationProps } from 'partials';
import { usePosition } from 'services/usePosition';
import { useRecoilState } from 'recoil';
import { glyphViewerDetails } from 'state/ui';

export const ProjectSidebar = () => {
  //utilities
  const sidebar = useRef(null);
  const projPosition = usePosition(sidebar);

  const [glyphxDetails, setGlyphxViewer] = useRecoilState(glyphViewerDetails);

  // set projectsSidebar position on transition
  useEffect(() => {
    if (sidebar.current !== null) {
      // setGlyphxViewer({
      //   // ...glyphxViewerDetails,
      //   // filterSidebarPosition: {
      //   //   values: sidebar.current.getBoundingClientRect(),
      //   // },
      // });
    }
  }, [glyphxDetails, projPosition, setGlyphxViewer]);

  return (
    <div
      id="sidebar"
      ref={sidebar}
      className={`flex grow flex-col bg-secondary-space-blue z-30 border-r border-l border-t border-gray h-full scrollbar-none`}
    >
      <div className="overflow-y-auto w-full scrollbar-none">
        <Files />
        <Axes />
        <Filters />
        <States />
      </div>
    </div>
  );
};

import { useRef, useEffect } from 'react';

import { Files } from './files';
import { Properties as Axes } from './properties';
import { Filters } from './filters';
import { States } from './states';

import { usePosition } from 'services/usePosition';
import { useSendPosition } from 'services';

export const ProjectSidebar = () => {
  //utilities
  const sidebar = useRef(null);
  // trigger sendPosition when sidebar changes
  const pos = usePosition(sidebar);
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
import { useRef, useEffect } from 'react';

import { Files } from './files';
import { Properties as Axes } from './properties';
import { Filters } from './filters';
import { States } from './states';

import { usePosition } from 'services/usePosition';
import { useSendPosition } from 'services';
import { useSetRecoilState } from 'recoil';
import { coordinatesAtom } from 'state';

export const ProjectSidebar = () => {
  //utilities
  const sidebar = useRef(null);
  // trigger sendPosition when sidebar changes
  const pos = usePosition(sidebar);
  const setCoords = useSetRecoilState(coordinatesAtom);

  // set projectsSidebar position on transition
  useEffect(() => {
    if (sidebar.current !== null) {
      const coords = sidebar.current.getBoundingClientRect();
      setCoords(coords);
    }
  }, [setCoords, pos]);

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

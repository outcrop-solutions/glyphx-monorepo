import { useRef, useEffect } from 'react';

import { Files } from './files';
import { Properties as Axes } from './properties';
import { Filters } from './filters';
import { States } from './states';

import { usePosition } from 'services/usePosition';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { leftCoordinatesAtom, windowSizeAtom } from 'state';
import { Annotations } from './annotations';

export const ProjectSidebar = () => {
  //utilities
  const sidebar = useRef(null);
  // trigger sendPosition when sidebar changes
  const pos = usePosition(sidebar);
  const setCoords = useSetRecoilState(leftCoordinatesAtom);
  const { width, height } = useRecoilValue(windowSizeAtom);

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
      className={`flex grow flex-col bg-secondary-space-blue z-30 border-r border-l border-t border-gray h-full scrollbar-none w-[250px] shrink-0`}
    >
      <div
        style={{
          height: `${height && height - 60}px`,
        }}
        className={`overflow-y-auto w-full scrollbar-none`}
      >
        <Files />
        <Axes />
        <Filters />
        <States />
        <Annotations />
      </div>
    </div>
  );
};

import { useRef, useEffect } from 'react';
import { usePosition } from 'services/usePosition';
import { useSendPosition } from 'services';
import { useSetRecoilState } from 'recoil';
import { leftCoordinatesAtom } from 'state';

export const RightSidebar = () => {
  //utilities
  const sidebar = useRef(null);
  // trigger sendPosition when sidebar changes
  const pos = usePosition(sidebar);
  const setCoords = useSetRecoilState(leftCoordinatesAtom);

  // set projectsSidebar position on transition
  useEffect(() => {
    if (sidebar.current !== null) {
      const coords = sidebar.current.getBoundingClientRect();
      setCoords(coords);
    }
  }, [setCoords, pos]);

  return (
    <div
      id="right-sidebar"
      ref={sidebar}
      className={`flex grow flex-col bg-secondary-space-blue z-30 border-r border-l border-t border-gray h-full scrollbar-none`}
    >
      <div className="overflow-y-auto w-full scrollbar-none">
        <></>
      </div>
    </div>
  );
};

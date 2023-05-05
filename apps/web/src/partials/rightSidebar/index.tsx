import { useRef, useEffect, useCallback } from 'react';
import { usePosition } from 'services/usePosition';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { rightCoordinatesAtom, rightSidebarControlAtom } from 'state';
import ClickAwayListener from 'react-click-away-listener';
import produce from 'immer';
import { web as webTypes } from '@glyphx/types';
import { Info } from './Info';
import { Share } from './Share';
import { Notifications } from './Notifications';
import { WritableDraft } from 'immer/dist/internal';

export const RightSidebar = () => {
  const [sidebarControl, setRightSidebarControl] = useRecoilState(rightSidebarControlAtom);
  //utilities
  const sidebar = useRef(null);
  // trigger sendPosition when sidebar changes
  const pos = usePosition(sidebar);
  const setCoords = useSetRecoilState(rightCoordinatesAtom);

  // set projectsSidebar position on transition
  useEffect(() => {
    if (sidebar.current !== null) {
      const coords = sidebar.current.getBoundingClientRect();
      setCoords(coords);
    }
  }, [setCoords, pos]);

  return (
    <>
      {sidebarControl.type ? (
        <div
          id="right-sidebar"
          ref={sidebar}
          className={`flex grow flex-col bg-secondary-space-blue border-l border-gray h-full scrollbar-none`}
        >
          {/* <ClickAwayListener onClickAway={handleClickAway}> */}
          <div className="w-full h-full grow scrollbar-none">
            {(() => {
              switch (sidebarControl.type) {
                case webTypes.constants.RIGHT_SIDEBAR_CONTROL.INFO:
                  return <Info />;
                case webTypes.constants.RIGHT_SIDEBAR_CONTROL.SHARE:
                  return <Share />;
                case webTypes.constants.RIGHT_SIDEBAR_CONTROL.NOTIFICATION:
                  return <Notifications />;
                case webTypes.constants.RIGHT_SIDEBAR_CONTROL.SEARCH:
                  return <></>;
                default:
                  return <></>;
              }
            })()}
          </div>
          {/* </ClickAwayListener> */}
        </div>
      ) : null}
    </>
  );
};

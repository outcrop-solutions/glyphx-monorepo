import { useRef, useEffect } from 'react';
import { usePosition } from 'services/usePosition';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { rightCoordinatesAtom, rightSidebarControlAtom } from 'state';
import ClickAwayListener from 'react-click-away-listener';
import produce from 'immer';
import { Info } from './Info';
import { Share } from './Share';
import { Notifications } from './Notifications';

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

  const handleClickAway = () => {
    setRightSidebarControl(
      produce((draft) => {
        draft.type = false;
      })
    );
  };

  useEffect(() => {
    console.log({ sidebarControl });
  }, [sidebarControl]);

  return (
    <>
      {sidebarControl.type ? (
        <div
          id="right-sidebar"
          ref={sidebar}
          className={`flex grow flex-col bg-secondary-space-blue border-l border-t border-gray h-full scrollbar-none`}
        >
          <ClickAwayListener onClickAway={handleClickAway}>
            <div className="overflow-y-auto w-full scrollbar-none">
              {(() => {
                switch (sidebarControl.type) {
                  case 'info':
                    return <Info />;
                  case 'share':
                    return <Share />;
                  case 'notification':
                    return <Notifications />;
                  case 'search':
                    return <></>;
                  case 'comments':
                    return <></>;
                  default:
                    return <></>;
                }
              })()}
            </div>
          </ClickAwayListener>
        </div>
      ) : null}
    </>
  );
};

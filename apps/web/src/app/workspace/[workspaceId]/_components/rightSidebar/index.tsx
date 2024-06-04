'use client';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {rightSidebarControlAtom} from 'state';
import {webTypes} from 'types';
import {Info} from './Info';
import {Share} from './Share';
import {Notifications} from './Notifications';

export const RightSidebar = () => {
  const [sidebarControl] = useRecoilState(rightSidebarControlAtom);
  //utilities

  return (
    <>
      {sidebarControl.type ? (
        <div
          id="right-sidebar"
          className={`flex grow flex-col bg-secondary-space-blue border-l border-gray border-r-0 h-full scrollbar-none`}
        >
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
        </div>
      ) : null}
    </>
  );
};

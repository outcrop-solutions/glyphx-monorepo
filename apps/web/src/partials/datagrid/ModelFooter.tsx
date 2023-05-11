import { useCallback, useEffect } from 'react';
import * as dayjs from 'dayjs';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  drawerOpenAtom,
  orientationAtom,
  showLoadingAtom,
  splitPaneSizeAtom,
  viewerPositionSelector,
  windowSizeAtom,
} from 'state';
import { PlusIcon, XIcon } from '@heroicons/react/outline';
// import { PlusIcon } from "@heroicons/react/solid";

const footerHeight = 44;
const resizeHandle = 4;

export const ModelFooter = () => {
  const viewer = useRecoilValue(viewerPositionSelector);
  const windowSize = useRecoilValue(windowSizeAtom);
  const [drawer, setDrawer] = useRecoilState(drawerOpenAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);

  const loading = useRecoilValue(showLoadingAtom);
  const [orientation, setOrientation] = useRecoilState(orientationAtom);

  const handleOpenClose = useCallback(() => {
    if (drawer && windowSize.height) {
      // close drawer
      setResize(windowSize.height - 70);
      setOrientation('horizontal');

      setDrawer(false);
      window?.core?.ToggleDrawer(false);
    } else {
      // open drawer
      setResize(150);
      setDrawer(true);
      window?.core?.ToggleDrawer(true);
    }
  }, [drawer, setDrawer, setOrientation, setResize, windowSize.height]);

  return viewer && !(Object.keys(loading).length > 0) ? (
    <div
      style={{
        position: 'fixed',
        left: `${viewer.x - (orientation === 'vertical' ? 0 : 0)}px`,
        top: `${viewer.y - (footerHeight + resizeHandle)}px`,
        width: `${viewer.w - (orientation === 'vertical' ? 10 : 0)}px`,
      }}
      className={`z-60 h-[44px] ${
        orientation === 'vertical' ? 'border-b-none border-r-none border-b border-gray' : 'border border-gray'
      } bg-primary-dark-blue text-xs flex items-center`}
    >
      <div
        onClick={handleOpenClose}
        className="flex relative cursor-pointer group hover:bg-gray items-center border-r border-r-gray h-full px-4"
      >
        <div
          className={`${
            drawer ? 'text-secondary-blue' : 'text-white'
          } mr-2 text-xs font-roboto font-medium leading-[14px] tracking-[0.01em]`}
        >
          Glyph Viewer
        </div>
      </div>
    </div>
  ) : null;
};

'use client';
import {useCallback, useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {
  drawerOpenAtom,
  hasDrawerBeenShownAtom,
  orientationAtom,
  projectAtom,
  showLoadingAtom,
  splitPaneSizeAtom,
  viewerPositionSelector,
  windowSizeAtom,
} from 'state';
import {callDownloadModel} from 'lib/client/network/reqs/callDownloadModel';
import {useSession} from 'next-auth/react';
import {useUrl} from 'lib/client/hooks';
import {cameraAtom, imageHashAtom} from 'state/snapshot'
export const ModelFooter = () => {
  // const { mutate } = useSWRConfig();
  // ensures we don't pre-render the server
  const [isClient, setIsClient] = useState(false);
  const [hasDrawerBeenShown, setHasDrawerBeenShown] = useRecoilState(hasDrawerBeenShownAtom);

  const setCamera = useSetRecoilState(cameraAtom);
  const setImageHash = useSetRecoilState(imageHashAtom);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const session = useSession();
  const url = useUrl();
  const viewer = useRecoilValue(viewerPositionSelector);
  const project = useRecoilValue(projectAtom);
  const windowSize = useRecoilValue(windowSizeAtom);
  const [drawer, setDrawer] = useRecoilState(drawerOpenAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const [loading, setLoading] = useRecoilState(showLoadingAtom);
  const [orientation, setOrientation] = useRecoilState(orientationAtom);

  const handleOpenClose = useCallback(async () => {
    if (drawer && windowSize.height) {
      // close drawer
      setResize(windowSize.height - 105);
      setOrientation('horizontal');

      setDrawer(false);
      window?.core?.ToggleDrawer(false);
    } else if (window && !window.core) {
      setResize(150);
      setDrawer(true);
    } else {
      // open drawer
      await callDownloadModel({project, session, url, setLoading, setDrawer, setResize, setImageHash, setCamera});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawer, project, session, setDrawer, setLoading, setOrientation, setResize, url, windowSize.height]);

  return (
    isClient &&
    viewer &&
    !(Object.keys(loading).length > 0) && (
      <div
        style={{
          position: 'fixed',
          left: `${viewer.x - (orientation === 'vertical' ? 0 : 5)}px`,
          top: `${viewer.y - 44}px`,
          width: `${viewer.w + 5}px`,
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
    )
  );
};

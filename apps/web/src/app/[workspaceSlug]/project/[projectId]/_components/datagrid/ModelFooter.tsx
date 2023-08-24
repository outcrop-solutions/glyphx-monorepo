import { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  drawerOpenAtom,
  orientationAtom,
  projectAtom,
  showLoadingAtom,
  splitPaneSizeAtom,
  viewerPositionSelector,
  windowSizeAtom,
} from 'state';
import { callDownloadModel } from 'lib/client/network/reqs/callDownloadModel';
import { hashFileSystem } from 'lib/utils/hashFileSystem';
import { hashPayload } from 'lib/utils/hashPayload';
import { useSession } from 'next-auth/react';
import { useUrl } from 'lib/client/hooks';

export const ModelFooter = () => {
  // const { mutate } = useSWRConfig();
  const session = useSession();
  const url = useUrl();
  const viewer = useRecoilValue(viewerPositionSelector);
  const project = useRecoilValue(projectAtom);
  const windowSize = useRecoilValue(windowSizeAtom);
  const [drawer, setDrawer] = useRecoilState(drawerOpenAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const [loading, setLoading] = useRecoilState(showLoadingAtom);
  const [orientation, setOrientation] = useRecoilState(orientationAtom);
  const isBrowser = !(window && window?.core);

  const handleOpenClose = useCallback(async () => {
    if (drawer && windowSize.height) {
      // close drawer
      setResize(windowSize.height - 105);
      setOrientation('horizontal');

      setDrawer(false);
      window?.core?.ToggleDrawer(false);
    } else if (isBrowser) {
      setResize(150);
      setDrawer(true);
    } else {
      // open drawer
      const payloadHash = hashPayload(hashFileSystem(project.files), project);
      await callDownloadModel({ project, payloadHash, session, url, setLoading, setDrawer, setResize });
    }
  }, [drawer, isBrowser, project, session, setDrawer, setLoading, setOrientation, setResize, url, windowSize.height]);

  return viewer && !(Object.keys(loading).length > 0) ? (
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
  ) : null;
};

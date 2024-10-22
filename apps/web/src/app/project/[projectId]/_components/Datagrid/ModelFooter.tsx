'use client';
import {useCallback, useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue} from 'recoil';
import {drawerOpenAtom, modelRunnerAtom, orientationAtom, projectAtom, showLoadingAtom, windowSizeAtom} from 'state';
import {useSession} from 'next-auth/react';
import {useUrl} from 'lib/client/hooks';

export const ModelFooter = () => {
  // ensures we don't pre-render the server
  const [isClient, setIsClient] = useState(false);
  const modelRunnerState = useRecoilValue(modelRunnerAtom);

  // const setCamera = useSetRecoilState(cameraAtom);
  // const setImageHash = useSetRecoilState(imageHashAtom);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const session = useSession();
  const url = useUrl();
  const project = useRecoilValue(projectAtom);
  const windowSize = useRecoilValue(windowSizeAtom);
  const [drawer, setDrawer] = useRecoilState(drawerOpenAtom);
  const [loading, setLoading] = useRecoilState(showLoadingAtom);
  const [orientation, setOrientation] = useRecoilState(orientationAtom);

  const handleOpenClose = useCallback(async () => {
    if (drawer && windowSize.height) {
      // if open, close
      setOrientation('horizontal');
      setDrawer(false);
    } else {
      // if closed, open the model
      setDrawer(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawer, project, session, setDrawer, setLoading, setOrientation, url, windowSize.height]);

  return (
    isClient &&
    modelRunnerState.lastPayloadHash && (
      <div
        className={`absolute z-60 w-full h-[44px] ${
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

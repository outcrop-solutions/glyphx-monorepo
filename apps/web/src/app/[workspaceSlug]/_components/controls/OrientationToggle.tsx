import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { webTypes } from 'types';
import { drawerOpenAtom, orientationAtom, splitPaneSizeAtom, windowSizeAtom } from 'state';
import HorizontalIcon from 'public/svg/horizontal-layout.svg';
import VerticalIcon from 'public/svg/vertical-layout.svg';

const btnClass =
  'h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const OrientationToggle = () => {
  const [orientation, setOrientation] = useRecoilState(orientationAtom);
  const setPaneSize = useSetRecoilState(splitPaneSizeAtom);
  const windowSize = useRecoilValue(windowSizeAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);

  const handleOrientation = useCallback(() => {
    if (orientation === 'horizontal') {
      setDrawer(true);
      window?.core?.ToggleDrawer(true);
      setPaneSize(400);
    }
    setOrientation(
      produce((draft: WritableDraft<webTypes.SplitPaneOrientation>) => {
        if (draft === 'horizontal') {
          return 'vertical';
        } else {
          return 'horizontal';
        }
      })
    );
  }, [orientation, setOrientation, setDrawer, setPaneSize]);

  return (
    <button onClick={() => handleOrientation()} className={`${btnClass}`}>
      {orientation === 'horizontal' ? <HorizontalIcon /> : <VerticalIcon />}
    </button>
  );
};

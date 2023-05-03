import { web as webTypes } from '@glyphx/types';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { windowSizeAtom } from 'state';

export const useWindowSize = () => {
  // return new callback when window size changes
  const setWindowSize = useSetRecoilState(windowSizeAtom);

  useEffect(() => {
    function handleResize() {
      setWindowSize(
        produce((draft: WritableDraft<webTypes.IWindowSize>) => {
          draft.width = window.innerWidth;
          draft.height = window.innerHeight;
        })
      );
    }

    setWindowSize(
      produce((draft: WritableDraft<webTypes.IWindowSize>) => {
        draft.width = window.innerWidth;
        draft.height = window.innerHeight;
      })
    );

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [setWindowSize]);
};

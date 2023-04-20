import produce from 'immer';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { windowSizeAtom } from 'state';

export const useWindowSize = () => {
  // return new callback when window size changes
  const setWindowSize = useSetRecoilState(windowSizeAtom);

  useEffect(() => {
    function handleResize() {
      setWindowSize(
        produce((draft) => {
          draft.width = window.innerWidth;
          draft.height = window.innerHeight;
        })
      );
    }

    setWindowSize(
      produce((draft) => {
        draft.width = window.innerWidth;
        draft.height = window.innerHeight;
      })
    );

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [setWindowSize]);
};

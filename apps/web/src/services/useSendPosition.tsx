import { useCallback, useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { rightSidebarControlAtom, viewerPositionAtom } from 'state';

export const useSendPosition = () => {
  const setViewer = useSetRecoilState(viewerPositionAtom);
  const isControlOpen = useRecoilValue(rightSidebarControlAtom);

  // return new callback when window size changes
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sendPosition = useCallback(
    (coords: DOMRect) => {
      try {
        window?.core?.SendDrawerPosition(
          JSON.stringify({
            x: coords.right,
            y: coords.top,
            // assumes left & right sidebar are equal width
            w: windowSize.width - (coords.right + (isControlOpen ? coords.width : 0)),
            h: coords.height,
          })
        );
        setViewer({
          x: coords.right,
          y: coords.top,
          // assumes left & right sidebar are equal width
          w: windowSize.width - (coords.right + (isControlOpen ? coords.width : 0)),
          h: coords.height,
        });
      } catch (error) {
        console.log({ error });
      }
    },
    [isControlOpen, setViewer, windowSize.width]
  );

  return { sendPosition };
};

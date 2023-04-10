import { useCallback, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { viewerPositionAtom, showInfoDropdownAtom, showNotificationDropdownAtom, showShareModalOpenAtom } from 'state';

export const useSendPosition = () => {
  const setViewer = useSetRecoilState(viewerPositionAtom);
  const isShareOpen = useRecoilValue(showShareModalOpenAtom);
  const isInfoOpen = useRecoilValue(showNotificationDropdownAtom);
  const isNotifOpen = useRecoilValue(showInfoDropdownAtom);

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
        console.log({
          x: coords.right,
          y: coords.top,
          w: windowSize.width - (coords.right + (isShareOpen || isInfoOpen || isNotifOpen ? coords.width : 0)),
          h: coords.height,
        });
        // window?.core?.SendDrawerPosition(
        //   JSON.stringify({
        //     x: coords.right,
        //     y: coords.top,
        //     w: windowSize.width - (coords.right + (isShareOpen || isInfoOpen || isNotifOpen ? coords.width : 0)),
        //     h: coords.height,
        //   })
        // );
        setViewer({
          x: coords.right,
          y: coords.top,
          // assumes left & right sidebar are equal width
          w: windowSize.width - (coords.right + (isShareOpen || isInfoOpen || isNotifOpen ? coords.width : 0)),
          h: coords.height,
        });
      } catch (error) {
        console.log({ error });
      }
    },
    [isInfoOpen, isNotifOpen, isShareOpen, setViewer, windowSize.width]
  );

  return { sendPosition };
};

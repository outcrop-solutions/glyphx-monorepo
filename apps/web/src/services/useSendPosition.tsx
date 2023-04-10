import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { viewerPositionAtom, showInfoDropdownAtom, showNotificationDropdownAtom, showShareModalOpenAtom } from 'state';

const useSendPosition = () => {
  const [glyphViewer, setGlyphViewer] = useRecoilState(viewerPositionAtom);
  const isShareOpen = useRecoilValue(showShareModalOpenAtom);
  const isInfoOpen = useRecoilValue(showNotificationDropdownAtom);
  const isNotifOpen = useRecoilValue(showInfoDropdownAtom);

  useEffect(() => {
    if (glyphViewer.sendDrawerPositionApp) {
      var yValue = Math.round(window.innerHeight * 0.882);
      var heightValue = Math.round(window.innerHeight * 0.157);
      var leftValue = window.innerWidth;
      if (isShareOpen || isInfoOpen || isNotifOpen || true) {
        leftValue = window.innerWidth - 250;
      }

      try {
        window?.core?.SendDrawerPosition(
          JSON.stringify({
            filterSidebar: {
              y: yValue, //843
              right: 335,
              height: heightValue,
            },
            commentsSidebar: {
              left: leftValue,
            },
          })
        );
        setGlyphViewer({
          ...glyphViewer,
          sendDrawerPositionApp: false,
        });
      } catch (error) {}
    }
  }, [glyphViewer, isInfoOpen, isNotifOpen, isShareOpen, setGlyphViewer]);
};

import { useCallback, useEffect } from 'react';
import { debounce } from 'lodash';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { drawerOpenAtom, orientationAtom, splitPaneSizeAtom } from 'state';

export const useResize = () => {
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const orientation = useRecoilValue(orientationAtom);
  const splitPaneSize = useRecoilValue(splitPaneSizeAtom);
  // sane default to show column headers at minimum
  const minSize = () => 70;
  // sane default to allow resize
  const maxSize = () => 7000;
  // corresponds to splitPaneSizeAtom default intialization,
  // they must be === for this to work so change them simultaneously
  const defaultSize = () => splitPaneSize;
  const split = () => orientation;

  // TODO: uncomment upon further inspection to limit resize when model footer is present
  // const window = useRecoilValue(windowSizeAtom);
  // const viewer = useRecoilValue(viewerPositionSelector);

  // const divisor = 2;,

  // const maxSize = () => {
  //   if (window.width && window.height && viewer) {
  //     if (orientation === 'horizontal') {
  //       return window.height - viewer.y;
  //     } else {
  //       return window.width - viewer.x;
  //     }
  //   } else {
  //     return 1000; // sane default
  //   }
  // };
  // const defaultSize = () => {
  //   if (window.width && window.height) {
  //     if (orientation === 'horizontal') {
  //       return window.height / divisor;
  //     } else {
  //       return window.width / divisor;
  //     }
  //   } else {
  //     return 0;
  //   }
  // };
  // const maxSize = () => (window ? (orientation === 'horizontal' ? window.height - 250 : window.width - 250) : 0);
  // const defaultSize = () => (orientation === 'vertical' ? viewer.h : viewer.w);

  const debouncedOnChange = debounce((data) => {
    setResize(data);
  }, 50);

  const handlePaneResize = useCallback(
    (size) => {
      debouncedOnChange(size);
    },
    [debouncedOnChange]
  );

  return { handlePaneResize, defaultSize, maxSize, minSize, split };
};

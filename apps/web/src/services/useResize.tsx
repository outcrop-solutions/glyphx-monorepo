import { useCallback } from 'react';
import { debounce } from 'lodash';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { coordinatesAtom, orientationAtom, splitPaneSizeAtom, viewerPositionSelector, windowSizeAtom } from 'state';

export const useResize = () => {
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const window = useRecoilValue(windowSizeAtom);
  const orientation = useRecoilValue(orientationAtom);
  const viewer = useRecoilValue(viewerPositionSelector);

  const minSize = () => 70;
  const maxSize = () => {
    if (window.width && window.height && viewer) {
      if (orientation === 'horizontal') {
        return window.height - viewer.y;
      } else {
        return window.width - viewer.x;
      }
    } else {
      return 1000; // sane default
    }
  };

  const split = () => orientation;

  const divisor = 2;

  const defaultSize = () => {
    if (window.width && window.height) {
      if (orientation === 'horizontal') {
        return window.height / divisor;
      } else {
        return window.width / divisor;
      }
    } else {
      return 0;
    }
  };
  // const maxSize = () => (window ? (orientation === 'horizontal' ? window.height - 250 : window.width - 250) : 0);
  // const defaultSize = () => (orientation === 'vertical' ? viewer.h : viewer.w);

  const debouncedOnChange = debounce((data) => {
    setResize(data);
  }, 100);

  const handlePaneResize = useCallback(
    (size) => {
      debouncedOnChange(size);
    },
    [debouncedOnChange]
  );

  return { handlePaneResize, defaultSize, maxSize, minSize, split };
};

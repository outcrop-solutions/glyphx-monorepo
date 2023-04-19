import { useCallback } from 'react';
import { debounce } from 'lodash';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { orientationAtom, splitPaneSizeAtom, viewerPositionAtom, windowSizeAtom } from 'state';
import produce from 'immer';
import { useSendPosition } from './useSendPosition';

export const useResize = () => {
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const orientation = useRecoilValue(orientationAtom);
  const window = useRecoilValue(windowSizeAtom);

  const minSize = () => 70;
  const maxSize = () => 500;
  const split = () => orientation;

  const defaultSize = () => 500;
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

import { atom, selector } from 'recoil';
import { web as webTypes } from '@glyphx/types';
import { rightSidebarControlAtom } from './ui';
import { calcH, calcW, calcX, calcY } from './utilities';
/**
 * RESIZE LOGIC
 */

export const coordinatesAtom = atom<DOMRectReadOnly | false>({
  key: 'coordinatesAtom',
  default: false,
});

export const windowSizeAtom = atom<webTypes.IWindowSize>({
  key: 'windowSizeAtom',
  default: {
    width: false,
    height: false,
  },
});

export const orientationAtom = atom<webTypes.SplitPaneOrientation>({
  key: 'orientationAtom',
  default: 'horizontal',
});

export const splitPaneSizeAtom = atom<false | number>({
  key: 'splitPaneSizeAtom',
  default: false,
});

export const viewerPositionSelector = selector<webTypes.IViewerPosition | false>({
  key: 'viewerPositionSelector',
  get: ({ get }) => {
    const coords = get(coordinatesAtom);
    const window = get(windowSizeAtom);
    const orientation = get(orientationAtom);
    const resize = get(splitPaneSizeAtom);
    const isControlOpen = get(rightSidebarControlAtom);

    console.log({ coords, window, orientation, resize, isControlOpen });
    if (coords && window.width) {
      const x = calcX(coords, resize, orientation);
      const y = calcY(coords, resize, orientation);
      const w = calcW(coords, resize, orientation, isControlOpen, window);
      const h = calcH(coords, resize, orientation);
      console.log({
        x: x,
        y: y,
        w: w,
        h: h,
      });
      return {
        x: x,
        y: y,
        w: w,
        h: h,
      };
    } else {
      return false;
    }
  },
});

// x: 342, w-MainSidebar + w-ProjectSidebar + (vertical && w-grid)
// y: 206,  h-Mainheader + h-Projectheader + h-GridHeader + (horizontal && h-Grid)
// w: 1422,  window.innerWidth - (w-MainSidebar + w-ProjectSidebar + w-RightSidebar - (vertical && w-Grid)
// h: 1575,  window.innerHeight - h-Projectheader - (horizontal && h-Grid)

import {atom, selector} from 'recoil';
import {webTypes} from 'types';
import {rightSidebarControlAtom} from './ui';
import {calcH, calcW, calcX, calcY} from './utilities';
/**
 * RESIZE LOGIC
 */

export const leftCoordinatesAtom = atom<DOMRectReadOnly | false>({
  key: 'leftCoordinatesAtom',
  default: false,
});

export const rightCoordinatesAtom = atom<DOMRectReadOnly | false>({
  key: 'rightCoordinatesAtom',
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

// corresponds to the size of the pane containing the data grid
export const splitPaneSizeAtom = atom<number>({
  key: 'splitPaneSizeAtom',
  default: 100,
});

export const drawerOpenAtom = atom<boolean>({
  key: 'drawerOpen',
  default: false,
});

export const viewerPositionSelector = selector<webTypes.IViewerPosition | false>({
  key: 'viewerPositionSelector',
  get: ({get}) => {
    const coords = get(leftCoordinatesAtom);
    const window = get(windowSizeAtom);
    const orientation = get(orientationAtom);
    const resize = get(splitPaneSizeAtom);
    const isControlOpen = get(rightSidebarControlAtom);

    // returned when drawer is open
    if (coords && window.width) {
      const x = calcX(coords, resize, orientation);
      const y = calcY(coords, resize, orientation);
      const w = calcW(coords, resize, orientation, isControlOpen.type, window);
      const h = calcH(coords, resize, orientation);
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

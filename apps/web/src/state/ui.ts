import { atom, selector } from 'recoil';
import { web as webTypes } from '@glyphx/types';
// SHOW/HIDE UI ELEMENTS
// SHOW = TRUE
// HIDE = FALSE

// Global
// Right Sidebar Controls
export const rightSidebarControlAtom = atom<webTypes.RightSidebarControl>({
  key: 'rightSidebarControlAtom',
  default: false,
});

export const showMainSidebarExpandedAtom = atom<boolean>({
  key: 'showMainSidebarExpandedAtom',
  default: false,
});

// Home View
export const showProjectsGridViewAtom = atom<boolean>({
  key: 'showProjectsGridViewAtom',
  default: true,
});

// Project View
export const showQtViewerAtom = atom<boolean>({
  key: 'showQtViewerAtom',
  default: false,
});

export const showModalAtom = atom<{
  type: webTypes.ModalContent;
  isSubmitting: boolean;
  data: Record<string, unknown>;
}>({
  key: 'showModalAtom',
  default: {
    type: false,
    isSubmitting: false,
    data: {},
  },
});

export const showDataGridLoadingAtom = atom<boolean>({
  key: 'showDataGridLoading',
  default: false,
});

export const showModelCreationLoadingAtom = atom<boolean>({
  key: 'modelCreationLoading',
  default: false,
});

/**
 * RESIZE LOGIC
 */

export const coordinatesAtom = atom<DOMRectReadOnly | false>({
  key: 'coordinatesAtom',
  default: false,
});

export const windowSizeAtom = atom<{ width: number | false; height: number | false }>({
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

export const splitPaneSizeAtom = atom({
  key: 'splitPaneSizeAtom',
  default: false,
});

const calcX = (coords, resize, orientation) => {
  return Math.round(coords.right + (resize && orientation === 'vertical' ? resize : 0));
};
const calcY = (coords, resize, orientation) => {
  return Math.round(coords.top + (resize && orientation === 'horizontal' ? resize : 0));
};

const calcW = (coords, resize, orientation, isControlOpen, window) => {
  return Math.round(
    window.width -
      (coords.right + (isControlOpen ? coords.width : 0)) -
      (resize && orientation === 'vertical' ? resize : 0)
  );
};

const calcH = (coords, resize, orientation) => {
  return Math.round(coords.height - (resize && orientation === 'horizontal' ? resize : 0));
};

export const viewerPositionAtom = selector<webTypes.IViewerPosition>({
  key: 'viewerPositionAtom',
  get: ({ get }) => {
    const coords = get(coordinatesAtom);
    const window = get(windowSizeAtom);
    const orientation = get(orientationAtom);
    const resize = get(splitPaneSizeAtom);
    const isControlOpen = get(rightSidebarControlAtom);

    console.log({ coords, window });
    if (coords && window.width) {
      const x = calcX(coords, resize, orientation);
      const y = calcY(coords, resize, orientation);
      const w = calcW(coords, resize, orientation, isControlOpen, window);
      const h = calcH(coords, resize, orientation);
      return {
        x: x,
        y: y,
        w: w,
        h: h,
      };
    } else {
      return {
        x: 342,
        y: 206,
        w: 1422,
        h: 1575,
      };
    }
  },
});

// x: 342, w-MainSidebar + w-ProjectSidebar + (vertical && w-grid)
// y: 206,  h-Mainheader + h-Projectheader + h-GridHeader + (horizontal && h-Grid)
// w: 1422,  window.innerWidth - (w-MainSidebar + w-ProjectSidebar + w-RightSidebar - (vertical && w-Grid)
// h: 1575,  window.innerHeight - h-Projectheader - (horizontal && h-Grid)

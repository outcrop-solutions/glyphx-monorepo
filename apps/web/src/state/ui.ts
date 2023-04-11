import { atom } from 'recoil';
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

export const showHorizontalOrientationAtom = atom<boolean>({
  key: 'showHorizontalOrientationAtom',
  default: false,
});

export const showAddProjectAtom = atom<boolean>({
  key: 'showAddProject',
  default: false,
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
 * Required to position the Qt Glyph Viewer
 */

export const viewerPositionAtom = atom<webTypes.IViewerPosition>({
  key: 'viewerPositionAtom',
  default: {
    x: 0, // w-MainSidebar + w-ProjectSidebar
    y: 0, // h-Projectheader
    w: 0, // window.innerWidth - (w-MainSidebar + w-ProjectSidebar + w-RightSidebar)
    h: 0, // window.innerHeight - h-Projectheader
  },
});

import { atom } from 'recoil';
import { database as databaseTypes, web as webTypes } from '@glyphx/types';
// SHOW/HIDE UI ELEMENTS
// SHOW = TRUE
// HIDE = FALSE

// Global
// Right Sidebar Controls
export const rightSidebarControlAtom = atom<webTypes.IRightSidebarAtom>({
  key: 'rightSidebarControlAtom',
  default: {
    type: webTypes.constants.RIGHT_SIDEBAR_CONTROL.CLOSED,
    isSubmitting: false,
    data: {},
  },
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

export const modalsAtom = atom<webTypes.IModalsAtom>({
  key: 'modalsAtom',
  default: {
    modals: [],
  },
});

export const showLoadingAtom = atom<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>({
  key: 'showLoadingAtom',
  default: {},
});

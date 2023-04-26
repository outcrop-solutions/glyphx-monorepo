import { atom, selector } from 'recoil';
import { web as webTypes } from '@glyphx/types';
// SHOW/HIDE UI ELEMENTS
// SHOW = TRUE
// HIDE = FALSE

// Global
// Right Sidebar Controls
export const rightSidebarControlAtom = atom<{ type: webTypes.RightSidebarControl; isSubmitting: boolean; data: any }>({
  key: 'rightSidebarControlAtom',
  default: {
    type: false,
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

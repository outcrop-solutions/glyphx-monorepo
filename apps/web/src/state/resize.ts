import {atom} from 'recoil';
import {webTypes} from 'types';

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

type Size = {
  width?: number;
  height?: number;
};

export const canvasSizeAtom = atom<Size>({
  key: 'canvasSizeAtom',
  default: {
    width: undefined,
    height: undefined,
  },
});

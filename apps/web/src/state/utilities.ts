import { web as webTypes } from '@glyphx/types';

// ensure viewer doesn't cover resize handles
const buffer = 5;
const hTranslate = 0;
const vTranslate = 0;
const modelFooterHeight = 44;

const calcX = (coords: DOMRectReadOnly, resize: number, orientation: webTypes.SplitPaneOrientation) => {
  return Math.round(coords.right + (orientation === 'vertical' ? resize + buffer : 0));
};

const calcY = (coords: DOMRectReadOnly, resize: number, orientation: webTypes.SplitPaneOrientation) => {
  return Math.round(coords.top + (orientation === 'horizontal' ? resize : modelFooterHeight));
};

const calcW = (
  coords: DOMRectReadOnly,
  resize: number,
  orientation: webTypes.SplitPaneOrientation,
  isControlOpen: webTypes.constants.RIGHT_SIDEBAR_CONTROL,
  window: webTypes.IWindowSize
) => {
  return Math.round(
    (window.width ? window.width : 0) -
      (coords.right + (isControlOpen !== webTypes.constants.RIGHT_SIDEBAR_CONTROL.CLOSED ? coords.width : 0)) -
      (orientation === 'vertical' ? resize : 0)
  );
};

const calcH = (coords: DOMRectReadOnly, resize: number, orientation: webTypes.SplitPaneOrientation) => {
  return Math.round(coords.height - (orientation === 'horizontal' ? resize : modelFooterHeight));
};

export { calcX, calcY, calcW, calcH };

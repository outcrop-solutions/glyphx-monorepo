import { web as webTypes } from '@glyphx/types';

// ensure viewer doesn't cover resize handles
const buffer = 10;
const hTranslate = 15;
const vTranslate = 0;

const calcX = (coords: DOMRectReadOnly, resize: number, orientation: webTypes.SplitPaneOrientation) => {
  return Math.round(coords.right + (orientation === 'vertical' ? resize + buffer : buffer));
};

const calcY = (coords: DOMRectReadOnly, resize: number, orientation: webTypes.SplitPaneOrientation) => {
  return Math.round(coords.top + (orientation === 'horizontal' ? resize + buffer : buffer));
};

const calcW = (
  coords: DOMRectReadOnly,
  resize: number,
  orientation: webTypes.SplitPaneOrientation,
  isControlOpen: webTypes.RightSidebarControl,
  window: webTypes.IWindowSize
) => {
  return Math.round(
    (window.width ? window.width : 0) -
      (coords.right + (isControlOpen ? coords.width : 0)) -
      (orientation === 'vertical' ? resize + buffer : buffer)
  );
};

const calcH = (coords: DOMRectReadOnly, resize: number, orientation: webTypes.SplitPaneOrientation) => {
  return Math.round(
    coords.height - (orientation === 'horizontal' ? resize + buffer + hTranslate : buffer + vTranslate)
  );
};

export { calcX, calcY, calcW, calcH };

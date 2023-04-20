import { web as webTypes } from '@glyphx/types';

const calcX = (coords: DOMRectReadOnly, resize: number | false, orientation: webTypes.SplitPaneOrientation) => {
  return Math.round(coords.right + (resize && orientation === 'vertical' ? resize : 0));
};

const calcY = (coords: DOMRectReadOnly, resize: number | false, orientation: webTypes.SplitPaneOrientation) => {
  return Math.round(coords.top + (resize && orientation === 'horizontal' ? resize : 0));
};

const calcW = (
  coords: DOMRectReadOnly,
  resize: number | false,
  orientation: webTypes.SplitPaneOrientation,
  isControlOpen: webTypes.RightSidebarControl,
  window: webTypes.IWindowSize
) => {
  return Math.round(
    (window.width ? window.width : 0) -
      (coords.right + (isControlOpen ? coords.width : 0)) -
      (resize && orientation === 'vertical' ? resize : 0)
  );
};

const calcH = (coords: DOMRectReadOnly, resize: number | false, orientation: webTypes.SplitPaneOrientation) => {
  return Math.round(coords.height - (resize && orientation === 'horizontal' ? resize : 0));
};

export { calcX, calcY, calcW, calcH };

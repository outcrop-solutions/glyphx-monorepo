import {SplitPaneOrientation} from '../../types';

export interface IViewerPosition {
  orientation: SplitPaneOrientation;
  x: number; // (x-coord of top left corner of where Qt viewer moves to)
  y: number; // (y-coord of top left corner of where Qt viewer moves to)
  w: number; // (width of qt window)
  h: number; // (height of qt window)
}

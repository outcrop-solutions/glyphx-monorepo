import {AXIS, ACCEPTS} from '../constants';
import {ILastDroppedItem} from '../interfaces/properties/iLastDroppedItem';

export type Property = {
  axis: AXIS;
  accepts: ACCEPTS;
  lastDroppedItem: ILastDroppedItem;
};

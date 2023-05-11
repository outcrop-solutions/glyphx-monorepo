import {RIGHT_SIDEBAR_CONTROL} from '../../constants';

export interface IWindowSize {
  width: number | false;
  height: number | false;
}

export interface IRightSidebarAtom {
  type: RIGHT_SIDEBAR_CONTROL;
  isSubmitting: boolean;
  data: any;
}

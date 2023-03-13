import {FUNCTION} from '../constants';
export interface IProperty {
  binding: string;
  function: FUNCTION;
  min: number;
  max: number;
  minRgb: number[];
  maxRgb: number[];
}

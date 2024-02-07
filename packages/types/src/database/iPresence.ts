import {Types as mongooseTypes} from 'mongoose';
import {Camera} from '../web';
import {IModelConfig} from './iModelConfig';

export interface IPresence {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  cursor: {
    // collaborative cursor position (multi-player)
    x: number;
    y: number;
  };
  camera: Camera; // collaborative camera position (multi-player)
  config: IModelConfig; // collaborative model configuration
}

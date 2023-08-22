import {Types as mongooseTypes} from 'mongoose';
import {Color} from '../web';

export interface IModelConfig {
  _id?: mongooseTypes.ObjectId;
  deletedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
  name: string;
  current: boolean;
  min_color: Color;
  max_color: Color;
  background_color: Color;
  x_axis_color: Color;
  y_axis_color: Color;
  z_axis_color: Color;
  grid_cylinder_radius: number;
  grid_cylinder_length: number;
  grid_cone_length: number;
  grid_cone_radius: number;
  glyph_offset: number;
  z_height_ratio: number;
  z_offset: number;
  toggle_grid_lines: boolean;
  toggle_glyph_offset: boolean;
  toggle_z_offset: boolean;
}

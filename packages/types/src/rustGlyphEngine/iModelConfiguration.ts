type Color = [number, number, number, number];
type Location = [number, number, number];
export interface IModelConfiguration {
  //set our color arrangment
  //60 gradations of color
  min_color: Color;
  max_color: Color;
  background_color: Color;
  x_axis_color: Color;
  y_axis_color: Color;
  z_axis_color: Color;
  //Define our grid
  //We keep the cone (arrowhead) and cylinder (arrow shaft) separate
  //shaft
  grid_cylinder_radius: number;
  grid_cylinder_length: number;
  //head
  grid_cone_length: number;
  grid_cone_radius: number;
  //How far from the edges do we place our glyphs
  glyph_offset: number;
  //How big can our glyhs be as a ratio of the base grid size
  z_height_ratio: number;
  //Gives a minium height for the glyphs
  min_glyph_height: number;

  light_location: Location;
  light_color: Color;
  light_intensity: number;
  glyph_size: number;
  model_origin: Location;
  x_interpolation: 'Linear' | 'Log';
  x_order: 'Asc' | 'Desc';
  y_interpolation: 'Linear' | 'Log';
  y_order: 'Asc' | 'Desc';
  z_interpolation: 'Linear' | 'Log';
  z_order: 'Asc' | 'Desc';
}

export interface IUpdateModelConfiguration extends Partial<IModelConfiguration> {}

use crate::assets::color::Color;
#[derive(Debug, Clone)]
pub struct ModelConfiguration {
    //set our color arrangment
    //60 gradations of color
    pub min_color: Color,
    pub max_color: Color,
    pub background_color: Color,
    pub x_axis_color: Color,
    pub y_axis_color: Color,
    pub z_axis_color: Color,
    //Define our grid 
    //We keep the cone (arrowhead) and cylinder (arrow shaft) separate
    //shaft
    pub grid_cylinder_radius: f32,
    pub grid_cylinder_length: f32,
    //head 
    pub grid_cone_length: f32,
    pub grid_cone_radius: f32,
    //How far from the edges do we place our glyphs
    pub glyph_offset: f32,
    //How big can our glyhs be as a ratio of the base grid size
    pub z_height_ratio: f32,
    //Gives a minium height for the glyphs
    pub min_glyph_height: f32,

    pub light_location: [f32; 3],
    pub light_color: Color,
    pub light_intensity: f32,
    pub glyph_size: f32,
    pub model_origin: [f32; 3],
}

impl Default for ModelConfiguration {
    fn default() -> Self {
        ModelConfiguration {
            min_color: [0.0, 0.0, 0.0, 1.0],
            max_color: [1.0, 1.0, 1.0, 1.0],
            background_color: [0.0, 0.0, 0.0, 1.0],
            x_axis_color: [1.0, 0.0, 0.0, 1.0],
            y_axis_color: [0.0, 1.0, 0.0, 1.0],
            z_axis_color: [0.0, 0.0, 1.0, 1.0],
            grid_cylinder_radius: 0.01,
            grid_cylinder_length: 1.0,
            grid_cone_length: 0.1,
            grid_cone_radius: 0.05,
            glyph_offset: 0.1,
            z_height_ratio: 0.1,
            min_glyph_height: 0.01,
            light_location: [0.0, 0.0, 1.0],
            light_color: [1.0, 1.0, 1.0, 1.0],
            light_intensity: 1.0,
            glyph_size: 0.1,
            model_origin: [0.0, 0.0, 0.0],
        }
    }
}

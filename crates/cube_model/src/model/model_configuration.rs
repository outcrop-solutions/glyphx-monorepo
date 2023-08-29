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

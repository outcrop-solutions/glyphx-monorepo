use crate::assets::color::Color;
#[derive(Debug, Clone)]
pub struct ModelConfiguration {
    pub min_color: Color,
    pub max_color: Color,
    pub num_colors: u16,
    pub background_color: Color,
    pub x_axis_color: Color,
    pub y_axis_color: Color,
    pub z_axis_color: Color,
}

use crate::assets::color::{Color, build_color_table };

#[repr(C)]
// This is so we can store this in a buffer
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
pub struct ColorTableUniform {
    color_table: [Color; 64],
}

impl ColorTableUniform {
    pub fn new(min_color: Color, max_color: Color, x_axis_color : Color, y_axis_color: Color, z_axis_color: Color, background_color: Color) -> Self {
        //indexes 0-59 are the colors of the glyphs.
        //60 is the x axis 
        //61 is the y axis
        //62 is the z axis
        //63 is the background
        let mut color_table = build_color_table(min_color, max_color, 60);
        
        color_table.push(x_axis_color);
        color_table.push(y_axis_color);
        color_table.push(z_axis_color);
        color_table.push(background_color);
        let mut color_table_array : [Color; 64] = [Color::default(); 64];
        color_table_array.copy_from_slice(&color_table);
        Self { color_table: color_table_array }
    }
}

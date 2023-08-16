use crate::assets::color::{build_color_table, Color};

#[repr(C)]
// This is so we can store this in a buffer
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
pub struct ColorTableUniform {
    color_table: [Color; 64],
}

impl ColorTableUniform {
    pub fn new(
        min_color: Color,
        max_color: Color,
        x_axis_color: Color,
        y_axis_color: Color,
        z_axis_color: Color,
        background_color: Color,
    ) -> Self {
        //indexes 0-59 are the colors of the glyphs.
        //60 is the x axis
        //61 is the y axis
        //62 is the z axis
        //63 is the background
        let mut color_table = build_color_table(min_color, max_color, 60);

        //Our colors come in as 255 based, we need to convert them to 1.0 scale
        color_table.push([x_axis_color[0] / 255.0, x_axis_color[1] / 255.0, x_axis_color[2] / 255.0, x_axis_color[3]]);
        color_table.push([y_axis_color[0] / 255.0, y_axis_color[1] / 255.0, y_axis_color[2] / 255.0, y_axis_color[3]]);
        color_table.push([z_axis_color[0] / 255.0, z_axis_color[1] / 255.0, z_axis_color[2] / 255.0, z_axis_color[3]]);
        color_table.push([background_color[0] / 255.0, background_color[1] / 255.0, background_color[2] / 255.0, background_color[3]] );
        let mut color_table_array: [Color; 64] = [Color::default(); 64];
        color_table_array.copy_from_slice(&color_table);
        Self {
            color_table: color_table_array,
        }
    }

    pub fn background_color(&self) -> Color {
        self.color_table[self.color_table.len() - 1]
    }

    pub fn x_axis_color(&self) -> Color {
        self.color_table[self.color_table.len() - 4]
    }

    pub fn y_axis_color(&self) -> Color {
        self.color_table[self.color_table.len() - 3]
    }

    pub fn z_axis_color(&self) -> Color {
        self.color_table[self.color_table.len() - 2]
    }
}
use model_common::{build_color_table, Color};
use wgpu::{BindGroup, BindGroupLayout, Buffer, Device};

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
        let color_table_array = Self::configure_color_table(
            min_color,
            max_color,
            x_axis_color,
            y_axis_color,
            z_axis_color,
            background_color,
        );
        Self {
            color_table: color_table_array,
        }
    }

    fn configure_color_table(
        min_color: Color,
        max_color: Color,
        x_axis_color: Color,
        y_axis_color: Color,
        z_axis_color: Color,
        background_color: Color,
    ) -> [Color; 64] {
        //indexes 0-59 are the colors of the glyphs.
        //60 is the x axis
        //61 is the y axis
        //62 is the z axis
        //63 is the background
        let mut color_table = build_color_table(min_color, max_color, 60);

        //Our colors come in as 255 based, we need to convert them to 1.0 scale
        color_table.push([
            x_axis_color[0] / 255.0,
            x_axis_color[1] / 255.0,
            x_axis_color[2] / 255.0,
            x_axis_color[3],
        ]);
        color_table.push([
            y_axis_color[0] / 255.0,
            y_axis_color[1] / 255.0,
            y_axis_color[2] / 255.0,
            y_axis_color[3],
        ]);
        color_table.push([
            z_axis_color[0] / 255.0,
            z_axis_color[1] / 255.0,
            z_axis_color[2] / 255.0,
            z_axis_color[3],
        ]);
        color_table.push([
            background_color[0] / 255.0,
            background_color[1] / 255.0,
            background_color[2] / 255.0,
            background_color[3],
        ]);
        let mut color_table_array: [Color; 64] = [Color::default(); 64];
        color_table_array.copy_from_slice(&color_table);
        color_table_array
    }
    pub fn background_color(&self) -> Color {
        self.color_table[self.color_table.len() - 1]
    }

    pub fn set_background_color(&mut self, color: Color) {
        self.color_table[self.color_table.len() - 1] = color;
    }

    pub fn x_axis_color(&self) -> Color {
        self.color_table[self.color_table.len() - 4]
    }

    pub fn set_x_axis_color(&mut self, color: Color) {
        self.color_table[self.color_table.len() - 4] = color;
    }

    pub fn y_axis_color(&self) -> Color {
        self.color_table[self.color_table.len() - 3]
    }
    pub fn set_y_axis_color(&mut self, color: Color) {
        self.color_table[self.color_table.len() - 3] = color;
    }
    pub fn z_axis_color(&self) -> Color {
        self.color_table[self.color_table.len() - 2]
    }
    pub fn set_z_axis_color(&mut self, color: Color) {
        self.color_table[self.color_table.len() - 2] = color;
    }

    pub fn update_colors(&mut self, min_color: Color, max_color: Color) {
        let color_table_array = Self::configure_color_table(
            min_color,
            max_color,
            self.x_axis_color(),
            self.y_axis_color(),
            self.z_axis_color(),
            self.background_color(),
        );
        self.color_table = color_table_array;
    }

    pub fn configure_color_table_uniform(
        &self,
        color_table_buffer: &Buffer,
        device: &Device,
    ) -> (BindGroupLayout, BindGroup) {
        let color_table_bind_group_layout =
            device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                entries: &[wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::VERTEX_FRAGMENT,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Uniform,
                        has_dynamic_offset: false,
                        min_binding_size: None,
                    },
                    count: None,
                }],
                label: Some("color_table_bind_group_layout"),
            });

        let color_table_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &color_table_bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: color_table_buffer.as_entire_binding(),
            }],
            label: Some("color_table_bind_group"),
        });
        (color_table_bind_group_layout, color_table_bind_group)
    }
}

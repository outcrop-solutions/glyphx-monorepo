use bytemuck;
use wgpu::util::DeviceExt;
use wgpu::{BindGroup, BindGroupLayout, Buffer, Device};
#[repr(C)]
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
pub struct FieldUniformDescription {
    pub field_type: u32,
    pub field_min_value: f32,
    pub field_max_value: f32,
    pub _padding: u32,
}
#[repr(C)]
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
pub struct GlyphUniformData {
    // settings: [[f32,4], 4]
    //for x,y,z the format of the array is [min_input_value, max_input_value, min_output_value, max_output_value],
    //for the 4th element we can store arbitrary data [x_y_offset, z_offset, 0, 0]  //Elements 2
    //and 3 are unused,
    //x values
    pub min_x: f32,
    pub max_x: f32,
    pub min_interp_x: f32,
    pub max_interp_x: f32,
    //y values
    pub min_y: f32,
    pub max_y: f32,
    pub min_interp_y: f32,
    pub max_interp_y: f32,
    //z values
    pub min_z: f32,
    pub max_z: f32,
    pub min_interp_z: f32,
    pub max_interp_z: f32,
    //other values
    pub x_z_offset: f32,
    pub y_offset: f32,
    pub _padding: [u32; 2],
}

impl GlyphUniformData {
    pub fn configure_glyph_uniform(
        &self,
        glyph_uniform_buffer: &Buffer,
        device: &Device,
    ) -> (BindGroupLayout, BindGroup) {
        let glyph_bind_group_layout =
            device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                entries: &[wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::VERTEX,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Uniform,
                        has_dynamic_offset: false,
                        min_binding_size: None,
                    },
                    count: None,
                }],
                label: Some("glyph_bind_group_layout"),
            });

        let glyph_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &glyph_bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: glyph_uniform_buffer.as_entire_binding(),
            }],
            label: Some("glyph_bind_group"),
        });

        (glyph_bind_group_layout, glyph_bind_group)
    }
}
#[repr(C)]
#[derive(Copy, Clone, Debug, bytemuck::Pod, bytemuck::Zeroable)]
pub struct GlyphInstanceData {
    pub glyph_id: u32,
    pub x_value: f32,
    pub y_value: f32,
    pub z_value: f32,
    //We may change this to a flag later
    //for now it is a u32 to keep our size in good shape
    pub glyph_selected: u32,
}

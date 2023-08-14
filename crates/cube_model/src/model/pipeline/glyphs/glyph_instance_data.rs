use wgpu::util::DeviceExt;
use wgpu::{BindGroup, BindGroupLayout, Buffer, Device};
use bytemuck;
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
    pub x : FieldUniformDescription,
    pub y : FieldUniformDescription,
    pub z : FieldUniformDescription,
    //Used for interpolation to drive the vertex shader 
    pub min_x: f32,
    pub max_x: f32,
    pub min_y: f32,
    pub max_y: f32,
    pub min_z: f32,
    pub max_z: f32,
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

        ( glyph_bind_group_layout, glyph_bind_group)
    }
}

pub struct GlyphInstanceData {
    pub glyph_id: u32,
    pub x_value: f32,
    pub y_value: f32,
    pub z_value: f32,
    pub glyph_selected: bool,

}

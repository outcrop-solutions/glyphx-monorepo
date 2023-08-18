use wgpu::{BindGroupLayout, BindGroup, Buffer, Device};

#[repr(C)]
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
pub struct LightUniform {
    position: [f32; 3],
    // Due to uniforms requiring 16 byte (4 float) spacing, we need to use a padding field here
    _padding: u32,
    color: [f32; 3],
    // Due to uniforms requiring 16 byte (4 float) spacing, we need to use a padding field here
    _padding2: u32,
}

impl LightUniform {
    pub fn new(position: [f32; 3], color: [f32; 3]) -> LightUniform {
        LightUniform {
            position,
            _padding: 0,
            color,
            _padding2: 0,
        }
    }

    pub fn upate_position(&mut self, position: [f32; 3]) {
        self.position = position;
    }

    pub fn upate_color(&mut self, color: [f32; 3]) {
        self.color = color;
    }
    pub fn configure_light_uniform( 
        &self,
        light_buffer: &Buffer,
        device: &Device,
    ) -> (BindGroupLayout, BindGroup) {
            let light_bind_group_layout = device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                entries: &[wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT,
                    ty: wgpu::BindingType::Buffer {
                        ty: wgpu::BufferBindingType::Uniform,
                        has_dynamic_offset: false,
                        min_binding_size: None,
                    },
                    count: None,
                }],
                label: Some("light_bind_group_layout"),
            });

        let light_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &light_bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: light_buffer.as_entire_binding(),
            }],
            label: Some("light_bind_group"),
        });

        (light_bind_group_layout, light_bind_group)
    }
}
 

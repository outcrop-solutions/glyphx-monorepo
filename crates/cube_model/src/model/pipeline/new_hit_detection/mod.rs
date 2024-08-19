use crate::{
    camera::uniform_buffer::CameraUniform,
    model::{
        pipeline::glyphs::glyph_vertex_data::GlyphVertexData
    },
};


use smaa::*;
use std::cell::RefCell;
use std::rc::Rc;
use wgpu::{BindGroup, BindGroupLayout, Buffer, Device, RenderPipeline, SurfaceConfiguration};


pub fn encode_glyph_id(glyph_id: u32) -> [f32; 4] {
    let mut encoded = [0.0; 4];
    encoded[0] = ((glyph_id & 0xFF) as f32) / 255.0;
    encoded[1] = ((glyph_id >> 8) & 0xFF) as f32 / 255.0;
    encoded[2] = ((glyph_id >> 16) & 0xFF) as f32 / 255.0;
    encoded[3] = 0.0;
    encoded
}
pub fn decode_glyph_id(color: [u8; 4]) -> u32 {
    let r = (color[0]) as u32;
    let g = ((color[1]) as u32) << 8;
    let b = ((color[2] )as u32) << 16;
    r | g | b
}

pub struct NewHitDetection {
    render_pipeline: RenderPipeline,
    camera_bind_group: BindGroup,
}

impl NewHitDetection {
    pub fn new(
        device: Rc<RefCell<Device>>,
        config: &SurfaceConfiguration,
        camera_buffer: &Buffer,
        camera_uniform: &CameraUniform,
    ) -> NewHitDetection {
        let d_clone = device.clone();
        let d = d_clone.as_ref().borrow();

        let shader = d.create_shader_module(wgpu::include_wgsl!("shader.wgsl").into());
        let vertex_buffer_layout = GlyphVertexData::desc();

        let (camera_bind_group_layout, camera_bind_group) =
            camera_uniform.configure_camera_uniform(camera_buffer, &d);


        let render_pipeline = Self::configure_render_pipeline(
            &d,
            camera_bind_group_layout,
            shader,
            vertex_buffer_layout,
            config,

        );

        NewHitDetection {
            render_pipeline,
            camera_bind_group,
        }
    }

    fn configure_render_pipeline(
        device: &Device,
        camera_bind_group_layout: BindGroupLayout,
        shader: wgpu::ShaderModule,
        vertex_buffer_layout: wgpu::VertexBufferLayout<'static>,
        config: &SurfaceConfiguration
    ) -> RenderPipeline {
        let render_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("Hit Detection Render Pipeline Layout"),
                bind_group_layouts: &[
                    &camera_bind_group_layout,
                ],
                push_constant_ranges: &[],
            });

        let render_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("Hit Detection Render Pipeline"),
            layout: Some(&render_pipeline_layout),
            vertex: wgpu::VertexState {
                module: &shader,
                entry_point: "vs_main",
                buffers: &[vertex_buffer_layout],
            },
            fragment: Some(wgpu::FragmentState {
                module: &shader,
                entry_point: "fs_main",
                targets: &[Some(wgpu::ColorTargetState {
                    format: wgpu::TextureFormat::Rgba8Unorm,

                    blend: Some(wgpu::BlendState::REPLACE) ,
                    write_mask: wgpu::ColorWrites::ALL,
                })],
            }),
            primitive: wgpu::PrimitiveState {
                topology: wgpu::PrimitiveTopology::TriangleList,
                strip_index_format: None,
                front_face: wgpu::FrontFace::Ccw,
                cull_mode: Some(wgpu::Face::Back),
                polygon_mode: wgpu::PolygonMode::Fill,
                ..Default::default()
            },
            depth_stencil: None,
            multisample: wgpu::MultisampleState {
                count: 1,
                mask: !0,
                alpha_to_coverage_enabled: false,
            },
            multiview: None,
        });
        render_pipeline
    }

    pub fn run_pipeline<'a>(
        &'a self,
        encoder: &'a mut wgpu::CommandEncoder,
        view: &wgpu::TextureView,
        vertex_data_buffer: &Buffer,
        vertex_buffer_length: u32,
    ) {
        let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("Render Pass"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: &view,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: wgpu::LoadOp::Load,
                    store: true,
                },
            })],
            depth_stencil_attachment: None,
        });
        render_pass.set_pipeline(&self.render_pipeline);
        render_pass.set_bind_group(0, &self.camera_bind_group, &[]);
        render_pass.set_vertex_buffer(0, vertex_data_buffer.slice(..));
        render_pass.draw(
            0..vertex_buffer_length,
            0..1,
        );
    }
}

#[cfg(test)]
mod id_encoding {
    use super::*; 
    #[test]
    fn test_encode_object_id() {
        let id = 0x00FF00;
        let encoded = encode_glyph_id(id);
        assert_eq!(encoded, [0.0, 1.0, 0.0, 0.0]);
    }

    #[test]
    fn test_decode_object_id() {
        let encoded = [0, 255, 0, 0];
        let decoded = decode_glyph_id(encoded);
        assert_eq!(decoded, 0x00FF00);
    }
}
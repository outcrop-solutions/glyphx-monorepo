pub(crate) mod ranked_glyph_data;
pub(crate) mod glyph_vertex_data;
pub(crate) mod glyph_uniform_data;
pub(crate) mod glyph_instance_data;

use crate::{
    camera::uniform_buffer::CameraUniform,
    light::light_uniform::LightUniform,
    model::{
        color_table_uniform::ColorTableUniform, 
        pipeline::glyph_data::InstanceOutput, 
    },
};


use smaa::*;
use std::cell::RefCell;
use std::rc::Rc;
use wgpu::{BindGroup, BindGroupLayout, Buffer, Device, RenderPipeline, SurfaceConfiguration};

use glyph_vertex_data::GlyphVertexData;

use self::glyph_uniform_data::GlyphUniformData;


pub struct Glyphs {
    render_pipeline: RenderPipeline,
    camera_bind_group: BindGroup,
    color_table_bind_group: BindGroup,
    light_bind_group: BindGroup,
    glyph_uniform_bind_group: BindGroup,
}

impl Glyphs {
    pub fn new(
        device: Rc<RefCell<Device>>,
        config: &SurfaceConfiguration,
        camera_buffer: &Buffer,
        camera_uniform: &CameraUniform,
        color_table_buffer: &Buffer,
        color_table_uniform: &ColorTableUniform,
        light_buffer: &Buffer,
        light_uniform: &LightUniform,
        glyph_uniform_buffer: &Buffer,
        glyph_uniform: &GlyphUniformData,
    ) -> Glyphs {
        let d_clone = device.clone();
        let d = d_clone.as_ref().borrow();

        let shader = d.create_shader_module(wgpu::include_wgsl!("shader.wgsl").into());
        let vertex_buffer_layout = GlyphVertexData::desc();

        let (camera_bind_group_layout, camera_bind_group) =
            camera_uniform.configure_camera_uniform(camera_buffer, &d);

        let (light_bind_group_layout, light_bind_group) =
            light_uniform.configure_light_uniform(light_buffer, &d);
        let (glyph_uniform_bind_group_layout, glyph_uniform_bind_group) =
            glyph_uniform.configure_glyph_uniform(glyph_uniform_buffer,  &d);
        let (color_table_bind_group_layout, color_table_bind_group) =
            color_table_uniform.configure_color_table_uniform(color_table_buffer, &d);

        let render_pipeline = Self::configure_render_pipeline(
            &d,
            camera_bind_group_layout,
            color_table_bind_group_layout,
            light_bind_group_layout,
            glyph_uniform_bind_group_layout,
            shader,
            vertex_buffer_layout,
            config,

        );

        Glyphs {
            render_pipeline,
            camera_bind_group,
            color_table_bind_group,
            light_bind_group,
            glyph_uniform_bind_group,
        }
    }

    fn configure_render_pipeline(
        device: &Device,
        camera_bind_group_layout: BindGroupLayout,
        color_table_bind_group_layout: BindGroupLayout,
        light_bind_group_layout: BindGroupLayout,
        glyph_uniform_bind_group_layout: BindGroupLayout,
        shader: wgpu::ShaderModule,
        vertex_buffer_layout: wgpu::VertexBufferLayout<'static>,
        config: &SurfaceConfiguration
    ) -> RenderPipeline {
        let render_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("Glyph Render Pipeline Layout"),
                bind_group_layouts: &[
                    &camera_bind_group_layout,
                    &color_table_bind_group_layout,
                    &light_bind_group_layout,
                    &glyph_uniform_bind_group_layout,
                ],
                push_constant_ranges: &[],
            });

        let render_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("Glyph Render Pipeline"),
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
                    format: config.format,
                    blend: Some(wgpu::BlendState {
                        color: wgpu::BlendComponent {
                            src_factor: wgpu::BlendFactor::SrcAlpha,
                            dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha,
                            operation: wgpu::BlendOperation::Add,
                        },
                        alpha: wgpu::BlendComponent {
                            src_factor: wgpu::BlendFactor::One,
                            dst_factor: wgpu::BlendFactor::OneMinusSrcAlpha,
                            operation: wgpu::BlendOperation::Add,
                        },
                    }),
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
        smaa_frame: &SmaaFrame,
        vertex_data_buffer: &Buffer,
        vertex_buffer_length: u32,
    ) {
        let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("Render Pass"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: &*smaa_frame,
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
        render_pass.set_bind_group(1, &self.color_table_bind_group, &[]);
        render_pass.set_bind_group(2, &self.light_bind_group, &[]);
        render_pass.set_bind_group(3, &self.glyph_uniform_bind_group, &[]);
        render_pass.set_vertex_buffer(0, vertex_data_buffer.slice(..));
        render_pass.draw(
            0..vertex_buffer_length,
            0..1,
        );
    }
}

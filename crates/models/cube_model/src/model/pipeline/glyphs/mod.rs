use crate::{
    camera::uniform_buffer::CameraUniform,
    light::light_uniform::LightUniform,
    model::{color_table_uniform::ColorTableUniform, pipeline::glyph_data::InstanceOutput},
};

use crate::model::data::GlyphUniformData;

use crate::model::data::GlyphVertexData;

use model_common::WgpuManager;

use smaa::*;
use std::cell::RefCell;
use std::rc::Rc;
use wgpu::{
    BindGroup, BindGroupLayout, BlendComponent, BlendFactor, BlendOperation, BlendState, Buffer,
    ColorTargetState, ColorWrites, CommandEncoder, Device, Face, FragmentState, FrontFace, LoadOp,
    MultisampleState, Operations, PipelineCompilationOptions, PipelineLayoutDescriptor,
    PolygonMode, PrimitiveState, PrimitiveTopology, RenderPassColorAttachment,
    RenderPassDescriptor, RenderPipeline, RenderPipelineDescriptor, Sampler, ShaderModule, StoreOp,
    SurfaceConfiguration, Texture, TextureView, VertexBufferLayout, VertexState,
};

pub struct Glyphs {
    render_pipeline: RenderPipeline,
    camera_bind_group: BindGroup,
    color_table_bind_group: BindGroup,
    light_bind_group: BindGroup,
    glyph_uniform_bind_group: BindGroup,
    _depth_texture: Texture,
    depth_view: TextureView,
    _depth_sampler: Sampler,
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
        wgpu_manager: &WgpuManager,
    ) -> Glyphs {
        let d = device.clone();
        let d = d.borrow();

        let shader = d.create_shader_module(wgpu::include_wgsl!("shader.wgsl").into());

        let vertex_buffer_layout = GlyphVertexData::desc();

        let (camera_bind_group_layout, camera_bind_group) =
            camera_uniform.configure_camera_uniform(camera_buffer, &d);
        let (light_bind_group_layout, light_bind_group) =
            light_uniform.configure_light_uniform(light_buffer, &d);
        let (glyph_uniform_bind_group_layout, glyph_uniform_bind_group) =
            glyph_uniform.configure_glyph_uniform(glyph_uniform_buffer, &d);
        let (color_table_bind_group_layout, color_table_bind_group) =
            color_table_uniform.configure_color_table_uniform(color_table_buffer, &d);

        let (depth_texture, depth_view, depth_sampler) =
            wgpu_manager.create_depth_texture("Glyphs depth texture");
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
            _depth_texture: depth_texture,
            depth_view,
            _depth_sampler: depth_sampler,
        }
    }

    fn configure_render_pipeline(
        device: &Device,
        camera_bind_group_layout: BindGroupLayout,
        color_table_bind_group_layout: BindGroupLayout,
        light_bind_group_layout: BindGroupLayout,
        glyph_uniform_bind_group_layout: BindGroupLayout,
        shader: ShaderModule,
        vertex_buffer_layout: VertexBufferLayout,
        config: &SurfaceConfiguration,
    ) -> RenderPipeline {
        let render_pipeline_layout = device.create_pipeline_layout(&PipelineLayoutDescriptor {
            label: Some("Glyph Render Pipeline Layout"),
            bind_group_layouts: &[
                &camera_bind_group_layout,
                &color_table_bind_group_layout,
                &light_bind_group_layout,
                &glyph_uniform_bind_group_layout,
            ],
            push_constant_ranges: &[],
        });

        let render_pipeline = device.create_render_pipeline(&RenderPipelineDescriptor {
            label: Some("Glyph Render Pipeline"),
            layout: Some(&render_pipeline_layout),
            vertex: VertexState {
                module: &shader,
                entry_point: "vs_main",
                buffers: &[vertex_buffer_layout],
                compilation_options: PipelineCompilationOptions::default(),
            },
            fragment: Some(FragmentState {
                module: &shader,
                entry_point: "fs_main",
                targets: &[Some(ColorTargetState {
                    format: config.format,
                    blend: Some(BlendState {
                        color: BlendComponent {
                            src_factor: BlendFactor::SrcAlpha,
                            dst_factor: BlendFactor::OneMinusSrcAlpha,
                            operation: BlendOperation::Add,
                        },
                        alpha: BlendComponent {
                            src_factor: BlendFactor::One,
                            dst_factor: BlendFactor::OneMinusSrcAlpha,
                            operation: BlendOperation::Add,
                        },
                    }),
                    write_mask: ColorWrites::ALL,
                })],
                compilation_options: PipelineCompilationOptions::default(),
            }),
            primitive: PrimitiveState {
                topology: PrimitiveTopology::TriangleList,
                strip_index_format: None,
                front_face: FrontFace::Ccw,
                cull_mode: Some(Face::Back),
                polygon_mode: PolygonMode::Fill,
                ..Default::default()
            },
            depth_stencil: Some(wgpu::DepthStencilState {
                format: WgpuManager::DEPTH_FORMAT,
                depth_write_enabled: true,
                depth_compare: wgpu::CompareFunction::Less, // 1.
                stencil: wgpu::StencilState::default(),     // 2.
                bias: wgpu::DepthBiasState::default(),
            }),
            multisample: MultisampleState {
                count: 1,
                mask: !0,
                alpha_to_coverage_enabled: false,
            },
            multiview: None,
            cache: None,
        });
        render_pipeline
    }

    pub fn run_pipeline(
        &self,
        encoder: &mut CommandEncoder,
        view: &wgpu::TextureView,
        vertex_data_buffer: &Buffer,
        vertex_buffer_length: u32,
    ) {
        let mut render_pass = encoder.begin_render_pass(&RenderPassDescriptor {
            label: Some("Render Pass"),
            color_attachments: &[Some(RenderPassColorAttachment {
                view,
                resolve_target: None,
                ops: Operations {
                    load: LoadOp::Load,
                    store: StoreOp::Store,
                },
            })],

            depth_stencil_attachment: Some(wgpu::RenderPassDepthStencilAttachment {
                view: &self.depth_view,
                depth_ops: Some(wgpu::Operations {
                    load: wgpu::LoadOp::Clear(1.0),
                    store: wgpu::StoreOp::Store,
                }),
                stencil_ops: None,
            }),
            timestamp_writes: None,
            occlusion_query_set: None,
        });
        render_pass.set_pipeline(&self.render_pipeline);
        render_pass.set_bind_group(0, &self.camera_bind_group, &[]);
        render_pass.set_bind_group(1, &self.color_table_bind_group, &[]);
        render_pass.set_bind_group(2, &self.light_bind_group, &[]);
        render_pass.set_bind_group(3, &self.glyph_uniform_bind_group, &[]);
        render_pass.set_vertex_buffer(0, vertex_data_buffer.slice(..));
        render_pass.draw(0..vertex_buffer_length, 0..1);
    }

    pub fn update_depth_texture(&mut self, wgpu_manager: &WgpuManager) {
        let (depth_texture, depth_view, depth_sampler) =
            wgpu_manager.create_depth_texture("glyphs depth texture");
        self._depth_texture = depth_texture;
        self.depth_view = depth_view;
        self._depth_sampler = depth_sampler;
    }
}

use crate::{
    assets::{create_charm,create_rectangular_prism}, 
    model::{data::ShapeVertex, model_configuration::ModelConfiguration},
};

use model_common::{CameraUniform, ColorTableUniform, LightUniform, WgpuManager};

use bytemuck;
use smaa::SmaaFrame;
use std::cell::RefCell;
use std::rc::Rc;
use wgpu::{
    util::{BufferInitDescriptor, DeviceExt},
    BindGroup, BindGroupLayout, BlendComponent, BlendFactor, BlendOperation, BlendState, Buffer,
    BufferUsages, ColorTargetState, ColorWrites, CommandEncoder, Device, Face, FragmentState,
    FrontFace, LoadOp, MultisampleState, Operations, PipelineCompilationOptions,
    PipelineLayoutDescriptor, PolygonMode, PrimitiveState, PrimitiveTopology,
    RenderPassColorAttachment, RenderPassDescriptor, RenderPipeline, RenderPipelineDescriptor,
    Sampler, ShaderModule, SurfaceConfiguration, Texture, TextureView, VertexBufferLayout,
    VertexState,
};

pub struct Charms {
    render_pipeline: RenderPipeline,
    vertex_buffer: Buffer,
    camera_bind_group: BindGroup,
    vertex_data: Vec<ShapeVertex>,
    color_table_bind_group: BindGroup,
    light_bind_group: BindGroup,
    model_configuration: Rc<RefCell<ModelConfiguration>>,
    device: Rc<RefCell<Device>>,
    depth_texture: Texture,
    depth_view: TextureView,
    depth_sampler: Sampler,
}

impl Charms {
    pub fn new(
        device: Rc<RefCell<Device>>,
        config: &SurfaceConfiguration,
        camera_buffer: &Buffer,
        camera_uniform: &CameraUniform,
        color_table_buffer: &Buffer,
        color_table_uniform: &ColorTableUniform,
        light_buffer: &Buffer,
        light_uniform: &LightUniform,
        model_configuration: Rc<RefCell<ModelConfiguration>>,
        wgpu_manager: &WgpuManager,
    ) -> Charms {
        let vertex_data = Self::build_verticies(&model_configuration.borrow());

        let d = device.clone();
        let d = d.borrow();

        let shader = d.create_shader_module(wgpu::include_wgsl!("shader.wgsl").into());

        let (vertex_buffer_layout, vertex_buffer) = Self::configure_verticies(&d, &vertex_data);

        let (camera_bind_group_layout, camera_bind_group) =
            camera_uniform.configure_camera_uniform(camera_buffer, &d);
        let (light_bind_group_layout, light_bind_group) =
            light_uniform.configure_light_uniform(light_buffer, &d);

        let (color_table_bind_group_layout, color_table_bind_group) =
            color_table_uniform.configure_color_table_uniform(color_table_buffer, &d);

        let render_pipeline = Self::configure_render_pipeline(
            &d,
            camera_bind_group_layout,
            color_table_bind_group_layout,
            light_bind_group_layout,
            shader,
            vertex_buffer_layout,
            config,
        );

        let (depth_texture, depth_view, depth_sampler) =
            wgpu_manager.create_depth_texture("Charms depth texture");

        Charms {
            device,
            render_pipeline,
            vertex_buffer,
            camera_bind_group,
            vertex_data,
            color_table_bind_group,
            model_configuration,
            light_bind_group,
            depth_texture,
            depth_view,
            depth_sampler,
        }
    }


    pub fn build_verticies(model_configuration: &ModelConfiguration) -> Vec<ShapeVertex> {
        let length = (model_configuration.grid_cylinder_length
            * model_configuration.z_height_ratio)
            + model_configuration.grid_cone_length;
        let vertex_data = create_rectangular_prism(1.0, length);

        // create_charm(
        //     model_configuration.glyph_size ,
        //     length,
        // );
        vertex_data
    }

    pub fn update_vertex_buffer(&mut self) {
        self.vertex_data = Self::build_verticies(&self.model_configuration.borrow());

        let d = self.device.as_ref().borrow();
        self.vertex_buffer = d.create_buffer_init(&BufferInitDescriptor {
            label: Some("Vertex Buffer"),
            contents: bytemuck::cast_slice(&self.vertex_data),
            usage: BufferUsages::VERTEX,
        });
    }

    fn configure_verticies(
        device: &Device,
        vertex_data: &Vec<ShapeVertex>,
    ) -> (VertexBufferLayout<'static>, Buffer) {
        let vertex_buffer_layout = ShapeVertex::desc();
        let vertex_buffer = device.create_buffer_init(&BufferInitDescriptor {
            label: Some("Vertex Buffer"),
            contents: bytemuck::cast_slice(&vertex_data),
            usage: BufferUsages::VERTEX,
        });

        (vertex_buffer_layout, vertex_buffer)
    }

    fn configure_render_pipeline(
        device: &Device,
        camera_bind_group_layout: BindGroupLayout,
        color_table_bind_group_layout: BindGroupLayout,
        light_bind_group_layout: BindGroupLayout,
        shader: ShaderModule,
        vertex_buffer_layout: VertexBufferLayout,
        config: &SurfaceConfiguration,
    ) -> RenderPipeline {
        let render_pipeline_layout = device.create_pipeline_layout(&PipelineLayoutDescriptor {
            label: Some("Render Pipeline Layout"),
            bind_group_layouts: &[
                &camera_bind_group_layout,
                &color_table_bind_group_layout,
                &light_bind_group_layout,
            ],
            push_constant_ranges: &[],
        });

        let render_pipeline = device.create_render_pipeline(&RenderPipelineDescriptor {
            label: Some("Render Pipeline"),
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

    pub fn run_pipeline(&self, encoder: &mut CommandEncoder, view: &wgpu::TextureView) {
        let mut render_pass = encoder.begin_render_pass(&RenderPassDescriptor {
            label: Some("Render Pass"),
            color_attachments: &[Some(RenderPassColorAttachment {
                view: &*view,
                resolve_target: None,
                ops: Operations {
                    load: LoadOp::Load,
                    store: wgpu::StoreOp::Store,
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
        render_pass.set_vertex_buffer(0, self.vertex_buffer.slice(..));
        render_pass.draw(0..self.vertex_data.len() as u32, 0..1);
    }
}

use crate::{
    assets::{axis_line::create_axis_line, shape_vertex::ShapeVertex},
    camera::uniform_buffer::CameraUniform,
    light::light_uniform::LightUniform,
    model::{color_table_uniform::ColorTableUniform, model_configuration::ModelConfiguration},
};
use model_common::WgpuManager;

use bytemuck;
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

pub enum AxisLineDirection {
    X,
    Y,
    Z,
}

pub struct AxisLines {
    render_pipeline: RenderPipeline,
    vertex_buffer: Buffer,
    camera_bind_group: BindGroup,
    vertex_data: Vec<ShapeVertex>,
    color_table_bind_group: BindGroup,
    light_bind_group: BindGroup,
    model_configuration: Rc<RefCell<ModelConfiguration>>,
    direction: AxisLineDirection,
    device: Rc<RefCell<Device>>,
    axis_start: f32,
    min_axis_value: f32,
    max_axis_value: f32,
    _depth_texture: Texture,
    depth_view: TextureView,
    _depth_sampler: Sampler,
}

impl AxisLines {
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
        direction: AxisLineDirection,
        axis_start: f32,
        min_axis_value: f32,
        max_axis_value: f32,
        wgpu_manager: &WgpuManager,
    ) -> AxisLines {
        let vertex_data = Self::build_verticies(
            &model_configuration.borrow(),
            &direction,
            axis_start,
            min_axis_value,
            max_axis_value,
        );

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

        let (depth_texture, depth_view, depth_sampler) =
            wgpu_manager.create_depth_texture("Charms depth texture");

        let render_pipeline = Self::configure_render_pipeline(
            &d,
            camera_bind_group_layout,
            color_table_bind_group_layout,
            light_bind_group_layout,
            shader,
            vertex_buffer_layout,
            config,
        );

        AxisLines {
            device,
            render_pipeline,
            vertex_buffer,
            camera_bind_group,
            vertex_data,
            color_table_bind_group,
            model_configuration,
            direction,
            light_bind_group,
            axis_start,
            min_axis_value,
            max_axis_value,
            _depth_texture: depth_texture,
            depth_view,
            _depth_sampler: depth_sampler,
        }
    }
    pub fn set_axis_start(&mut self, axis_start: f32) {
        self.axis_start = axis_start;
    }

    pub fn build_verticies(
        model_configuration: &ModelConfiguration,
        direction: &AxisLineDirection,
        axis_start: f32,
        min_axis_value: f32,
        max_axis_value: f32,
    ) -> Vec<ShapeVertex> {
        let mut vertex_data: Vec<ShapeVertex> = Vec::new();

        let cylinder_radius = model_configuration.grid_cylinder_radius;
        //Make this the size of the axis based on the glyph data.
        //let cylinder_height = mc.grid_cylinder_length;
        let cylinder_height = max_axis_value - min_axis_value
            + model_configuration.glyph_offset
            + model_configuration.glyph_size;
        let cone_height = model_configuration.grid_cone_length;
        let cone_radius = model_configuration.grid_cone_radius;
        //To the outside world z is up.  To us y is up
        let (height, color, order) = match direction {
            AxisLineDirection::X => (cylinder_height, 60, [1, 2, 0]),
            AxisLineDirection::Y => (cylinder_height, 62, [0, 1, 2]),
            AxisLineDirection::Z => (cylinder_height + cone_height, 61, [2, 0, 1]),
        };

        let vertices = create_axis_line(cylinder_radius, height, cone_height, cone_radius);
        for mut vertex in vertices {
            vertex.color = color;
            let x = vertex.position_vertex[order[0]] + axis_start;
            let y = vertex.position_vertex[order[1]] + axis_start;
            let z = vertex.position_vertex[order[2]] + axis_start;

            let n_x = vertex.normal[order[0]] + axis_start;
            let n_y = vertex.normal[order[1]] + axis_start;
            let n_z = vertex.normal[order[2]] + axis_start;

            vertex_data.push(ShapeVertex {
                position_vertex: [x, y, z],
                normal: [n_x, n_y, n_z],
                color,
            });
        }
        vertex_data
    }

    pub fn update_vertex_buffer(&mut self) {
        self.vertex_data = Self::build_verticies(
            &self.model_configuration.borrow(),
            &self.direction,
            self.axis_start,
            self.min_axis_value,
            self.max_axis_value,
        );

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
            label: Some("Axis Render Pipeline Layout"),
            bind_group_layouts: &[
                &camera_bind_group_layout,
                &color_table_bind_group_layout,
                &light_bind_group_layout,
            ],
            push_constant_ranges: &[],
        });

        let render_pipeline = device.create_render_pipeline(&RenderPipelineDescriptor {
            label: Some("Axis Render Pipeline"),
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
            label: Some("Axis Render Pass"),
            color_attachments: &[Some(RenderPassColorAttachment {
                view,
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

    pub fn update_depth_texture(&mut self, wgpu_manager: &WgpuManager) {
        let (depth_texture, depth_view, depth_sampler) =
            wgpu_manager.create_depth_texture("glyphs depth texture");
        self._depth_texture = depth_texture;
        self.depth_view = depth_view;
        self._depth_sampler = depth_sampler;
    }
}

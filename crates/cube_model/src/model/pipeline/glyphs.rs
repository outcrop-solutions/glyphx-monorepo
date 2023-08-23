pub(crate) mod glyph_instance_data;
use crate::assets::rectangular_prism::create_rectangular_prism;
use crate::assets::shape_vertex::ShapeVertex;
use crate::camera::uniform_buffer::CameraUniform;
use crate::model::color_table_uniform::ColorTableUniform;
use crate::light::light_uniform::LightUniform;
use crate::model::model_configuration::ModelConfiguration;
use crate::model::pipeline::PipelineRunner;
use bytemuck;
use glyph_instance_data::*;
use smaa::*;
use std::rc::Rc;
use wgpu::util::DeviceExt;
use wgpu::{BindGroup, BindGroupLayout, Buffer, Device, RenderPipeline, SurfaceConfiguration};

#[repr(C)]
#[derive(Copy, Clone, Debug, bytemuck::Pod, bytemuck::Zeroable)]
pub struct Vertex {
    pub position: [f32; 3],
    //we don't need color here.  It is interpolated in the gpu
}

pub struct VertexData {
    pub vertices: Vec<ShapeVertex>,
    pub instance_data: Rc<Vec<GlyphInstanceData>>,
}

pub struct Glyphs {
    render_pipeline: RenderPipeline,
    vertex_buffer: Buffer,
    camera_bind_group: BindGroup,
    vertex_data: VertexData,
    color_table_bind_group: BindGroup,
    light_bind_group: BindGroup,
    model_configuration: Rc<ModelConfiguration>,
    glyph_uniform_bind_group: BindGroup,
    instance_data_buffer: Buffer,
    glyph_instance_data: Rc<Vec<GlyphInstanceData>>,
}

impl Glyphs {
    pub fn new(
        glyph_uniform_data: &GlyphUniformData,
        glyph_uniform_buffer: &Buffer,
        glyph_instance_data: Rc<Vec<GlyphInstanceData>>,
        device: &Device,
        config: &SurfaceConfiguration,
        camera_buffer: &Buffer,
        camera_uniform: &CameraUniform,
        color_table_buffer: &Buffer,
        color_table_uniform: &ColorTableUniform,
        light_buffer: &Buffer,
        light_uniform: &LightUniform,
        model_configuration: Rc<ModelConfiguration>,
    ) -> Glyphs {
        let instance_data = glyph_instance_data.clone();
        let mut vertex_data = VertexData {
            vertices: Vec::new(),
            instance_data,
        };

        Self::build_verticies(
            &mut vertex_data.vertices,
            &model_configuration,
            glyph_uniform_data,
        );

        let shader = device.create_shader_module(wgpu::include_wgsl!("glyphs/shader.wgsl").into());
        let (vertex_buffer_layout, vertex_buffer) =
            Self::configure_verticies(device, &vertex_data);
        let (instance_buffer_layout, instance_data_buffer) =
            Self::configure_instance_buffer(device, &glyph_instance_data);

        let (glyph_uniform_buffer_layout, glyph_uniform_bind_group) =
            glyph_uniform_data.configure_glyph_uniform(glyph_uniform_buffer, device);

        let (camera_bind_group_layout, camera_bind_group) =
            camera_uniform.configure_camera_uniform(camera_buffer, device);

        let (light_bind_group_layout, light_bind_group) =
            light_uniform.configure_light_uniform(light_buffer, device);
        let (color_table_bind_group_layout, color_table_bind_group) =
            color_table_uniform.configure_color_table_uniform(color_table_buffer, device);

        let render_pipeline = Self::configure_render_pipeline(
            device,
            camera_bind_group_layout,
            color_table_bind_group_layout,
            light_bind_group_layout,
            glyph_uniform_buffer_layout,
            shader,
            vertex_buffer_layout,
            instance_buffer_layout,
            config,
        );

        Glyphs {
            render_pipeline,
            vertex_buffer,
            camera_bind_group,
            vertex_data,
            color_table_bind_group,
            light_bind_group,
            model_configuration,
            glyph_uniform_bind_group,
            instance_data_buffer,
            glyph_instance_data,
        }
    }

    pub fn build_verticies(
        verticies: &mut Vec<ShapeVertex>,
        model_configuration: &Rc<ModelConfiguration>,
        _glyph_uniform_data: &GlyphUniformData,
    ) {
        //Our x/y size
        let glyph_size = model_configuration.glyph_size;

        //Our z size is based on the height of the grid with a little bit of padding so that
        //the top does not but up against the z axis line
        let length = (model_configuration.grid_cylinder_length
            + model_configuration.grid_cone_length)
            * model_configuration.z_height_ratio;

        let shape_vertices = create_rectangular_prism(glyph_size, length);
        //now we want to move this to the model origin from it's current position at 0,0,0.
        let x_offset = model_configuration.model_origin[0] + model_configuration.glyph_offset;
        let z_offset = model_configuration.model_origin[2] + model_configuration.glyph_offset;
        let y_offset = model_configuration.model_origin[1];
        
        let mut i = 0;
        while i < shape_vertices.len() {
            let vertex = shape_vertices[i];
            verticies.push(ShapeVertex {
                position_vertex: [
                    vertex.position_vertex[0] + x_offset,
                    vertex.position_vertex[1] + y_offset,
                    vertex.position_vertex[2] + z_offset,
                ],
                normal: [
                    vertex.normal[0] + x_offset,
                    vertex.normal[1] + y_offset,
                    vertex.normal[2] + z_offset,
                ],
                color: vertex.color,
            });
            i += 1;
        }

    }

    fn configure_instance_buffer(
        device: &Device,
        instance_data: &Rc<Vec<GlyphInstanceData>>,
    ) -> (wgpu::VertexBufferLayout<'static>, Buffer) {
        let instance_buffer_layout = wgpu::VertexBufferLayout {
            array_stride: std::mem::size_of::<GlyphInstanceData>() as wgpu::BufferAddress,
            step_mode: wgpu::VertexStepMode::Instance,
            attributes: &[
                wgpu::VertexAttribute {
                    offset: 0,
                    shader_location: 3,
                    format: wgpu::VertexFormat::Uint32,
                },
                wgpu::VertexAttribute {
                    offset: std::mem::size_of::<u32>() as wgpu::BufferAddress,
                    shader_location: 4,
                    format: wgpu::VertexFormat::Float32,
                },
                wgpu::VertexAttribute {
                    offset: (std::mem::size_of::<u32>() + std::mem::size_of::<f32>())
                        as wgpu::BufferAddress,
                    shader_location: 5,
                    format: wgpu::VertexFormat::Float32,
                },
                wgpu::VertexAttribute {
                    offset: (std::mem::size_of::<u32>()
                        + std::mem::size_of::<f32>()
                        + std::mem::size_of::<f32>())
                        as wgpu::BufferAddress,
                    shader_location: 6,
                    format: wgpu::VertexFormat::Float32,
                },
                wgpu::VertexAttribute {
                    offset: (std::mem::size_of::<u32>()
                        + std::mem::size_of::<f32>()
                        + std::mem::size_of::<f32>()
                        + std::mem::size_of::<f32>())
                        as wgpu::BufferAddress,
                    shader_location: 7,
                    format: wgpu::VertexFormat::Uint32,
                },
            ],
        };
        let instance_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Instance Buffer"),
            contents: bytemuck::cast_slice(&instance_data),
            usage: wgpu::BufferUsages::VERTEX,
        });

        (instance_buffer_layout, instance_buffer)
    }

    fn configure_verticies(
        device: &Device,
        vertex_data: &VertexData,
    ) -> (wgpu::VertexBufferLayout<'static>, Buffer) {
        let vertex_buffer_layout = ShapeVertex::desc(); 
        let vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Vertex Buffer"),
            contents: bytemuck::cast_slice(&vertex_data.vertices),
            usage: wgpu::BufferUsages::VERTEX,
        });

        (vertex_buffer_layout, vertex_buffer)
    }

    fn configure_render_pipeline(
        device: &Device,
        camera_bind_group_layout: BindGroupLayout,
        color_table_bind_group_layout: BindGroupLayout,
        light_bind_group_layout: BindGroupLayout,
        glyph_bind_group_layout: BindGroupLayout,
        shader: wgpu::ShaderModule,
        vertex_buffer_layout: wgpu::VertexBufferLayout<'static>,
        instance_buffer_layout: wgpu::VertexBufferLayout<'static>,
        config: &SurfaceConfiguration,
    ) -> RenderPipeline {
        let render_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("Glyph Render Pipeline Layout"),
                bind_group_layouts: &[
                    &camera_bind_group_layout,
                    &color_table_bind_group_layout,
                    &light_bind_group_layout,
                    &glyph_bind_group_layout,
                ],
                push_constant_ranges: &[],
            });

        let render_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("Glyph Render Pipeline"),
            layout: Some(&render_pipeline_layout),
            vertex: wgpu::VertexState {
                module: &shader,
                entry_point: "vs_main",
                buffers: &[vertex_buffer_layout, instance_buffer_layout],
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
}

impl PipelineRunner for Glyphs {
    fn run_pipeline<'a>(&'a self, encoder: &'a mut wgpu::CommandEncoder, smaa_frame: &SmaaFrame) {
        let glyph_instance_data = &self.glyph_instance_data;
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
        render_pass.set_vertex_buffer(0, self.vertex_buffer.slice(..));
        render_pass.set_vertex_buffer(1, self.instance_data_buffer.slice(..));
        render_pass.draw(
            0..self.vertex_data.vertices.len() as u32,
            0..self.vertex_data.instance_data.len() as u32,
        );
    }
}

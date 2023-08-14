pub(crate) mod glyph_instance_data;
use crate::assets::rectangular_prism::create_rectangular_prism;
use crate::camera::uniform_buffer::CameraUniform;
use crate::model::color_table_uniform::ColorTableUniform;
use crate::model::model_configuration::ModelConfiguration;
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
    pub vertices: Vec<Vertex>,
    pub indices: Vec<u32>,
    pub instance_data: Vec<GlyphInstanceData>,
}

pub struct Glyphs {
    render_pipeline: RenderPipeline,
    vertex_buffer: Buffer,
    index_buffer: Buffer,
    camera_bind_group: BindGroup,
    vertex_data: VertexData,
    color_table_bind_group: BindGroup,
    model_configuration: Rc<ModelConfiguration>,
    glyph_uniform_bind_group: BindGroup,
}

impl Glyphs {
    pub fn new(
        glyph_uniform_data: &GlyphUniformData,
        glyph_uniform_buffer: &Buffer,
        glyph_instance_data: &Vec<GlyphInstanceData>,
        device: &Device,
        config: &SurfaceConfiguration,
        camera_buffer: &Buffer,
        camera_uniform: &CameraUniform,
        color_table_buffer: &Buffer,
        color_table_uniform: &ColorTableUniform,
        model_configuration: Rc<ModelConfiguration>,
    ) -> Glyphs {
        let mut vertex_data = VertexData {
            vertices: Vec::new(),
            indices: Vec::new(),
            instance_data: Vec::new(),
        };

        Self::build_verticies(
            &mut vertex_data.vertices,
            &mut vertex_data.indices,
            &model_configuration,
        );

        let shader = device.create_shader_module(wgpu::include_wgsl!("glyphs/shader.wgsl").into());
        let (vertex_buffer_layout, vertex_buffer, index_buffer) =
            Self::configure_verticies(device, &vertex_data);

        let (glyph_uniform_buffer_layout, glyph_uniform_bind_group) =
            glyph_uniform_data.configure_glyph_uniform(glyph_uniform_buffer, device);

        let (camera_bind_group_layout, camera_bind_group) =
            camera_uniform.configure_camera_uniform(camera_buffer, device);

        let (color_table_bind_group_layout, color_table_bind_group) =
            color_table_uniform.configure_color_table_uniform(color_table_buffer, device);

        let render_pipeline = Self::configure_render_pipeline(
            device,
            camera_bind_group_layout,
            color_table_bind_group_layout,
            glyph_uniform_buffer_layout,
            shader,
            vertex_buffer_layout,
            config,
        );

        Glyphs {
            render_pipeline,
            vertex_buffer,
            index_buffer,
            camera_bind_group,
            vertex_data,
            color_table_bind_group,
            model_configuration,
            glyph_uniform_bind_group,
        }
    }

    pub fn build_verticies(
        verticies: &mut Vec<Vertex>,
        indicies: &mut Vec<u32>,
        model_configuration: &Rc<ModelConfiguration>,
    ) {
        //Our x/y size
        let glyph_size = 0.015;

        //Our z size is based on the height of the grid with a little bit of padding so that
        //the top does not but up against the z axis line
        let length = (model_configuration.grid_cylinder_length
            + model_configuration.grid_cone_length)
            * model_configuration.z_height_ratio;

        let (base_verticies, base_indicies) = create_rectangular_prism(glyph_size, length);
        //now we want to move this to -1,-1,-1.
        //The center of the cube is at 0,0 so x and y hang over by 1/2 the width.
        let x_y_offset = -1.0 + glyph_size / 2.0;
        //z sits at 0.0 so just subtract 1 to move it down.
        let z_offset = -1.0;

        for vertex in &base_verticies {
            verticies.push(Vertex {
                position: [
                    vertex[0] + x_y_offset,
                    vertex[1] + x_y_offset,
                    vertex[2] + z_offset,
                ],
            });
        }

        for index in &base_indicies {
            indicies.push(*index);
        }
    }

    fn configure_verticies(
        device: &Device,
        vertex_data: &VertexData,
    ) -> (wgpu::VertexBufferLayout<'static>, Buffer, Buffer) {
        let vertex_buffer_layout = wgpu::VertexBufferLayout {
            array_stride: std::mem::size_of::<Vertex>() as wgpu::BufferAddress,
            step_mode: wgpu::VertexStepMode::Vertex,
            attributes: &[
                wgpu::VertexAttribute {
                    offset: 0,
                    shader_location: 0,
                    format: wgpu::VertexFormat::Float32x3,
                },
                wgpu::VertexAttribute {
                    offset: std::mem::size_of::<[f32; 3]>() as wgpu::BufferAddress,
                    shader_location: 1,
                    format: wgpu::VertexFormat::Uint32,
                },
            ],
        };
        let vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Vertex Buffer"),
            contents: bytemuck::cast_slice(&vertex_data.vertices),
            usage: wgpu::BufferUsages::VERTEX,
        });

        let index_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Index Buffer"),
            contents: bytemuck::cast_slice(&vertex_data.indices),
            usage: wgpu::BufferUsages::INDEX,
        });
        (vertex_buffer_layout, vertex_buffer, index_buffer)
    }

    fn configure_render_pipeline(
        device: &Device,
        camera_bind_group_layout: BindGroupLayout,
        color_table_bind_group_layout: BindGroupLayout,
        glyph_bind_group_layout: BindGroupLayout,
        shader: wgpu::ShaderModule,
        vertex_buffer_layout: wgpu::VertexBufferLayout<'static>,
        config: &SurfaceConfiguration,
    ) -> RenderPipeline {
        let render_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("Render Pipeline Layout"),
                bind_group_layouts: &[
                    &camera_bind_group_layout,
                    &color_table_bind_group_layout,
                    &glyph_bind_group_layout,
                ],
                push_constant_ranges: &[],
            });

        let render_pipeline = device.create_render_pipeline(&wgpu::RenderPipelineDescriptor {
            label: Some("Render Pipeline"),
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
                cull_mode: None, //Some(wgpu::Face::Back),
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
        render_pass.set_bind_group(2, &self.glyph_uniform_bind_group, &[]);
        render_pass.set_vertex_buffer(0, self.vertex_buffer.slice(..));
        render_pass.set_index_buffer(self.index_buffer.slice(..), wgpu::IndexFormat::Uint32);
        render_pass.draw_indexed(0..self.vertex_data.indices.len() as u32, 0, 0..1);
    }
}

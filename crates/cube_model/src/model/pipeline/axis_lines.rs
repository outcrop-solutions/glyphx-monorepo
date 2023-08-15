use crate::assets::axis_line::create_axis_line;
use crate::camera::uniform_buffer::CameraUniform;
use crate::model::color_table_uniform::ColorTableUniform;
use crate::model::pipeline::pipeline_manager::Pipeline;
use bytemuck;
use wgpu::util::DeviceExt;
use wgpu::{
    BindGroup, BindGroupLayout, Buffer, Device, Queue, RenderPipeline, Surface,
    SurfaceConfiguration, TextureViewDescriptor,
};

use smaa::SmaaTarget;

#[repr(C)]
#[derive(Copy, Clone, Debug, bytemuck::Pod, bytemuck::Zeroable)]
pub struct Vertex {
    pub position: [f32; 3],
    pub color: u32,
}

#[derive(Debug)]
pub struct VertexData {
    verticies: Vec<Vertex>,
    indicies: Vec<u32>,
}

pub struct AxisLines {
    render_pipeline: RenderPipeline,
    vertex_buffer: Buffer,
    index_buffer: Buffer,
    camera_buffer: Buffer,
    camera_bind_group: BindGroup,
    vertex_data: VertexData,
    color_table_buffer: Buffer,
    color_table_bind_group: BindGroup,
}

impl AxisLines {
    pub fn new(
        device: &Device,
        config: &SurfaceConfiguration,
        camera_uniform: &CameraUniform,
        color_table_uniform: &ColorTableUniform,
    ) -> AxisLines {
        let mut vertex_data = VertexData {
            verticies: Vec::new(),
            indicies: Vec::new(),
        };

        Self::build_verticies(&mut vertex_data.verticies, &mut vertex_data.indicies);

        let shader =
            device.create_shader_module(wgpu::include_wgsl!("axis_lines/shader.wgsl").into());
        let (vertex_buffer_layout, vertex_buffer, index_buffer) =
            Self::configure_verticies(device, &vertex_data);

        let (camera_buffer, camera_bind_group_layout, camera_bind_group) =
            Self::configure_camera(device, camera_uniform);

        let (color_table_buffer, color_table_bind_group_layout, color_table_bind_group) =
            configure_color_table(device, color_table_uniform);

        let render_pipeline = Self::configure_render_pipeline(
            device,
            camera_bind_group_layout,
            color_table_bind_group_layout,
            shader,
            vertex_buffer_layout,
            config,
        );

        AxisLines {
            render_pipeline,
            vertex_buffer,
            index_buffer,
            camera_buffer,
            camera_bind_group,
            vertex_data,
            color_table_buffer,
            color_table_bind_group,
        }
    }

    pub fn build_verticies(verticies: &mut Vec<Vertex>, indicies: &mut Vec<u32>) {
        let radius = 0.01;
        let length = 1.8;
        let cylinder_height_pct = 0.97;
        let cylinder_height = length * cylinder_height_pct;
        let cone_height = length - cylinder_height;

        let cone_radius_pct = 2.5;
        //Just for x and y z is a half lenght cylindar
        let (axis_verticies, axis_indicies) = create_axis_line(radius, cylinder_height, cone_height, cone_radius_pct);
        //In our logic the cone's radius is 2.5 times the cylinder radius.
        let cone_radius = radius * cone_radius_pct;
        //Subtracting this point should put the edge of the cone at -1.0.
        let offset = 1.0 - cone_radius;
        //create an x oriented axis line which is red.  //We also need to move from 0.0 to the
        //edge, so we will need to calculate the offset based on the size of the radius.

        for vertex in &axis_verticies {
            let x = vertex[0] - offset;
            let y = vertex[1] - offset;
            let z = vertex[2] - offset;
            verticies.push(Vertex {
                //lay the line on its side.
                position: [z, y, x],
                color: 60, //x_color is 60 in our color table
            });
        }
        indicies.extend_from_slice(&axis_indicies);

        let index_offset = verticies.len() as u32;
        //create a y oriented axis line which is green.

        for vertex in &axis_verticies {
            let x = vertex[0] - offset;
            let y = vertex[1] - offset;
            let z = vertex[2] - offset;
            verticies.push(Vertex {
                //lay the line on its side.
                position: [x, z, y],
                color: 61, //x_color is 60 in our color table
            });
        }
        for index in &axis_indicies {
            indicies.push(index + index_offset);
        }

        //Make a half length line with the same proportions
        let (axis_verticies, axis_indicies) = create_axis_line(radius, cylinder_height/2.0, cone_height, cone_radius_pct);
        //create a z oriented axis line which is blue.
        let index_offset = verticies.len() as u32;
        //create a y oriented axis line which is green.

        for vertex in &axis_verticies {
            let x = vertex[0] - offset;
            let y = vertex[1] - offset;
            let z = (vertex[2] *0.5) - offset;
            verticies.push(Vertex {
                //lay the line on its side.
                position: [x, y, z],
                color: 62, //x_color is 60 in our color table
            });
        }
        for index in &axis_indicies {
            indicies.push(index + index_offset);
        }
    }

    fn configure_camera(
        device: &Device,
        camera_uniform: &CameraUniform,
    ) -> (Buffer, BindGroupLayout, BindGroup) {
        let camera_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Camera Buffer"),
            contents: bytemuck::cast_slice(&[*camera_uniform]),
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
        });

        let camera_bind_group_layout =
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
                label: Some("camera_bind_group_layout"),
            });

        let camera_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &camera_bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: camera_buffer.as_entire_binding(),
            }],
            label: Some("camera_bind_group"),
        });

        (camera_buffer, camera_bind_group_layout, camera_bind_group)
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
            contents: bytemuck::cast_slice(&vertex_data.verticies),
            usage: wgpu::BufferUsages::VERTEX,
        });

        let index_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Index Buffer"),
            contents: bytemuck::cast_slice(&vertex_data.indicies),
            usage: wgpu::BufferUsages::INDEX,
        });
        (vertex_buffer_layout, vertex_buffer, index_buffer)
    }

    fn configure_render_pipeline(
        device: &Device,
        camera_bind_group_layout: BindGroupLayout,
        color_table_bind_group_layout: BindGroupLayout,
        shader: wgpu::ShaderModule,
        vertex_buffer_layout: wgpu::VertexBufferLayout<'static>,
        config: &SurfaceConfiguration,
    ) -> RenderPipeline {
        let render_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("Render Pipeline Layout"),
                bind_group_layouts: &[&camera_bind_group_layout, &color_table_bind_group_layout],
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
}

fn configure_color_table(
    device: &Device,
    color_table_uniform: &ColorTableUniform,
) -> (Buffer, BindGroupLayout, BindGroup) {
    let color_table_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
        label: Some("Color Table Buffer"),
        contents: bytemuck::cast_slice(&[*color_table_uniform]),
        usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
    });

    let color_table_bind_group_layout =
        device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
            entries: &[wgpu::BindGroupLayoutEntry {
                binding: 0,
                visibility: wgpu::ShaderStages::VERTEX_FRAGMENT,
                ty: wgpu::BindingType::Buffer {
                    ty: wgpu::BufferBindingType::Uniform,
                    has_dynamic_offset: false,
                    min_binding_size: None,
                },
                count: None,
            }],
            label: Some("color_table_bind_group_layout"),
        });

    let color_table_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
        layout: &color_table_bind_group_layout,
        entries: &[wgpu::BindGroupEntry {
            binding: 0,
            resource: color_table_buffer.as_entire_binding(),
        }],
        label: Some("color_table_bind_group"),
    });
    (
        color_table_buffer,
        color_table_bind_group_layout,
        color_table_bind_group,
    )
}

impl Pipeline for AxisLines {
    fn run_pipeline(
        &self,
        surface: &Surface,
        device: &Device,
        queue: &Queue,
        camera_uniform: Option<&CameraUniform>,
        color_table_uniform: Option<&ColorTableUniform>,
        smaa_target: Option<&mut SmaaTarget>,
    ) -> Result<(), wgpu::SurfaceError> {
        let camera_uniform = camera_uniform.unwrap();
        let color_table_uniform = color_table_uniform.unwrap();

        let background_color = color_table_uniform.background_color();

        queue.write_buffer(
            &self.camera_buffer,
            0,
            bytemuck::cast_slice(&[*camera_uniform]),
        );
        queue.write_buffer(
            &self.color_table_buffer,
            0,
            bytemuck::cast_slice(&[*color_table_uniform]),
        );

        let output = surface.get_current_texture()?;
        let view = output
            .texture
            .create_view(&TextureViewDescriptor::default());

        let smaa_target = smaa_target.unwrap();
        let smaa_frame = smaa_target.start_frame(device, queue, &view);
        let mut encoder = device.create_command_encoder(&wgpu::CommandEncoderDescriptor {
            label: Some("Render Encoder"),
        });

        let mut render_pass = encoder.begin_render_pass(&wgpu::RenderPassDescriptor {
            label: Some("Render Pass"),
            color_attachments: &[Some(wgpu::RenderPassColorAttachment {
                view: &*smaa_frame,
                resolve_target: None,
                ops: wgpu::Operations {
                    load: wgpu::LoadOp::Clear(wgpu::Color {
                        r: background_color[0] as f64,
                        g: background_color[1] as f64,
                        b: background_color[2] as f64,
                        a: 1.0,
                    }),
                    store: true,
                },
            })],
            depth_stencil_attachment: None,
        });

        render_pass.set_pipeline(&self.render_pipeline);
        render_pass.set_bind_group(0, &self.camera_bind_group, &[]);
        render_pass.set_bind_group(1, &self.color_table_bind_group, &[]);
        render_pass.set_vertex_buffer(0, self.vertex_buffer.slice(..));
        render_pass.set_index_buffer(self.index_buffer.slice(..), wgpu::IndexFormat::Uint32);
        render_pass.draw_indexed(0..self.vertex_data.indicies.len() as u32, 0, 0..1);
        drop(render_pass);
        queue.submit(std::iter::once(encoder.finish()));
        smaa_frame.resolve();
        output.present();
        Ok(())
    }
}

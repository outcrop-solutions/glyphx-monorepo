use crate::assets::axis_line::create_axis_line;
use crate::assets::shape_vertex::ShapeVertex;
use crate::camera::uniform_buffer::CameraUniform;
use crate::model::color_table_uniform::ColorTableUniform;
use crate::model::model_configuration::ModelConfiguration;
use crate::light::light_uniform::LightUniform;
use bytemuck;
use wgpu::util::DeviceExt;
use wgpu::{BindGroup, BindGroupLayout, Buffer, Device, RenderPipeline, SurfaceConfiguration};

use smaa::SmaaFrame;
use std::borrow::Borrow;
use std::rc::Rc;
use std::cell::RefCell;
use crate::model::pipeline::PipelineRunner;

pub enum AxisLineDirection {
    X,
    Y,
    Z,
}


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
    camera_bind_group: BindGroup,
    vertex_data: Vec<ShapeVertex>,
    color_table_bind_group: BindGroup,
    light_bind_group: BindGroup,
    model_configuration: Rc<RefCell<ModelConfiguration>>,
    direction: AxisLineDirection,
    device: Rc<RefCell<Device>>,
    axis_start: f32,
}

impl AxisLines {
    pub fn new(
        device: Rc<RefCell<wgpu::Device>>,
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

    ) -> AxisLines {

        let vertex_data = Self::build_verticies(
            &model_configuration,
            &direction,
            axis_start,
        );
        let d_clone = device.clone();
        let d = d_clone.as_ref().borrow();
        let shader =
            d.create_shader_module(wgpu::include_wgsl!("axis_lines/shader.wgsl").into());

        let (vertex_buffer_layout, vertex_buffer) =
            Self::configure_verticies(&d, &vertex_data);

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
            axis_start
        }
    }
    pub fn set_axis_start(&mut self, axis_start: f32){
        self.axis_start = axis_start;
    }
    pub fn build_verticies(
        model_configuration: &Rc<RefCell<ModelConfiguration>>,
        direction: &AxisLineDirection,
        axis_start: f32,
    ) -> Vec<ShapeVertex>{
        let mut vertex_data: Vec<ShapeVertex> = Vec::new();
        let mc = model_configuration.as_ref().borrow();
        let cylinder_radius = mc.grid_cylinder_radius;
        let cylinder_height = mc.grid_cylinder_length;
        let cone_height = mc.grid_cone_length;
        let cone_radius = mc.grid_cone_radius;
        //To the outside world z is up.  To us y is up
        let y_height_ratio = mc.z_height_ratio;
        let (height, color, order) = match direction {
            AxisLineDirection::X => (cylinder_height , 60, [1,2,0]),
            AxisLineDirection::Y => (cylinder_height* y_height_ratio , 62, [0,1,2]),
            AxisLineDirection::Z => (cylinder_height + cone_height, 61, [2,0,1]),
        };

        let offset = 1.0 -  cone_radius;
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
            &self.model_configuration,
            &self.direction,
            self.axis_start,
        );

        let d = self.device.as_ref().borrow();
        self.vertex_buffer = d.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Vertex Buffer"),
            contents: bytemuck::cast_slice(&self.vertex_data),
            usage: wgpu::BufferUsages::VERTEX,
        });
    } 
    fn configure_verticies(
        device: &Device,
        vertex_data: &Vec<ShapeVertex>,
    ) -> (wgpu::VertexBufferLayout<'static>, Buffer) {
        let vertex_buffer_layout = ShapeVertex::desc();
        let vertex_buffer = device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Vertex Buffer"),
            contents: bytemuck::cast_slice(&vertex_data),
            usage: wgpu::BufferUsages::VERTEX,
        });

        (vertex_buffer_layout, vertex_buffer)
    }

    fn configure_render_pipeline(
        device: &Device,
        camera_bind_group_layout: BindGroupLayout,
        color_table_bind_group_layout: BindGroupLayout,
        light_bind_group_layout: BindGroupLayout,
        shader: wgpu::ShaderModule,
        vertex_buffer_layout: wgpu::VertexBufferLayout<'static>,
        config: &SurfaceConfiguration,
    ) -> RenderPipeline {
        let render_pipeline_layout =
            device.create_pipeline_layout(&wgpu::PipelineLayoutDescriptor {
                label: Some("Render Pipeline Layout"),
                bind_group_layouts: &[&camera_bind_group_layout, &color_table_bind_group_layout, &light_bind_group_layout],
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

impl PipelineRunner for AxisLines{
   fn run_pipeline<'a>(
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
        render_pass.set_bind_group(2, &self.light_bind_group, &[]);
        render_pass.set_vertex_buffer(0, self.vertex_buffer.slice(..));
        render_pass.draw(0..self.vertex_data.len() as u32, 0..1);
    }
}

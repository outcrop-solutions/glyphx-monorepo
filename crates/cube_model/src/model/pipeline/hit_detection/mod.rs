pub(crate) mod hit_detection_data;

pub use hit_detection_data::HitDetectionData;

use crate::{
    camera::uniform_buffer::CameraUniform, model::state::data_manager::HitDetectionManager,
    DataManager, ModelConfiguration,
};

use bytemuck::{cast_slice, Pod, Zeroable};
use std::cell::RefCell;
use std::rc::Rc;
use wgpu::{util::DeviceExt, BindGroup, Buffer, ComputePipeline, Device, Queue, ShaderModule};

#[repr(C)]
#[derive(Copy, Clone, Debug, Pod, Zeroable)]
pub struct HitCoordinates {
    pub x: f32,
    pub y: f32,
    pub _padding: [f32; 2],
}

#[repr(C)]
#[derive(Copy, Clone, Debug, Pod, Zeroable, serde::Serialize, serde::Deserialize)]
pub struct HitDetectionOutputData {
    pub glyph_id: u32,
    pub x_rank: u32,
    pub z_rank: u32,
    pub is_selected: u32,
    pub vertex1_raw_x: f32,
    pub vertex1_raw_y: f32,
    pub vertex1_raw_z: f32,
    pub vertex1_raw_y_2d: f32,
    pub vertex1_raw_z_2d: f32,
    pub vertex1_raw_w_2d: f32,
    pub vertex1_y_2d: f32,
    pub vertex1_z_2d: f32,
    pub vertex1_2d: [f32; 2],
    pub vertex2_raw_x: f32,
    pub vertex2_raw_y: f32,
    pub vertex2_raw_z: f32,
    pub vertex2_raw_y_2d: f32,
    pub vertex2_raw_z_2d: f32,
    pub vertex2_y_2d: f32,
    pub vertex2_z_2d: f32,
    pub vertex2_2d: [f32; 2],
    pub vertex3_raw_x: f32,
    pub vertex3_raw_y: f32,
    pub vertex3_raw_z: f32,
    pub vertex3_raw_y_2d: f32,
    pub vertex3_raw_z_2d: f32,
    pub vertex3_y_2d: f32,
    pub vertex3_z_2d: f32,
    pub vertex3_2d: [f32; 2],
    pub hit_point_x: f32,
    pub hit_point_y: f32,
}
pub struct HitDetection {
    data_manager: Rc<RefCell<DataManager>>,
    device: Rc<RefCell<Device>>,
    compute_pipeline: ComputePipeline,
    input_buffer: Buffer,
    input_count: usize,
    input_bind_group: BindGroup,
    hit_uniform_buffer: Buffer,
    hit_uniform_bind_group: BindGroup,
    camera_buffer: Buffer,
    camera_bind_group: BindGroup,
    output_buffer: Buffer,
    output_size: u64,
    output_bind_group: BindGroup,
}

impl HitDetection {
    pub fn new(
        device: Rc<RefCell<Device>>,
        data_manager: Rc<RefCell<DataManager>>,
    ) -> HitDetection {
        let d = device.clone();
        let d = d.as_ref().borrow();

        let shader = d.create_shader_module(wgpu::include_wgsl!("shader.wgsl").into());

        let input_buffer =
            Self::configure_input_buffer(&d, data_manager.borrow().get_hit_detection_data());

        let hit_uniform_buffer = Self::configure_hit_uniform_buffer(&d);

        let camera_buffer = Self::configure_camera_uniform_buffer(&d);

        let dm = data_manager.borrow();
        let input_count = dm.get_hit_detection_data().len();
        let (output_buffer, output_size) = Self::configure_output_buffer(&d, input_count);

        let (
            compute_pipeline,
            input_bind_group,
            hit_uniform_bind_group,
            camera_bind_group,
            output_bind_group,
        ) = Self::configure_compute_pipeline(
            &d,
            &input_buffer,
            &hit_uniform_buffer,
            &camera_buffer,
            &output_buffer,
            &shader,
        );

        HitDetection {
            data_manager: data_manager.clone(),
            device,
            compute_pipeline,
            input_buffer,
            input_count,
            input_bind_group,
            hit_uniform_buffer,
            hit_uniform_bind_group,
            camera_buffer,
            camera_bind_group,
            output_buffer,
            output_size,
            output_bind_group,
        }
    }

    fn configure_input_buffer(
        device: &Device,
        hit_detection_data: &Vec<HitDetectionData>,
    ) -> Buffer {
        device.create_buffer_init(&wgpu::util::BufferInitDescriptor {
            label: Some("Input Buffer"),
            contents: bytemuck::cast_slice(hit_detection_data.as_slice()),
            usage: wgpu::BufferUsages::STORAGE,
        })
    }

    fn configure_hit_uniform_buffer(d: &Device) -> Buffer {
        let hit_uniform_buffer = d.create_buffer(&wgpu::BufferDescriptor {
            label: Some("Hit Uniform Buffer"),
            size: std::mem::size_of::<HitCoordinates>() as u64,
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });
        hit_uniform_buffer
    }

    fn configure_camera_uniform_buffer(d: &Device) -> Buffer {
        let camera_uniform_buffer = d.create_buffer(&wgpu::BufferDescriptor {
            label: Some("Camera Uniform Buffer"),
            size: std::mem::size_of::<CameraUniform>() as u64,
            usage: wgpu::BufferUsages::UNIFORM | wgpu::BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });
        camera_uniform_buffer
    }

    fn configure_output_buffer(d: &Device, number_of_inputs: usize) -> (Buffer, u64) {
        let output_size = (std::mem::size_of::<HitDetectionOutputData>() * number_of_inputs) as u64;
        let output_buffer = d.create_buffer(&wgpu::BufferDescriptor {
            label: Some("Output Buffer"),
            size: output_size,
            usage: wgpu::BufferUsages::STORAGE | wgpu::BufferUsages::COPY_SRC,
            mapped_at_creation: false,
        });
        (output_buffer, output_size)
    }

    fn configure_compute_pipeline(
        device: &Device,
        input_buffer: &Buffer,
        hit_uniform_buffer: &Buffer,
        camera_buffer: &Buffer,
        output_buffer: &Buffer,
        shader: &ShaderModule,
    ) -> (ComputePipeline, BindGroup, BindGroup, BindGroup, BindGroup) {
        let compute_pipeline = device.create_compute_pipeline(&wgpu::ComputePipelineDescriptor {
            label: Some("Hit Detection Pipeline"),
            layout: None,
            module: shader,
            entry_point: "main",
        });

        let input_bind_group_layout = compute_pipeline.get_bind_group_layout(0);
        let input_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &input_bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: input_buffer.as_entire_binding(),
            }],
            label: Some("input_bind_group"),
        });

        let hit_uniform_bind_group_layout = compute_pipeline.get_bind_group_layout(1);
        let hit_uniform_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &hit_uniform_bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: hit_uniform_buffer.as_entire_binding(),
            }],
            label: Some("hit_uniform_bind_group"),
        });

        let camera_bind_group_layout = compute_pipeline.get_bind_group_layout(2);
        let camera_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &camera_bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: camera_buffer.as_entire_binding(),
            }],
            label: Some("instance_bind_group"),
        });

        let output_bind_group_layout = compute_pipeline.get_bind_group_layout(3);
        let output_bind_group = device.create_bind_group(&wgpu::BindGroupDescriptor {
            layout: &output_bind_group_layout,
            entries: &[wgpu::BindGroupEntry {
                binding: 0,
                resource: output_buffer.as_entire_binding(),
            }],
            label: Some("output_bind_group"),
        });
        (
            compute_pipeline,
            input_bind_group,
            hit_uniform_bind_group,
            camera_bind_group,
            output_bind_group,
        )
    }

    pub fn run_pipeline<'a>(
        &'a self,
        encoder: &'a mut wgpu::CommandEncoder,
        queue: &Queue,
        hit_coordinates_data: &HitCoordinates,
        camera_uniform: &CameraUniform,
    ) -> Buffer {
        let d = self.device.borrow();
        queue.write_buffer(
            &self.hit_uniform_buffer,
            0,
            cast_slice(&[hit_coordinates_data.clone()]),
        );
        queue.write_buffer(
            &self.camera_buffer,
            0,
            cast_slice(&[camera_uniform.clone()]),
        );

        let staging_buffer = d.create_buffer(&wgpu::BufferDescriptor {
            label: Some("Staging Buffer"),
            size: self.output_size,
            usage: wgpu::BufferUsages::MAP_READ | wgpu::BufferUsages::COPY_DST,
            mapped_at_creation: false,
        });
        {
            let mut compute_pass = encoder.begin_compute_pass(&wgpu::ComputePassDescriptor {
                label: Some("Glyph Data Pass"),
            });

            compute_pass.set_pipeline(&self.compute_pipeline);
            compute_pass.set_bind_group(0, &self.input_bind_group, &[]);
            compute_pass.set_bind_group(1, &self.hit_uniform_bind_group, &[]);
            compute_pass.set_bind_group(2, &self.camera_bind_group, &[]);
            compute_pass.set_bind_group(3, &self.output_bind_group, &[]);
            compute_pass.dispatch_workgroups(self.input_count as u32, 1, 1);
        }
        encoder.copy_buffer_to_buffer(
            &self.output_buffer,
            0,
            &staging_buffer,
            0,
            self.output_size as u64,
        );
        staging_buffer
    }
}

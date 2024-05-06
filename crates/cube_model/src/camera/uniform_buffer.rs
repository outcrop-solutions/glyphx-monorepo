///https://github.com/FrankenApps/wgpu_cube/blob/master/src/render/camera.rs
use crate::camera::orbit_camera::OrbitCamera;
use crate::camera::Camera;
use wgpu::{BindGroup, BindGroupLayout, Buffer, Device};
use glam::Mat4;
/// The camera uniform contains the data linked to the camera that is passed to the shader.
#[repr(C)]
#[derive(Debug, Copy, Clone, bytemuck::Pod, bytemuck::Zeroable)]
pub struct CameraUniform {
    /// The eye position of the camera in homogenous coordinates.
    ///
    /// Homogenous coordinates are used to fullfill the 16 byte alignment requirement.
    pub view_position: [f32; 4],

    /// Contains the view projection matrix.
    pub view_proj: [[f32; 4]; 4],

    pub y_offset: f32,
    pub x_offset: f32,
    pub z_offset: f32,
    pub padding: f32,
}
const OFFSET_AMMOUNT: f32 = 0.1;
impl CameraUniform {
    /// Updates the view projection matrix of this [CameraUniform].
    ///
    /// Arguments:
    /// * `camera`: The [OrbitCamera] from which the matrix will be computed.
    pub fn update_view_proj(&mut self, camera: &OrbitCamera) {
        self.view_position = [camera.eye.x, camera.eye.y, camera.eye.z, 1.0];
        self.view_proj = camera.build_view_projection_matrix().to_cols_array_2d();
    }

    pub fn update_y_offset(&mut self, y_offset: f32) {
        self.y_offset = self.y_offset + (y_offset * OFFSET_AMMOUNT);
    }

    pub fn update_x_offset(&mut self, x_offset: f32) {
        self.x_offset = self.x_offset + (x_offset * OFFSET_AMMOUNT);
    }

    pub fn update_z_offset(&mut self, z_offset: f32) {
        self.z_offset = self.z_offset + (z_offset * OFFSET_AMMOUNT);
    }
    pub fn configure_camera_uniform(
        &self,
        camera_buffer: &Buffer,
        device: &Device,
    ) -> (BindGroupLayout, BindGroup) {

        let camera_bind_group_layout =
            device.create_bind_group_layout(&wgpu::BindGroupLayoutDescriptor {
                entries: &[wgpu::BindGroupLayoutEntry {
                    binding: 0,
                    visibility: wgpu::ShaderStages::VERTEX | wgpu::ShaderStages::FRAGMENT,
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

        (camera_bind_group_layout, camera_bind_group)
    }
}

impl Default for CameraUniform {
    /// Creates a default [CameraUniform].
    fn default() -> Self {
        Self {
            view_position: [0.0; 4],
            view_proj: Mat4::IDENTITY.to_cols_array_2d(),
            y_offset:0.0,
            x_offset: 0.0,
            z_offset: 0.0,
            padding: 0.0,
        }
    }

}

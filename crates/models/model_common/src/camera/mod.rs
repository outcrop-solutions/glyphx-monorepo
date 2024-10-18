mod camera_manager;
mod camera_controller;
mod orbit_camera;

pub use camera_manager::*;
pub use camera_controller::*;
pub use orbit_camera::*;

use glam::Mat4;

/// A camera is used for rendering specific parts of the scene.
pub trait Camera: Sized {
    fn build_view_projection_matrix(&self) -> Mat4;
}
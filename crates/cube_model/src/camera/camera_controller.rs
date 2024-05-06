use winit::{
    dpi::PhysicalPosition,
    event::{DeviceEvent, ElementState, MouseScrollDelta},
};

use crate::model::state::CameraManager;

pub struct CameraController {
    pub rotate_speed: f32,
    pub zoom_speed: f32,
    is_drag_rotate: bool,
}

impl CameraController {
    pub fn new(rotate_speed: f32, zoom_speed: f32) -> Self {
        Self {
            rotate_speed,
            zoom_speed,
            is_drag_rotate: false,
        }
    }

    pub fn process_events(
        &mut self,
        event: &DeviceEvent,
        camera_manager: &mut CameraManager,
    ) -> bool {
        match event {
            DeviceEvent::Button {
                #[cfg(target_os = "macos")]
                    button: 0, // The Left Mouse Button on macos.
                // This seems like it is a winit bug?
                #[cfg(not(target_os = "macos"))]
                    button: 1, // The Left Mouse Button on all other platforms.

                state,
            } => {
                let is_pressed = *state == ElementState::Pressed;
                self.is_drag_rotate = is_pressed;
                true
            }
            DeviceEvent::MouseWheel { delta, .. } => {
                let scroll_amount = -match delta {
                    // A mouse line is about 1 px.
                    MouseScrollDelta::LineDelta(_, scroll) => scroll * 1.0,
                    MouseScrollDelta::PixelDelta(PhysicalPosition { y: scroll, .. }) => {
                        *scroll as f32
                    }
                };
                camera_manager.add_distance(scroll_amount * self.zoom_speed);
                camera_manager.update();
                true
            }
            DeviceEvent::MouseMotion { delta } => {
                if self.is_drag_rotate {
                    camera_manager.add_yaw(-delta.0 as f32 * self.rotate_speed);
                    camera_manager.add_pitch(delta.1 as f32 * self.rotate_speed);
                    camera_manager.update();
                }
                true
            }
            _ => false,
        }
    }
}

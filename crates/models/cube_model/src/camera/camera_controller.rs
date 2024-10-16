use winit::{
    dpi::PhysicalPosition,
    event::{DeviceEvent, ElementState, MouseScrollDelta},
};

use crate::model::state::CameraManager;

#[derive(Debug)]
pub enum MouseEvent {
    MouseDown,
    MouseMotion,
    MouseClick,
    MouseScroll,
    Handled,
    Unhandled,
}

pub struct CameraController {
    pub rotate_speed: f32,
    pub zoom_speed: f32,
    is_drag_rotate: bool,
    is_click: bool,
    pitch_swallow: f32,
    yaw_swallow: f32,
}

impl CameraController {
    const SWALLOWDELTA: f32 = 10.0;
    pub fn new(rotate_speed: f32, zoom_speed: f32) -> Self {
        Self {
            rotate_speed,
            zoom_speed,
            is_drag_rotate: false,
            is_click: false,
            pitch_swallow: 0.0,
            yaw_swallow: 0.0,
        }
    }

    pub fn process_events(
        &mut self,
        event: &DeviceEvent,
        camera_manager: &mut CameraManager,
    ) -> MouseEvent {
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
                if !is_pressed && self.is_click {
                    self.is_click = false;
                    MouseEvent::MouseClick
                } else if !is_pressed && (self.yaw_swallow != 0.0 || self.pitch_swallow != 0.0) {
                    camera_manager.add_yaw(-self.yaw_swallow * self.rotate_speed);
                    camera_manager.add_pitch(self.pitch_swallow * self.rotate_speed);
                    self.pitch_swallow = 0.0;
                    self.yaw_swallow = 0.0;

                    camera_manager.update();
                    MouseEvent::MouseMotion
                } else if is_pressed {
                    self.is_click = true;
                    MouseEvent::MouseDown
                } else {
                    MouseEvent::Handled
                }
            }
            DeviceEvent::MouseWheel { delta, .. } => {
                let scroll_amount = -match delta {
                    // A mouse line is about 1 px.
                    MouseScrollDelta::LineDelta(_, scroll) => scroll * -5.0,
                    MouseScrollDelta::PixelDelta(PhysicalPosition { y: scroll, .. }) => {
                        *scroll as f32
                    }
                };
                camera_manager.add_distance(scroll_amount * self.zoom_speed);
                camera_manager.update();
                MouseEvent::MouseScroll
            }
            DeviceEvent::MouseMotion { delta } => {
                if self.is_drag_rotate {
                    self.is_click = false;
                    self.pitch_swallow += delta.1 as f32;
                    self.yaw_swallow += delta.0 as f32;
                    if self.pitch_swallow.abs() < Self::SWALLOWDELTA
                        && self.yaw_swallow.abs() < Self::SWALLOWDELTA
                    {
                        return MouseEvent::Handled;
                    }
                    camera_manager.add_yaw(-self.yaw_swallow * self.rotate_speed);
                    camera_manager.add_pitch(self.pitch_swallow * self.rotate_speed);
                    self.pitch_swallow = 0.0;
                    self.yaw_swallow = 0.0;

                    camera_manager.update();
                    MouseEvent::MouseMotion
                } else {
                    MouseEvent::Unhandled
                }
            }
            _ => MouseEvent::Unhandled,
        }
    }
}

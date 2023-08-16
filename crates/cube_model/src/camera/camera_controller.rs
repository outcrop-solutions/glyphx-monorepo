use winit::{
    dpi::PhysicalPosition,
    event::{DeviceEvent, ElementState, MouseScrollDelta},
};

use crate::camera::orbit_camera::OrbitCamera;

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
        camera: &mut OrbitCamera,
    )-> bool {
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
                camera.add_distance(scroll_amount * self.zoom_speed);
               true 
            }
            DeviceEvent::MouseMotion { delta } => {
                if self.is_drag_rotate {
                    camera.add_yaw(-delta.0 as f32 * self.rotate_speed);
                    camera.add_pitch(delta.1 as f32 * self.rotate_speed);
                }
                true
            }
            _ => false,
        }
    }
}


// use winit::event::{ElementState, KeyboardInput, WindowEvent, VirtualKeyCode}; 
// use super::Camera;

// pub struct CameraController {
//     speed: f32,
//     is_forward_pressed: bool,
//     is_backward_pressed: bool,
//     is_left_pressed: bool,
//     is_right_pressed: bool,
// }

// impl CameraController {
//     pub fn new(speed: f32) -> Self {
//         Self {
//             speed,
//             is_forward_pressed: false,
//             is_backward_pressed: false,
//             is_left_pressed: false,
//             is_right_pressed: false,
//         }
//     }

//     pub fn move_right(&mut self, on_or_off: bool) {
//         self.is_right_pressed = on_or_off ;
//     }
//     pub fn move_left(&mut self, on_or_off: bool) {
//         self.is_left_pressed = on_or_off ;
//     }
//     pub fn move_forward(&mut self, on_or_off: bool) {
//         self.is_forward_pressed =on_or_off;
//     }
//     pub fn move_backward(&mut self, on_or_off: bool) {
//         self.is_backward_pressed = on_or_off;
//     }
//     pub fn process_events(&mut self, event: &WindowEvent) -> bool {
//         match event {
//             WindowEvent::KeyboardInput {
//                 input: KeyboardInput {
//                     state,
//                     virtual_keycode: Some(keycode),
//                     ..
//                 },
//                 ..
//             } => {
//                 let is_pressed = *state == ElementState::Pressed;
//                 match keycode {
//                     VirtualKeyCode::W | VirtualKeyCode::Up => {
//                         self.is_forward_pressed = is_pressed;
//                         true
//                     }
//                     VirtualKeyCode::A | VirtualKeyCode::Left => {
//                         self.is_left_pressed = is_pressed;
//                         true
//                     }
//                     VirtualKeyCode::S | VirtualKeyCode::Down => {
//                         self.is_backward_pressed = is_pressed;
//                         true
//                     }
//                     VirtualKeyCode::D | VirtualKeyCode::Right => {
//                         self.is_right_pressed = is_pressed;
//                         true
//                     }
//                     _ => false,
//                 }
//             }
//             _ => false,
//         }
//     }

//     pub fn update_camera(&self, camera: &mut Camera) {
//         use cgmath::InnerSpace;
//         let forward = camera.target - camera.eye;
//         let forward_norm = forward.normalize();
//         let forward_mag = forward.magnitude();

//         // Prevents glitching when camera gets too close to the
//         // center of the scene.
//         if self.is_forward_pressed && forward_mag > self.speed {
//             camera.eye += forward_norm * self.speed;
//         }
//         if self.is_backward_pressed {
//             camera.eye -= forward_norm * self.speed;
//         }

//         let right = forward_norm.cross(camera.up);

//         // Redo radius calc in case the fowrard/backward is pressed.
//         let forward = camera.target - camera.eye;
//         let forward_mag = forward.magnitude();

//         if self.is_right_pressed {
//             // Rescale the distance between the target and eye so 
//             // that it doesn't change. The eye therefore still 
//             // lies on the circle made by the target and eye.
//             camera.eye = camera.target - (forward + right * self.speed).normalize() * forward_mag;
//         }
//         if self.is_left_pressed {
//             camera.eye = camera.target - (forward - right * self.speed).normalize() * forward_mag;
//         }
//     }
// }


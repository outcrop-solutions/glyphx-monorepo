mod assets;
mod camera;
mod data;
mod light;
mod model;
mod model_event;

use model::{
    filtering::Query,
    model_configuration::{ColorWheel, ModelConfiguration},
    pipeline::glyphs::glyph_uniform_data::{InterpolationType, Order},
    state::{CameraManager, DataManager, State},
};
use model_event::{JsSafeModelEvent, ModelEvent, ModelMoveDirection};
use pollster::FutureExt;
use serde_json::{from_str, json, Value};
use std::cell::RefCell;
use std::rc::Rc;
use winit::{
    application::ApplicationHandler,
    dpi::PhysicalSize,
    event::{DeviceEvent, DeviceId, ElementState, KeyEvent, WindowEvent},
    event_loop::{ActiveEventLoop, EventLoop, EventLoopProxy},
    keyboard::{Key, KeyCode, ModifiersKeyState, NamedKey, PhysicalKey},
    window::{Window, WindowId},
};

use crate::camera::camera_controller::MouseEvent;
cfg_if::cfg_if! {
    if #[cfg(target_arch="wasm32")] {
        use wasm_bindgen::prelude::*;

        #[wasm_bindgen]
        extern "C" {
            #[wasm_bindgen(js_namespace = console)]
            pub fn log(s: &str);
        }
    }
}

#[allow(dead_code)]
const WEB_ELEMENT_NAME: &str = "glyphx-cube-model";
static mut EVENT_LOOP_PROXY: Option<EventLoopProxy<ModelEvent>> = None;

struct Application {
    state: Option<State>,
    configuration: Rc<RefCell<ModelConfiguration>>,
    data_manager: Rc<RefCell<DataManager>>,
    camera_manager: Rc<RefCell<CameraManager>>,
    shift_pressed: bool,
    alt_pressed: bool,
    ctrl_pressed: bool,
    filter_on: bool,
    x_color_index: isize,
    y_color_index: isize,
    z_color_index: isize,
    min_color_index: isize,
    max_color_index: isize,
    background_color_index: isize,
    color_wheel: ColorWheel,
    height: u32,
    width: u32,
}

impl Application {
    pub fn new(
        configuration: Rc<RefCell<ModelConfiguration>>,
        data_manager: Rc<RefCell<DataManager>>,
        camera_manager: Rc<RefCell<CameraManager>>,
        height: u32,
        width: u32,
    ) -> Self {
        Application {
            state: None,
            configuration,
            data_manager,
            camera_manager,
            shift_pressed: false,
            alt_pressed: false,
            ctrl_pressed: false,
            filter_on: false,
            x_color_index: 0,
            y_color_index: 9,
            z_color_index: 17,
            min_color_index: 0,
            max_color_index: 17,
            background_color_index: 0,
            color_wheel: ColorWheel::new(),
            height,
            width,
        }
    }

    #[cfg(target_arch = "wasm32")]
    fn configure_canvas(&self, window: &Window) {
        // Winit prevents sizing with CSS, so we have to set
        // the size manually when on web.

        use winit::platform::web::WindowExtWebSys;
        web_sys::window()
            .and_then(|win| win.document())
            .and_then(|doc| {
                let dst = doc.get_element_by_id(WEB_ELEMENT_NAME)?;
                let canvas = web_sys::Element::from(window.canvas().unwrap());
                canvas.set_attribute("id", "cube_model").ok()?;
                dst.append_child(&canvas).ok()?;
                Some(())
            })
            .expect("Couldn't append canvas to document body.");
    }
}

impl ApplicationHandler<ModelEvent> for Application {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        let window = event_loop
            .create_window(Window::default_attributes().with_title("Hello!"))
            .unwrap();
        window.request_inner_size(PhysicalSize::new(self.width, self.height));

        #[cfg(target_arch = "wasm32")]
        {
            self.configure_canvas(&window);
            let state_future = State::new(
                window,
                self.configuration.clone(),
                self.data_manager.clone(),
                self.camera_manager.clone(),
            );
            let future = async move {
                let state = state_future.await;
                unsafe {
                    let event = ModelEvent::StateReady(state);
                    EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
                }
            };
            wasm_bindgen_futures::spawn_local(future);
        }

        #[cfg(not(target_arch = "wasm32"))]
        {
            self.state = Some(
                State::new(
                    window,
                    self.configuration.clone(),
                    self.data_manager.clone(),
                    self.camera_manager.clone(),
                )
                .block_on(),
            );
        }
    }

    fn window_event(
        &mut self,
        event_loop: &ActiveEventLoop,
        window_id: WindowId,
        event: WindowEvent,
    ) {
        //        eprintln!("Window Event: {:?}", event);
        if self.state.is_some() {
            let state = self.state.as_mut().unwrap();
            let mut redraw = true;
            if window_id == state.get_window_id() {
                match event {
                    WindowEvent::CursorMoved { position, .. } => {
                        state.update_cursor_position(position.clone());
                        redraw = false;
                    }
                    WindowEvent::CloseRequested
                    | WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                logical_key: Key::Named(NamedKey::Escape),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        event_loop.exit();
                    }

                    WindowEvent::ModifiersChanged(modifier_state) => {
                        let state = modifier_state.state();
                        self.shift_pressed = state.shift_key();
                        self.alt_pressed = state.alt_key();
                        self.ctrl_pressed = state.control_key();
                        redraw = false;
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyR),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        let modifier = if self.shift_pressed {
                            if self.alt_pressed {
                                0.99
                            } else {
                                0.9
                            }
                        } else {
                            if self.alt_pressed {
                                1.01
                            } else {
                                1.1
                            }
                        };

                        let mut cf = self.configuration.borrow_mut();
                        cf.grid_cylinder_radius = cf.grid_cylinder_radius * modifier;
                    }
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyA),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        if self.ctrl_pressed {
                            state.toggle_axis_visibility();
                        } else {
                            let modifier = if self.shift_pressed {
                                if self.alt_pressed {
                                    0.99
                                } else {
                                    0.9
                                }
                            } else {
                                if self.alt_pressed {
                                    1.01
                                } else {
                                    1.1
                                }
                            };

                            let mut cf = self.configuration.borrow_mut();
                            cf.grid_cylinder_length = cf.grid_cylinder_length * modifier;
                        }
                    }
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyC),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        if self.ctrl_pressed && !self.shift_pressed && !self.alt_pressed {
                            state.reset_camera();
                        } else if self.alt_pressed && self.ctrl_pressed && !self.shift_pressed {
                            state.run_compute_pipeline();
                        } else if !self.ctrl_pressed {
                            let modifier = if self.shift_pressed {
                                if self.alt_pressed {
                                    0.99
                                } else {
                                    0.9
                                }
                            } else {
                                if self.alt_pressed {
                                    1.01
                                } else {
                                    1.1
                                }
                            };

                            let mut cf = self.configuration.borrow_mut();
                            cf.grid_cone_length = cf.grid_cone_length * modifier;
                        }
                    }
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyK),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        let modifier = if self.shift_pressed {
                            if self.alt_pressed {
                                0.99
                            } else {
                                0.9
                            }
                        } else {
                            if self.alt_pressed {
                                1.01
                            } else {
                                1.1
                            }
                        };

                        let mut cf = self.configuration.borrow_mut();
                        cf.grid_cone_radius = cf.grid_cone_radius * modifier;
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyH),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        let modifier = if self.shift_pressed {
                            if self.alt_pressed {
                                0.99
                            } else {
                                0.9
                            }
                        } else {
                            if self.alt_pressed {
                                1.01
                            } else {
                                1.1
                            }
                        };

                        let mut cf = self.configuration.borrow_mut();
                        cf.z_height_ratio = cf.z_height_ratio * modifier;
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyO),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        let modifier = if self.shift_pressed {
                            if self.alt_pressed {
                                0.99
                            } else {
                                0.9
                            }
                        } else {
                            if self.alt_pressed {
                                1.01
                            } else {
                                1.1
                            }
                        };

                        let mut cf = self.configuration.borrow_mut();
                        cf.glyph_offset = cf.glyph_offset * modifier;
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyE),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        let modifier = if self.shift_pressed {
                            if self.alt_pressed {
                                0.99
                            } else {
                                0.9
                            }
                        } else {
                            if self.alt_pressed {
                                1.01
                            } else {
                                1.1
                            }
                        };

                        let mut cf = self.configuration.borrow_mut();
                        cf.min_glyph_height = cf.min_glyph_height * modifier;
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyF),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        if self.ctrl_pressed {
                            if self.filter_on {
                                state.update_model_filter(Query::default());
                            } else {
                                let json_value = json!({
                                "x": {
                                   "include" : {
                                      "sub_type": {
                                          "name": "Value",
                                          "type": "Number",
                                          "value": 5.0
                                      },
                                      "operator": {
                                          "name": "GreaterThan"
                                      }
                                   }}});
                                let query = Query::from_json_value(&json_value);
                                assert!(query.is_ok());
                                let query = query.unwrap();
                                state.update_model_filter(query);
                            }
                            self.filter_on = !self.filter_on;
                        } else {
                            let mut cf = self.configuration.borrow_mut();
                            cf.color_flip = !cf.color_flip;
                        }
                    }
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyS),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        if self.ctrl_pressed {
                            state.update_selected_glyphs(vec![1, 3, 5, 7, 9]);
                        } else {
                            let modifier = if self.shift_pressed {
                                if self.alt_pressed {
                                    0.99
                                } else {
                                    0.9
                                }
                            } else {
                                if self.alt_pressed {
                                    1.01
                                } else {
                                    1.1
                                }
                            };

                            let mut cf = self.configuration.borrow_mut();
                            cf.glyph_size = cf.glyph_size * modifier;
                        }
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyW),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        let mut cf = self.configuration.borrow_mut();
                        if self.shift_pressed {
                            cf.light_color = [255.0, 255.0, 255.0, 1.0];
                        } else {
                            cf.light_color = [255.0, 0.0, 0.0, 1.0];
                        }
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyL),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        let modifier = if self.shift_pressed {
                            if self.alt_pressed {
                                0.99
                            } else {
                                0.9
                            }
                        } else {
                            if self.alt_pressed {
                                1.01
                            } else {
                                1.1
                            }
                        };

                        let mut cf = self.configuration.borrow_mut();

                        cf.light_location = [
                            cf.light_location[0] * modifier,
                            cf.light_location[1] * modifier,
                            cf.light_location[2] * modifier,
                        ];
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyI),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        let modifier = if self.shift_pressed {
                            if self.alt_pressed {
                                0.99
                            } else {
                                0.9
                            }
                        } else {
                            if self.alt_pressed {
                                1.01
                            } else {
                                1.1
                            }
                        };

                        let mut cf = self.configuration.borrow_mut();
                        cf.light_intensity = cf.light_intensity * modifier;
                    }
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyX),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        let mut cf = self.configuration.borrow_mut();
                        let mut update_config = false;
                        if self.alt_pressed && !self.ctrl_pressed && !self.shift_pressed {
                            {
                                cf.x_interpolation =
                                    if cf.x_interpolation == InterpolationType::Linear {
                                        InterpolationType::Log
                                    } else {
                                        InterpolationType::Linear
                                    };
                            }
                            update_config = true;
                        } else if self.alt_pressed && self.ctrl_pressed && !self.shift_pressed {
                            {
                                cf.x_order = if cf.x_order == Order::Ascending {
                                    Order::Descending
                                } else {
                                    Order::Ascending
                                };
                            }
                            update_config = true;
                        } else if self.ctrl_pressed && !self.shift_pressed {
                            state.move_camera("x_axis", 0.0);
                        } else if !self.ctrl_pressed {
                            if self.shift_pressed {
                                self.x_color_index -= 1;
                            } else {
                                self.x_color_index += 1;
                            }
                            let x_color = self.color_wheel.get_color(self.x_color_index);
                            cf.x_axis_color = x_color;
                        }
                        drop(cf);
                        if update_config {
                            state.update_config();
                        }
                    }
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyY),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        let mut update_config = false;
                        let mut cf = self.configuration.borrow_mut();

                        if self.alt_pressed && !self.ctrl_pressed && !self.shift_pressed {
                            {
                                cf.y_interpolation =
                                    if cf.y_interpolation == InterpolationType::Linear {
                                        InterpolationType::Log
                                    } else {
                                        InterpolationType::Linear
                                    };
                            }
                            update_config = true;
                        } else if self.alt_pressed && self.ctrl_pressed && !self.shift_pressed {
                            {
                                cf.y_order = if cf.y_order == Order::Ascending {
                                    Order::Descending
                                } else {
                                    Order::Ascending
                                };
                            }

                            update_config = true;
                        } else if self.ctrl_pressed && !self.shift_pressed && !self.alt_pressed {
                            state.move_camera("y_axis", 0.0);
                        } else if !self.ctrl_pressed {
                            if self.shift_pressed {
                                self.y_color_index -= 1;
                            } else {
                                self.y_color_index += 1;
                            }
                            let y_color = self.color_wheel.get_color(self.y_color_index);
                            cf.y_axis_color = y_color;
                        }
                        drop(cf);
                        if update_config {
                            state.update_config();
                        }
                    }
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyZ),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        let mut update_config = false;
                        let mut cf = self.configuration.borrow_mut();

                        if self.alt_pressed && !self.ctrl_pressed && !self.shift_pressed {
                            {
                                cf.z_interpolation =
                                    if cf.z_interpolation == InterpolationType::Linear {
                                        InterpolationType::Log
                                    } else {
                                        InterpolationType::Linear
                                    };
                            }
                            update_config = true;
                        } else if self.alt_pressed && self.ctrl_pressed && !self.shift_pressed {
                            {
                                cf.z_order = if cf.z_order == Order::Ascending {
                                    Order::Descending
                                } else {
                                    Order::Ascending
                                };
                            }
                            update_config = true;
                        } else if self.ctrl_pressed && !self.shift_pressed && !self.alt_pressed {
                            state.move_camera("z_axis", 0.0);
                        } else if !self.ctrl_pressed {
                            if self.shift_pressed {
                                self.z_color_index -= 1;
                            } else {
                                self.z_color_index += 1;
                            }
                            let z_color = self.color_wheel.get_color(self.z_color_index);
                            cf.z_axis_color = z_color;
                        }
                        drop(cf);
                        if update_config {
                            state.update_config();
                        }
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyM),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        if self.shift_pressed {
                            self.max_color_index -= 1;
                        } else {
                            self.max_color_index += 1;
                        }
                        let color = self.color_wheel.get_color(self.max_color_index);
                        let mut cf = self.configuration.borrow_mut();
                        cf.max_color = color;
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyN),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        if self.shift_pressed {
                            self.min_color_index -= 1;
                        } else {
                            self.min_color_index += 1;
                        }
                        let color = self.color_wheel.get_color(self.min_color_index);
                        let mut cf = self.configuration.borrow_mut();
                        cf.min_color = color;
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyB),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        if self.shift_pressed {
                            self.background_color_index -= 1;
                        } else {
                            self.background_color_index += 1;
                        }
                        let color = self.color_wheel.get_color(self.background_color_index);
                        let mut cf = self.configuration.borrow_mut();
                        cf.background_color = color;
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyG),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        let modifier = if self.shift_pressed {
                            if self.alt_pressed {
                                0.99
                            } else {
                                0.9
                            }
                        } else {
                            if self.alt_pressed {
                                1.01
                            } else {
                                1.1
                            }
                        };
                        let mut cf = self.configuration.borrow_mut();
                        cf.model_origin = [
                            cf.model_origin[0] * modifier,
                            cf.model_origin[1] * modifier,
                            cf.model_origin[2] * modifier,
                        ];
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::ArrowUp),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => unsafe {
                        let event = ModelEvent::ModelMove(ModelMoveDirection::Up(1.0));
                        EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
                    },

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::ArrowDown),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => unsafe {
                        let event = ModelEvent::ModelMove(ModelMoveDirection::Down(1.0));
                        EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
                    },

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::ArrowLeft),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => unsafe {
                        let event = ModelEvent::ModelMove(ModelMoveDirection::Left(1.0));
                        EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
                    },

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::ArrowRight),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => unsafe {
                        let event = ModelEvent::ModelMove(ModelMoveDirection::Right(1.0));
                        EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
                    },
                    WindowEvent::Resized(physical_size) => {
                        state.resize(physical_size);
                    }

                    WindowEvent::ScaleFactorChanged { .. } => {
                        // new_inner_size is &&mut so we have to dereference it twice
                        let size = state.size();
                        state.resize(size);
                    }

                    WindowEvent::RedrawRequested => {
                        state.update_from_client();
                        match state.render() {
                            Ok(_) => {}
                            Err(wgpu::SurfaceError::Lost) => {
                                let size = state.size().clone();
                                state.resize(size)
                            }

                            // The system is out of memory, we should probably quit
                            Err(wgpu::SurfaceError::OutOfMemory) => event_loop.exit(),
                            // All other errors (Outdated, Timeout) should be resolved by the next frame
                            Err(e) => eprintln!("{:?}", e),
                        }
                    }
                    WindowEvent::MouseInput {
                        state: element_state,
                        button,
                        ..
                    } => {
                        let new_event = DeviceEvent::Button {
                            state: element_state,
                            button: match button {
                                winit::event::MouseButton::Left => 1,
                                _ => 0,
                            },
                        };
                        if state.input(&new_event, self.shift_pressed) {
                            match state.render() {
                                Ok(_) => {}
                                // Reconfigure the surface if lost
                                Err(wgpu::SurfaceError::Lost) => {
                                    let size = state.size().clone();
                                    state.resize(size)
                                }
                                // The system is out of memory, we should probably quit
                                Err(wgpu::SurfaceError::OutOfMemory) => event_loop.exit(),
                                // All other errors (Outdated, Timeout) should be resolved by the next frame
                                Err(e) => eprintln!("{:?}", e),
                            }
                        }
                        redraw = false;
                    }
                    WindowEvent::MouseWheel { delta, .. } => {
                        let new_event = DeviceEvent::MouseWheel { delta };
                        if state.input(&new_event, self.shift_pressed) {
                            match state.render() {
                                Ok(_) => {}
                                // Reconfigure the surface if lost
                                Err(wgpu::SurfaceError::Lost) => {
                                    let size = state.size().clone();
                                    state.resize(size)
                                }
                                // The system is out of memory, we should probably quit
                                Err(wgpu::SurfaceError::OutOfMemory) => event_loop.exit(),
                                // All other errors (Outdated, Timeout) should be resolved by the next frame
                                Err(e) => eprintln!("{:?}", e),
                            }
                        }
                        redraw = false;
                    }
                    _ => {
                        redraw = false;
                    }
                }
            }
            if redraw {
                unsafe {
                    let event = ModelEvent::Redraw;
                    EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
                }
            }
        }
    }

    fn device_event(
        &mut self,
        event_loop: &ActiveEventLoop,
        _device_id: DeviceId,
        event: DeviceEvent,
    ) {
        //eprintln!("Device Event: {:?}", event);
        if self.state.is_some() {
            let state = self.state.as_mut().unwrap();
            if state.input(&event, self.shift_pressed) {
                match state.render() {
                    Ok(_) => {}
                    // Reconfigure the surface if lost
                    Err(wgpu::SurfaceError::Lost) => {
                        let size = state.size().clone();
                        state.resize(size)
                    }
                    // The system is out of memory, we should probably quit
                    Err(wgpu::SurfaceError::OutOfMemory) => event_loop.exit(),
                    // All other errors (Outdated, Timeout) should be resolved by the next frame
                    Err(e) => eprintln!("{:?}", e),
                }
            }
        }
    }

    fn user_event(&mut self, event_loop: &ActiveEventLoop, event: ModelEvent) {
        let state = self.state.as_mut().unwrap();
        match event {
            ModelEvent::StateReady(new_state) => {
                self.state = Some(new_state);
            }
            ModelEvent::Redraw => {
                state.update_config();
                match state.render() {
                    Ok(_) => {}
                    // Reconfigure the surface if lost
                    Err(wgpu::SurfaceError::Lost) => {
                        let size = state.size().clone();
                        state.resize(size)
                    }
                    // The system is out of memory, we should probably quit
                    Err(wgpu::SurfaceError::OutOfMemory) => event_loop.exit(),
                    // All other errors (Outdated, Timeout) should be resolved by the next frame
                    Err(e) => eprintln!("{:?}", e),
                }
            }
            ModelEvent::ToggleAxisLines => {
                state.toggle_axis_visibility();
            }
            ModelEvent::ModelMove(ModelMoveDirection::Pitch(amount)) => {
                state.move_camera("pitch", amount);
            }
            ModelEvent::ModelMove(ModelMoveDirection::Yaw(amount)) => {
                state.move_camera("yaw", amount);
            }
            ModelEvent::ModelMove(ModelMoveDirection::Distance(amount)) => {
                state.move_camera("distance", amount);
            }
            ModelEvent::ModelMove(ModelMoveDirection::Up(amount)) => {
                state.move_camera("up", amount);
            }
            ModelEvent::ModelMove(ModelMoveDirection::Down(amount)) => {
                state.move_camera("down", amount);
            }
            ModelEvent::ModelMove(ModelMoveDirection::Left(amount)) => {
                state.move_camera("left", amount);
            }
            ModelEvent::ModelMove(ModelMoveDirection::Right(amount)) => {
                state.move_camera("right", amount);
            }
            ModelEvent::ModelMove(ModelMoveDirection::X) => {
                state.move_camera("x_axis", 0.0);
            }
            ModelEvent::ModelMove(ModelMoveDirection::Z) => {
                state.move_camera("z_axis", 0.0);
            }
            ModelEvent::ModelMove(ModelMoveDirection::Y) => {
                state.move_camera("y_axis", 0.0);
            }
            ModelEvent::ModelMove(ModelMoveDirection::Reset) => {
                state.reset_camera();
            }
            ModelEvent::SelectGlyph {
                x_pos,
                y_pos,
                multi_select,
            } => {
                let res = state.hit_detection(x_pos as u32, y_pos as u32, multi_select);
                let values = res.iter().map(|v| v.to_json()).collect::<Vec<Value>>();
                emit_event(&ModelEvent::SelectedGlyphs(values));
            }

            ModelEvent::SelectGlyphs(selected_glyphs) => {
                let glyphs = state.update_selected_glyphs(selected_glyphs);
                let values = glyphs.iter().map(|v| v.to_json()).collect::<Vec<Value>>();
                emit_event(&ModelEvent::SelectedGlyphs(values));

                unsafe {
                    let event = ModelEvent::Redraw;
                    EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
                }
            }

            ModelEvent::UpdateModelFilter(model_filter) => {
                state.update_model_filter(model_filter);
                state.update_config();
                //Once our state is updated we need to force a redraw
                unsafe {
                    let event = ModelEvent::Redraw;
                    EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
                }
            }

            _ => {}
        }
    }
}

#[allow(unused_variables)]
fn emit_event(event: &ModelEvent) {
    cfg_if::cfg_if! {
        if #[cfg(target_arch="wasm32")] {
            let event = JsSafeModelEvent::from(event);
            let window = web_sys::window().unwrap();
            let js_value = serde_wasm_bindgen::to_value(&event).unwrap();
            let event = web_sys::CustomEvent::new_with_event_init_dict(
                "model-event",
                web_sys::CustomEventInit::new().detail(&js_value)
            ).unwrap();
            window
                .dispatch_event(&event)
                .expect("Unable to dispatch custom event");
        }
    }
}
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
pub struct ModelRunner {
    configuration: Rc<RefCell<ModelConfiguration>>,
    data_manager: Rc<RefCell<DataManager>>,
    camera_manager: Rc<RefCell<CameraManager>>,
    color_wheel: ColorWheel,
    default_x: u8,
    default_y: u8,
    default_z: u8,
    default_min: u8,
    default_max: u8,
    default_background: u8,
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl ModelRunner {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    pub fn new() -> Self {
        ModelRunner {
            configuration: Rc::new(RefCell::new(ModelConfiguration::default())),
            data_manager: Rc::new(RefCell::new(DataManager::new())),
            camera_manager: Rc::new(RefCell::new(CameraManager::new())),
            color_wheel: ColorWheel::new(),
            default_x: 0,
            default_y: 9,
            default_z: 17,
            default_min: 0,
            default_max: 17,
            default_background: 0,
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn update_model_filter(&self, filter: &str) -> Result<(), String> {
        let json_value = from_str::<Value>(filter);
        if json_value.is_err() {
            let err = json_value.err().unwrap();
            return Err(format!(
                "An error ocurred while parsing the json: {}",
                err.to_string()
            ));
        }
        let mut json_value = json_value.unwrap();
        //:NOTE You may have seen this in other places in this model, but in WGPU world,
        //The Y and Z axis are flipped.  I tried to not flip them, but things got really confused
        // really fast.  So, in the model, the Y and Z axis are flipped.  This keeps all of the
        // stuff in web land in sync with the way that the application definws the axis.
        // because of this, we will need to flip our filters so that they are correct in the
        // model.
        let true_z: Option<Value> = json_value.get("y").cloned();
        let true_y: Option<Value> = json_value.get("z").cloned();
        if true_z.is_some() {
            json_value["z"] = true_z.unwrap();
        }
        if true_y.is_some() {
            json_value["y"] = true_y.unwrap();
        }
        let filter_query = Query::from_json_value(&json_value);
        if filter_query.is_err() {
            let error = filter_query.err().unwrap().to_string();
            return Err(error);
        }
        let filter_query = filter_query.unwrap();
        unsafe {
            let event = ModelEvent::UpdateModelFilter(filter_query);
            emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
            }
        }
        Ok(())
    }

    ///Will force a redraw of the model, if the model is running.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn update_configuration(&self, config: &str, is_running: bool) -> Result<(), String> {
        let value: Value = from_str(config).unwrap();
        let mut configuration = self.configuration.borrow_mut();
        let result = configuration.partial_update(&value);
        if result.is_err() {
            return Err(serde_json::to_string(&result.unwrap_err()).unwrap());
        }
        unsafe {
            if is_running {
                let event = ModelEvent::Redraw;
                emit_event(&event);
                if EVENT_LOOP_PROXY.is_some() {
                    EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
                }
            }
        }
        Ok(())
    }
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn toggle_axis_lines(&self) {
        unsafe {
            let event = ModelEvent::ToggleAxisLines;
            emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
            }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn select_glyph(&self, x_pos: u32, y_pos: u32, multi_select: bool) {
        unsafe {
            let event = ModelEvent::SelectGlyph {
                x_pos: x_pos as f32,
                y_pos: y_pos as f32,
                multi_select,
            };
            emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
            }
        }
    }
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_yaw(&self, amount: f32) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Yaw(amount));
            emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
            }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn raise_model(&self, amount: f32) {
        unsafe {
            let event = if amount > 0.0 {
                ModelEvent::ModelMove(ModelMoveDirection::Up(amount))
            } else {
                ModelEvent::ModelMove(ModelMoveDirection::Down(amount * -1.0))
            };
            emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
            }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn reset_camera(&self) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Reset);
            emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
            }
        }
    }

    ///These are user facing axis not internal
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn focus_on_x_axis(&self) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::X);
            emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
            }
        }
    }

    ///These are user facing axis not internal
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn focus_on_y_axis(&self) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Y);
            emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
            }
        }
    }
    ///These are user facing axis not internal
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn focus_on_z_axis(&self) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Z);
            emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
            }
        }
    }
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn shift_model(&self, amount: f32) {
        unsafe {
            let event = if amount > 0.0 {
                ModelEvent::ModelMove(ModelMoveDirection::Right(amount))
            } else {
                ModelEvent::ModelMove(ModelMoveDirection::Left(amount * -1.0))
            };
            emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
            }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_pitch(&self, amount: f32) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Pitch(amount));
            emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
            }
        }
    }
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_distance(&self, amount: f32) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Distance(amount));
            emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
            }
        }
    }

    ///Adding a vector will update internal state but it
    ///will not emit any redraw events.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_vector(&self, axis: &str, data: Vec<u8>) -> Result<(), String> {
        let mut dm = self.data_manager.borrow_mut();
        let result = if axis == "x" {
            dm.add_x_vector(data)
        } else {
            dm.add_z_vector(data)
        };
        match result {
            Ok(_) => Ok(()),
            Err(e) => Err(serde_json::to_string(&e).unwrap()),
        }
    }
    //Adding statistics will update internal state but it
    //will not emit any redraw events.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_statistics(&self, data: Vec<u8>) -> Result<String, String> {
        let mut dm = self.data_manager.borrow_mut();
        let result = dm.add_stats(data);
        match result {
            Ok(stats) => Ok(format!("{:?}", stats)),
            Err(e) => Err(serde_json::to_string(&e).unwrap()),
        }
    }
    //Get statistics will return the raw statistics(vector values) for the given axis.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn get_statistics(&self, axis: &str) -> Result<String, String> {
        if ["x", "y", "x"].contains(&axis) {
            return Err("Invalid axis.  Must be x, y, or z".to_string());
        }
        //NOTE: You should have seen this before.  Y and Z are flipped in the model, so we need to
        //flip them back to return the correct values to the client.
        let axis = match axis {
            "x" => "x",
            "y" => "z",
            "z" => "y",
            _ => "x",
        };
        let dm = self.data_manager.borrow();

        let result = dm.get_stats(axis);
        match result {
            Ok(stats) => Ok(serde_json::to_string(&stats).unwrap()),
            Err(e) => Err(serde_json::to_string(&e).unwrap()),
        }
    }

    ///Adding a glyph will update internal state but it
    ///will not emit any redraw events.
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_glyph(&self, data: Vec<u8>) -> Result<String, String> {
        let mut dm = self.data_manager.borrow_mut();
        let result = dm.add_glyph(data);
        match result {
            Ok(result) => Ok(serde_json::to_string(&result).unwrap()),
            Err(e) => Err(serde_json::to_string(&e).unwrap()),
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn get_glyph_count(&self) -> usize {
        let dm = self.data_manager.borrow();
        dm.get_glyph_len()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn get_stats_count(&self) -> usize {
        let dm = self.data_manager.borrow();
        dm.get_stats_len()
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn get_x_vector_count(&self) -> usize {
        let dm = self.data_manager.borrow();
        dm.get_vector_len("x")
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn get_y_vector_count(&self) -> usize {
        let dm = self.data_manager.borrow();
        dm.get_vector_len("z")
    }
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn get_camera_data(&self) -> String {
        let cm = self.camera_manager.as_ref().borrow();
        cm.get_camera_data()
    }

    //apspect ratio is canvas width / canvas height
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn set_camera_data(&self, camera_data: String, aspect_ratio: f32) {
        let cm = &mut self.camera_manager.as_ref().borrow_mut();
        cm.set_camera_data(camera_data, aspect_ratio);
        unsafe {
            let event = ModelEvent::Redraw;
            EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn set_selected_glyphs(&self, selected_glyphs: Vec<u32>) {
        unsafe {
            let event = ModelEvent::SelectGlyphs(selected_glyphs);
            EVENT_LOOP_PROXY.as_ref().unwrap().send_event(event);
        }
    }

    fn init_logger(&self) {
        cfg_if::cfg_if! {
        if #[cfg(target_arch = "wasm32")] {
              std::panic::set_hook(Box::new(console_error_panic_hook::hook));
              console_log::init_with_level(log::Level::Warn).expect("Couldn't initialize logger");

          } else {
              env_logger::init();
          }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub async fn run(&self, width: u32, height: u32) {
        self.init_logger();

        let el = EventLoop::<ModelEvent>::with_user_event().build().unwrap();

        //        let this_window_id = window.id();
        //self.is_running = true;

        // let config = self.configuration.clone();
        // let cm = self.camera_manager.clone();

        let mut application = Application::new(
            self.configuration.clone(),
            self.data_manager.clone(),
            self.camera_manager.clone(),
            height,
            width,
        );
        // let mut state = State::new(
        //     window,
        //     self.configuration.clone(),
        //     self.data_manager.clone(),
        //     cm,
        // )
        // .await;
        // let mut x_color_index = self.default_x as isize;
        // let mut y_color_index = self.default_y as isize;
        // let mut z_color_index = self.default_z as isize;
        // let mut min_color_index = self.default_min as isize;
        // let mut max_color_index = self.default_max as isize;
        // let mut background_color_index = self.default_background as isize;

        // let color_wheel = self.color_wheel.clone();
        unsafe {
            EVENT_LOOP_PROXY = Some(el.create_proxy());
        }

        el.run_app(&mut application);
        //el.run(move |event, _, control_flow| {
        //});
    }
}

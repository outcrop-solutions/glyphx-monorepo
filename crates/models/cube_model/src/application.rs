use super::{
    emit_event,
    model::{
        filtering::Query,
        model_configuration::{ColorWheel, ModelConfiguration},
        pipeline::glyphs::glyph_uniform_data::{InterpolationType, Order},
        state::{CameraManager, DataManager, State},
    },
    model_event::{ModelEvent, ModelMoveDirection},
    send_event,
};

use pollster::FutureExt;
use serde_json::{json, Value};
use std::cell::RefCell;
use std::rc::Rc;
use winit::{
    application::ApplicationHandler,
    dpi::PhysicalSize,
    event::{DeviceEvent, DeviceId, ElementState, KeyEvent, WindowEvent},
    event_loop::ActiveEventLoop,
    keyboard::{Key, KeyCode, NamedKey, PhysicalKey},
    window::{Window, WindowId},
};

pub struct Application {
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
        use super::WEB_ELEMENT_NAME;
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
            .create_window(Window::default_attributes().with_title("GlyphX"))
            .unwrap();
        let _ = window.request_inner_size(PhysicalSize::new(self.width, self.height));

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
                let event = ModelEvent::StateReady(state);
                send_event(event);
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
        eprintln!("Window Event: {:?}", event);
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
                        eprintln!("{}", cf.light_intensity);
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
                    } => {
                        if self.alt_pressed || self.ctrl_pressed {
                            let mut cf = self.configuration.borrow_mut();
                            let modifier = if self.shift_pressed { 1.0 } else { 10.0 };
                            if self.alt_pressed {
                                cf.light_location[1] += modifier;
                            } else {
                                cf.light_location[2] += modifier;
                            }
                            eprintln!("Light Location: {:?}", cf.light_location);
                        } else {
                            let event = ModelEvent::ModelMove(ModelMoveDirection::Up(1.0));
                            send_event(event);
                        }
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::ArrowDown),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        if self.alt_pressed || self.ctrl_pressed {
                            let mut cf = self.configuration.borrow_mut();
                            let modifier = if self.shift_pressed { 1.0 } else { 10.0 };
                            if self.alt_pressed {
                                cf.light_location[1] -= modifier;
                            } else {
                                cf.light_location[2] -= modifier;
                            }
                            eprintln!("Light Location: {:?}", cf.light_location);
                        } else {
                            let event = ModelEvent::ModelMove(ModelMoveDirection::Down(1.0));
                            send_event(event);
                        }
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::ArrowLeft),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        if self.alt_pressed || self.ctrl_pressed {
                            let mut cf = self.configuration.borrow_mut();
                            let modifier = if self.shift_pressed { 1.0 } else { 10.0 };
                            if self.alt_pressed {
                                cf.light_location[0] -= modifier;
                            } else {
                                cf.light_location[0] -= modifier;
                            }
                            eprintln!("Light Location: {:?}", cf.light_location);
                        } else {
                            let event = ModelEvent::ModelMove(ModelMoveDirection::Left(1.0));
                            send_event(event);
                        }
                    }

                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::ArrowRight),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } => {
                        if self.alt_pressed || self.ctrl_pressed {
                            let mut cf = self.configuration.borrow_mut();
                            let modifier = if self.shift_pressed { 1.0 } else { 10.0 };
                            if self.alt_pressed {
                                cf.light_location[0] += modifier;
                            } else {
                                cf.light_location[0] += modifier;
                            }
                            eprintln!("Light Location: {:?}", cf.light_location);
                        } else {
                            let event = ModelEvent::ModelMove(ModelMoveDirection::Right(1.0));
                            send_event(event);
                        }
                    }
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
                        redraw = false;
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
                {
                    let event = ModelEvent::Redraw;
                    send_event(event);
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
        eprintln!("Device Event: {:?}", event);
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
        eprintln!("User Event: {:?}", event);
        if self.state.is_some() {
            let state = self.state.as_mut().unwrap();
            match event {
                ModelEvent::Redraw => {
                    //state.update_config();
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

                    {
                        let event = ModelEvent::Redraw;
                        send_event(event);
                    }
                }

                ModelEvent::UpdateModelFilter(model_filter) => {
                    state.update_model_filter(model_filter);
                    state.update_config();
                    //Once our state is updated we need to force a redraw
                    {
                        let event = ModelEvent::Redraw;
                        send_event(event);
                    }
                }
                ModelEvent::GlyphsUpdated(glyphs) => {
                    let dm = &mut self.data_manager.borrow_mut();
                    dm.clear_glyphs();
                    for glyph in glyphs {
                        dm.add_ranked_glyph(glyph);
                    }
                    send_event(ModelEvent::Redraw);
                }

                _ => {}
            }
        } else {
            match event {
                ModelEvent::StateReady(new_state) => {
                    self.state = Some(new_state);
                }
                _ => {}
            }
        }
    }
}

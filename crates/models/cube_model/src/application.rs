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
    window_sized: bool,
    glyphs_updated: bool,
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
            window_sized: false,
            glyphs_updated: false,
        }
    }

    #[cfg(target_arch = "wasm32")]
    fn configure_canvas(&self, window: &Window) {
        // Winit prevents sizing with CSS, so we have to set
        // the size manually when on web.
        let _ = window.request_inner_size(winit::dpi::PhysicalSize::new(self.width, self.height));
        log::info!("Configuring canvas for web with a window of size: {:?}.", window.inner_size());
        use winit::platform::web::WindowExtWebSys;
        log::info!("Window Canvas: {:?}", window.canvas());
        use super::WEB_ELEMENT_NAME;
      //  use winit::platform::web::WindowExtWebSys;
        web_sys::window()
            .and_then(|win| win.document())
           .and_then(|doc| {
                let dst = doc.get_element_by_id(WEB_ELEMENT_NAME)?;
                let canvas = web_sys::Element::from(window.canvas().unwrap());
         
                canvas.set_attribute("id", "cube_model").ok()?;
                canvas.set_attribute("width", &self.width.to_string()).ok()?;
                canvas.set_attribute("height", &self.height.to_string()).ok()?;
                dst.append_child(&canvas).ok()?;
                Some(())
            })
            .expect("Couldn't append canvas to document body.");
    }
}

impl ApplicationHandler<ModelEvent> for Application {
    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        let l_s = winit::dpi::PhysicalSize::new(self.width, self.height);
        log::info!("Resumed with a size of {:?}", l_s);
        let window = event_loop
            .create_window(
                Window::default_attributes()
                    .with_title("GlyphX")
                    .with_inner_size(l_s)
                    .with_resizable(true),
            )
            .unwrap();
        log::info!("The window has been created with a size of {:?} and a scale factor of {:?}", window.inner_size(), window.scale_factor());
        #[cfg(target_arch = "wasm32")]
        {
            self.configure_canvas(&window);
            let state_future = State::new(
                window,
                self.configuration.clone(),
                self.data_manager.clone(),
                self.camera_manager.clone(),
                self.width,
                self.height,
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
                    self.width,
                    self.height,
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
        if self.state.is_some() && self.glyphs_updated {
            let state = self.state.as_mut().unwrap();
            let mut redraw = true;
            if window_id == state.get_window_id() {
                match event {
                    WindowEvent::CursorMoved { position, .. } => {
                        state.update_cursor_position(position.clone());
                        redraw = false;
                    }
                    WindowEvent::CloseRequested => {
                        event_loop.exit();
                    }

                    WindowEvent::ModifiersChanged(modifier_state) => {
                        let state = modifier_state.state();
                        self.shift_pressed = state.shift_key();
                        self.alt_pressed = state.alt_key();
                        self.ctrl_pressed = state.control_key();
                        redraw = false;
                    }

                    //KeyCode::KeyR
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyR),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    }  //Reset Data Shift + R
                    if self.shift_pressed  => {
                            let event = ModelEvent::UpdateModelFilter(Query::default());
                            send_event(event);
                            redraw = false;
                    },
                    
                    //KeyCode::KeyA
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyA),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    }  //Reset Data Shift + A 
                    if self.shift_pressed  => {
                            send_event(ModelEvent::ToggleAxisLines);
                            redraw = false;
                    },

                    //KeyCode::KeyH 
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyH),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    } //Reset Camera (Go Home) Shift + H
                    if self.shift_pressed  => {
                            send_event(ModelEvent::ModelMove(ModelMoveDirection::Reset));
                            redraw = false;
                    },

                    //KeyCode::KeyS
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyS),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    }  //Take a ScreenShot Shift + S 
                       if self.shift_pressed => {
                            let event = ModelEvent::TakeScreenshot;
                            send_event(event);
                            redraw = false;
                    },

                    //KeyCode::KeyY
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyY),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    }  //Focus to Y Axis Shift + Y
                       if self.shift_pressed => {
                            send_event(ModelEvent::ModelMove(ModelMoveDirection::Y));
                            redraw = false;
                    },

                    //KeyCode::KeyX
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyX),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    }  //Focus to X Axis Shift + X 
                       if self.shift_pressed => {
                            send_event(ModelEvent::ModelMove(ModelMoveDirection::X));
                            redraw = false;
                    },
                    
                    //KeyCode::KeyT
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::KeyT),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..
                    }  //Focus to Z Axis (Top) Shift + T 
                       if self.shift_pressed => {
                            send_event(ModelEvent::ModelMove(ModelMoveDirection::Z));
                            redraw = false;
                    },

                    //KeyCode::KeyArrowUp
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::ArrowUp),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..

                    } //Move Model Up  Shift + ArrowUp
                       if self.shift_pressed => {
                            send_event(ModelEvent::ModelMove(ModelMoveDirection::Up(1.0)));
                            redraw = false;
                    }

                    //KeyCode::KeyArrowDown
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::ArrowDown),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..

                    } //Move Model Down  Shift + ArrowDown
                       if self.shift_pressed => {
                            send_event(ModelEvent::ModelMove(ModelMoveDirection::Down(1.0)));
                            redraw = false;
                    }

                    //KeyCode::KeyArrowLeft
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::ArrowLeft),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..

                    } //Move Model Left  Shift + ArrowLeft
                       if self.shift_pressed => {
                            send_event(ModelEvent::ModelMove(ModelMoveDirection::Left(1.0)));
                            redraw = false;
                    }
                       
                    //KeyCode::KeyArrowRight
                    WindowEvent::KeyboardInput {
                        event:
                            KeyEvent {
                                physical_key: PhysicalKey::Code(KeyCode::ArrowRight),
                                state: ElementState::Pressed,
                                ..
                            },
                        ..

                    } //Move Model Right  Shift + ArrowRight
                       if self.shift_pressed => {
                            send_event(ModelEvent::ModelMove(ModelMoveDirection::Right(1.0)));
                            redraw = false;
                    }

                    WindowEvent::Resized(physical_size) => {
                        let new_size = PhysicalSize::new(physical_size.width, physical_size.height);
                        state.resize(physical_size);
                        log::info!("Resized to after state {:?}", physical_size);
                        redraw = true;
                    }

                    WindowEvent::ScaleFactorChanged { .. } => {
                        // new_inner_size is &&mut so we have to dereference it twice
                        let size = state.size();
                        //state.resize(size);
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
                                    //state.resize(size)
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
        } else {
            match event {
                WindowEvent::Resized(physical_size) => {
                    log::info!("Resized to before state {:?}", physical_size);
                }
                _ => {}
            }
        }
    }

    fn device_event(
        &mut self,
        event_loop: &ActiveEventLoop,
        _device_id: DeviceId,
        event: DeviceEvent,
    ) {
        if self.state.is_some() {
            let state = self.state.as_mut().unwrap();
            if state.input(&event, self.shift_pressed) {
                match state.render() {
                    Ok(_) => {}
                    // Reconfigure the surface if lost
                    Err(wgpu::SurfaceError::Lost) => {
                        let size = state.size().clone();
                        //state.resize(size)
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
        //eprintln!("User Event: {:?}", event);
        let mut redraw = true;
        if self.state.is_some() {
            let state = self.state.as_mut().unwrap();
            match event {
                ModelEvent::Redraw => {
                    //state.update_config();
                    redraw = false;
                    let result = state.render();
                    log::info!("Redraw result: {:?}", result);
                    match result {
                        Ok(_) => {}
                        // Reconfigure the surface if lost
                        Err(wgpu::SurfaceError::Lost) => {
                            let size = state.size().clone();
                            //state.resize(size)
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
                    redraw = false;
                    state.hit_detection(x_pos as u32, y_pos as u32, multi_select);
                }
                ModelEvent::HitDetection(hit) => {
                    log::info!("Hit: {:?}", hit);
                    let res = state.process_hit(hit);
                    let values = res.iter().map(|v| v.to_json()).collect::<Vec<Value>>();
                    redraw = false;
                    emit_event(&ModelEvent::SelectedGlyphs(values));
                }
                ModelEvent::SelectGlyphs(selected_glyphs) => {
                    redraw = false;
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
                        let _ = dm.add_ranked_glyph(glyph);
                    }
                    self.glyphs_updated = true;
                }

                _ => {}
            }
            if redraw {
                send_event(ModelEvent::Redraw);
            }
        } else {
            match event {
                ModelEvent::StateReady(mut new_state) => {
                    {
                        new_state.resize(new_state.get_windows_size().0);
                        self.state = Some(new_state);
                    }
                    send_event(ModelEvent::Redraw);
                }

                _ => {}
            }
        }
    }
}

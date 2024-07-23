mod assets;
mod camera;
mod data;
mod light;
mod model;
mod model_event;

use model::{
    model_configuration::{ColorWheel, ModelConfiguration},
    pipeline::glyphs::glyph_uniform_data::{InterpolationType, Order},
    state::{CameraManager, DataManager, State},
};
use model_event::{ModelEvent, ModelMoveDirection};
use serde_json::{from_str, Value};
use std::cell::RefCell;
use std::rc::Rc;
use winit::event::*;
use winit::event_loop::{ControlFlow, EventLoopBuilder, EventLoopProxy};
use winit::window::WindowBuilder;
cfg_if::cfg_if! {
    if #[cfg(target_arch="wasm32")] {
        use wasm_bindgen::prelude::*;
        use winit::window::{Window, WindowId};

        #[wasm_bindgen]
        extern "C" {
            #[wasm_bindgen(js_namespace = console)]
            pub fn log(s: &str);
        }
    }
}

const WEB_ELEMENT_NAME: &str = "glyphx-cube-model";
static mut EVENT_LOOP_PROXY: Option<EventLoopProxy<ModelEvent>> = None;

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
pub struct ModelRunner {
    configuration: Rc<RefCell<ModelConfiguration>>,
    data_manager: Rc<RefCell<DataManager>>,
    camera_manager: Rc<RefCell<CameraManager>>,
    is_running: bool,
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
            is_running: false,
            color_wheel: ColorWheel::new(),
            default_x: 0,
            default_y: 9,
            default_z: 17,
            default_min: 0,
            default_max: 17,
            default_background: 0,
        }
    }

    fn emit_event(&self, event: &ModelEvent) {
        cfg_if::cfg_if! {
            if #[cfg(target_arch="wasm32")] {
                let window = web_sys::window().unwrap();
                let js_value = serde_wasm_bindgen::to_value(event).unwrap();
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
                self.emit_event(&event);
                if EVENT_LOOP_PROXY.is_some() {
                    EVENT_LOOP_PROXY
                        .as_ref()
                        .unwrap()
                        .send_event(event)
                        .unwrap();
                }
            }
        }
        Ok(())
    }
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn toggle_axis_lines(&self) {
        unsafe {
            let event = ModelEvent::ToggleAxisLines;
            self.emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
            }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_yaw(&self, amount: f32) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Yaw(amount));
            self.emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
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
            self.emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
            }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn reset_camera(&self) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Reset);
            self.emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
            }
        }
    }

    ///These are user facing axis not internal
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn focus_on_x_axis(&self) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::X);
            self.emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
            }
        }
    }

    ///These are user facing axis not internal
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn focus_on_y_axis(&self) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Y);
            self.emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
            }
        }
    }
    ///These are user facing axis not internal
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn focus_on_z_axis(&self) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Z);
            self.emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
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
            self.emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
            }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_pitch(&self, amount: f32) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Pitch(amount));
            self.emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
            }
        }
    }
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn add_distance(&self, amount: f32) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Distance(amount));
            self.emit_event(&event);
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
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
            EVENT_LOOP_PROXY
                .as_ref()
                .unwrap()
                .send_event(event)
                .unwrap();
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
    #[cfg(target_arch = "wasm32")]
    fn configure_canvas(&self, window: &Window, width: u32, height: u32) {
        // Winit prevents sizing with CSS, so we have to set
        // the size manually when on web.
        use winit::dpi::PhysicalSize;
        window.set_inner_size(PhysicalSize::new(width, height));

        use winit::platform::web::WindowExtWebSys;
        web_sys::window()
            .and_then(|win| win.document())
            .and_then(|doc| {
                let dst = doc.get_element_by_id(WEB_ELEMENT_NAME)?;
                let canvas = web_sys::Element::from(window.canvas());
                canvas.set_attribute("id", "cube_model").ok()?;
                dst.append_child(&canvas).ok()?;
                Some(())
            })
            .expect("Couldn't append canvas to document body.");
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub async fn run(&self, width: u32, height: u32) {
        self.init_logger();

        let el = EventLoopBuilder::<ModelEvent>::with_user_event().build();
        let window = WindowBuilder::new()
            .with_inner_size(winit::dpi::LogicalSize { width, height })
            .build(&el)
            .unwrap();

        cfg_if::cfg_if! {
        if #[cfg(target_arch="wasm32")] {
            self.configure_canvas(&window, width, height);
        }

        }

        let this_window_id = window.id();
        //self.is_running = true;

        let config = self.configuration.clone();
        let cm = self.camera_manager.clone();
        let mut state = State::new(
            window,
            self.configuration.clone(),
            self.data_manager.clone(),
            cm,
        )
        .await;
        let mut x_color_index = self.default_x as isize;
        let mut y_color_index = self.default_y as isize;
        let mut z_color_index = self.default_z as isize;
        let mut min_color_index = self.default_min as isize;
        let mut max_color_index = self.default_min as isize;
        let mut background_color_index = self.default_background as isize;
        let mut shift_pressed = false;
        let mut alt_pressed = false;
        let mut ctrl_pressed = false;
        let color_wheel = self.color_wheel.clone();
        unsafe {
            EVENT_LOOP_PROXY = Some(el.create_proxy());
        }

        el.run(move |event, _, control_flow| {
            match event {
                Event::UserEvent(ModelEvent::Redraw) => {
                    state.update_config();
                    match state.render() {
                        Ok(_) => {}
                        // Reconfigure the surface if lost
                        Err(wgpu::SurfaceError::Lost) => {
                            let size = state.size().clone();
                            state.resize(size)
                        }
                        // The system is out of memory, we should probably quit
                        Err(wgpu::SurfaceError::OutOfMemory) => *control_flow = ControlFlow::Exit,
                        // All other errors (Outdated, Timeout) should be resolved by the next frame
                        Err(e) => eprintln!("{:?}", e),
                    }
                }
                Event::UserEvent(ModelEvent::ToggleAxisLines) => {
                    state.toggle_axis_visibility();
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Pitch(amount))) => {
                    state.move_camera("pitch", amount);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Yaw(amount))) => {
                    state.move_camera("yaw", amount);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Distance(amount))) => {
                    state.move_camera("distance", amount);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Up(amount))) => {
                    state.move_camera("up", amount);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Down(amount))) => {
                    state.move_camera("down", amount);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Left(amount))) => {
                    state.move_camera("left", amount);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Right(amount))) => {
                    state.move_camera("right", amount);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::X)) => {
                    state.move_camera("x_axis", 0.0);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Z)) => {
                    state.move_camera("z_axis", 0.0);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Y)) => {
                    state.move_camera("y_axis", 0.0);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Reset)) => {
                    state.reset_camera_from_client();
                }
                Event::DeviceEvent {
                    device_id: _,
                    event,
                } => {
                    state.input(&event);
                }
                Event::WindowEvent {
                    ref event,
                    window_id,
                } if window_id == this_window_id => {
                    match event {
                        WindowEvent::CloseRequested
                        | WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::Escape),
                                    ..
                                },
                            ..
                        } => *control_flow = ControlFlow::Exit,

                        WindowEvent::ModifiersChanged(modifier_state) => {
                            shift_pressed = modifier_state.shift();
                            alt_pressed = modifier_state.alt();
                            ctrl_pressed = modifier_state.ctrl();
                        }

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::R),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            let modifier = if shift_pressed {
                                if alt_pressed {
                                    0.99
                                } else {
                                    0.9
                                }
                            } else {
                                if alt_pressed {
                                    1.01
                                } else {
                                    1.1
                                }
                            };
                            cf.grid_cylinder_radius = cf.grid_cylinder_radius * modifier;
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }
                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::A),
                                    ..
                                },
                            ..
                        } => {
                            if ctrl_pressed {
                                state.toggle_axis_visibility();
                            } else {
                                let mut cf = config.borrow_mut();
                                let modifier = if shift_pressed {
                                    if alt_pressed {
                                        0.99
                                    } else {
                                        0.9
                                    }
                                } else {
                                    if alt_pressed {
                                        1.01
                                    } else {
                                        1.1
                                    }
                                };
                                cf.grid_cylinder_length = cf.grid_cylinder_length * modifier;
                                unsafe {
                                    let event = ModelEvent::Redraw;
                                    EVENT_LOOP_PROXY
                                        .as_ref()
                                        .unwrap()
                                        .send_event(event)
                                        .unwrap();
                                }
                            }
                        }
                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::C),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            if ctrl_pressed && !shift_pressed && !alt_pressed {
                                state.reset_camera_from_client();
                            } else if alt_pressed && ctrl_pressed && !shift_pressed {
                                state.run_compute_pipeline();
                            } else if !ctrl_pressed {
                                let modifier = if shift_pressed {
                                    if alt_pressed {
                                        0.99
                                    } else {
                                        0.9
                                    }
                                } else {
                                    if alt_pressed {
                                        1.01
                                    } else {
                                        1.1
                                    }
                                };
                                cf.grid_cone_length = cf.grid_cone_length * modifier;
                            }
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }
                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::K),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            let modifier = if shift_pressed {
                                if alt_pressed {
                                    0.99
                                } else {
                                    0.9
                                }
                            } else {
                                if alt_pressed {
                                    1.01
                                } else {
                                    1.1
                                }
                            };
                            cf.grid_cone_radius = cf.grid_cone_radius * modifier;
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::H),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            let modifier = if shift_pressed {
                                if alt_pressed {
                                    0.99
                                } else {
                                    0.9
                                }
                            } else {
                                if alt_pressed {
                                    1.01
                                } else {
                                    1.1
                                }
                            };
                            cf.z_height_ratio = cf.z_height_ratio * modifier;
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::O),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            let modifier = if shift_pressed {
                                if alt_pressed {
                                    0.99
                                } else {
                                    0.9
                                }
                            } else {
                                if alt_pressed {
                                    1.01
                                } else {
                                    1.1
                                }
                            };
                            cf.glyph_offset = cf.glyph_offset * modifier;
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::E),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            let modifier = if shift_pressed {
                                if alt_pressed {
                                    0.99
                                } else {
                                    0.9
                                }
                            } else {
                                if alt_pressed {
                                    1.01
                                } else {
                                    1.1
                                }
                            };
                            cf.min_glyph_height = cf.min_glyph_height * modifier;
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::S),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            let modifier = if shift_pressed {
                                if alt_pressed {
                                    0.99
                                } else {
                                    0.9
                                }
                            } else {
                                if alt_pressed {
                                    1.01
                                } else {
                                    1.1
                                }
                            };
                            cf.glyph_size = cf.glyph_size * modifier;
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::W),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            if shift_pressed {
                                cf.light_color = [255.0, 255.0, 255.0, 1.0];
                            } else {
                                cf.light_color = [255.0, 0.0, 0.0, 1.0];
                            }
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::L),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            let modifier = if shift_pressed {
                                if alt_pressed {
                                    0.99
                                } else {
                                    0.9
                                }
                            } else {
                                if alt_pressed {
                                    1.01
                                } else {
                                    1.1
                                }
                            };
                            cf.light_location = [
                                cf.light_location[0] * modifier,
                                cf.light_location[1] * modifier,
                                cf.light_location[2] * modifier,
                            ];
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::I),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            let modifier = if shift_pressed {
                                if alt_pressed {
                                    0.99
                                } else {
                                    0.9
                                }
                            } else {
                                if alt_pressed {
                                    1.01
                                } else {
                                    1.1
                                }
                            };
                            cf.light_intensity = cf.light_intensity * modifier;
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }
                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::X),
                                    ..
                                },
                            ..
                        } => {
                            if alt_pressed && !ctrl_pressed && !shift_pressed {
                                {
                                    let mut cf = config.borrow_mut();
                                    cf.x_interpolation =
                                        if cf.x_interpolation == InterpolationType::Linear {
                                            InterpolationType::Log
                                        } else {
                                            InterpolationType::Linear
                                        };
                                }
                                state.update_config();
                            } else if alt_pressed && ctrl_pressed && !shift_pressed {
                                {
                                    let mut cf = config.borrow_mut();
                                    cf.x_order = if cf.x_order == Order::Ascending {
                                        Order::Descending
                                    } else {
                                        Order::Ascending
                                    };
                                }
                                state.update_config();
                            } else if ctrl_pressed && !shift_pressed {
                                state.move_camera("x_axis", 0.0);
                            } else if !ctrl_pressed {
                                let mut cf = config.borrow_mut();
                                if shift_pressed {
                                    x_color_index -= 1;
                                } else {
                                    x_color_index += 1;
                                }
                                let x_color = color_wheel.get_color(x_color_index);
                                cf.x_axis_color = x_color;

                                unsafe {
                                    let event = ModelEvent::Redraw;
                                    EVENT_LOOP_PROXY
                                        .as_ref()
                                        .unwrap()
                                        .send_event(event)
                                        .unwrap();
                                }
                            }
                        }
                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::Y),
                                    ..
                                },
                            ..
                        } => {
                            if alt_pressed && !ctrl_pressed && !shift_pressed {
                                {
                                    let mut cf = config.borrow_mut();
                                    cf.y_interpolation =
                                        if cf.y_interpolation == InterpolationType::Linear {
                                            InterpolationType::Log
                                        } else {
                                            InterpolationType::Linear
                                        };
                                }
                                state.update_config();
                            } else if alt_pressed && ctrl_pressed && !shift_pressed {
                                {
                                    let mut cf = config.borrow_mut();
                                    cf.y_order = if cf.y_order == Order::Ascending {
                                        Order::Descending
                                    } else {
                                        Order::Ascending
                                    };
                                }

                                state.update_config();
                            } else if ctrl_pressed && !shift_pressed && !alt_pressed{
                                state.move_camera("y_axis", 0.0);
                            } else if !ctrl_pressed {
                                let mut cf = config.borrow_mut();
                                if shift_pressed {
                                    y_color_index -= 1;
                                } else {
                                    y_color_index += 1;
                                }
                                let y_color = color_wheel.get_color(y_color_index);
                                cf.y_axis_color = y_color;
                                unsafe {
                                    let event = ModelEvent::Redraw;
                                    EVENT_LOOP_PROXY
                                        .as_ref()
                                        .unwrap()
                                        .send_event(event)
                                        .unwrap();
                                }
                            }
                        }
                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::Z),
                                    ..
                                },
                            ..
                        } => {
                            if alt_pressed && !ctrl_pressed && !shift_pressed {
                                {
                                    let mut cf = config.borrow_mut();
                                    cf.z_interpolation =
                                        if cf.z_interpolation == InterpolationType::Linear {
                                            InterpolationType::Log
                                        } else {
                                            InterpolationType::Linear
                                        };
                                }
                                state.update_config();
                            } else if alt_pressed && ctrl_pressed && !shift_pressed {
                                {
                                    let mut cf = config.borrow_mut();
                                    cf.z_order = if cf.z_order == Order::Ascending {
                                        Order::Descending
                                    } else {
                                        Order::Ascending
                                    };
                                }
                                state.update_config();
                            } else if ctrl_pressed && !shift_pressed && !alt_pressed {
                                state.move_camera("z_axis", 0.0);
                            } else if !ctrl_pressed {
                                let mut cf = config.borrow_mut();
                                if shift_pressed {
                                    z_color_index -= 1;
                                } else {
                                    z_color_index += 1;
                                }
                                let z_color = color_wheel.get_color(z_color_index);
                                cf.z_axis_color = z_color;
                                unsafe {
                                    let event = ModelEvent::Redraw;
                                    EVENT_LOOP_PROXY
                                        .as_ref()
                                        .unwrap()
                                        .send_event(event)
                                        .unwrap();
                                }
                            }
                        }

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::M),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            if shift_pressed {
                                max_color_index -= 1;
                            } else {
                                max_color_index += 1;
                            }
                            let color = color_wheel.get_color(max_color_index);
                            cf.max_color = color;
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::N),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            if shift_pressed {
                                min_color_index -= 1;
                            } else {
                                min_color_index += 1;
                            }
                            let color = color_wheel.get_color(min_color_index);
                            cf.min_color = color;
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::B),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            if shift_pressed {
                                background_color_index -= 1;
                            } else {
                                background_color_index += 1;
                            }
                            let color = color_wheel.get_color(background_color_index);
                            cf.background_color = color;
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::G),
                                    ..
                                },
                            ..
                        } => {
                            let mut cf = config.borrow_mut();
                            let modifier = if shift_pressed {
                                if alt_pressed {
                                    0.99
                                } else {
                                    0.9
                                }
                            } else {
                                if alt_pressed {
                                    1.01
                                } else {
                                    1.1
                                }
                            };
                            cf.model_origin = [
                                cf.model_origin[0] * modifier,
                                cf.model_origin[1] * modifier,
                                cf.model_origin[2] * modifier,
                            ];
                            unsafe {
                                let event = ModelEvent::Redraw;
                                EVENT_LOOP_PROXY
                                    .as_ref()
                                    .unwrap()
                                    .send_event(event)
                                    .unwrap();
                            }
                        }

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::Up),
                                    ..
                                },
                            ..
                        } => unsafe {
                            let event = ModelEvent::ModelMove(ModelMoveDirection::Up(1.0));
                            EVENT_LOOP_PROXY
                                .as_ref()
                                .unwrap()
                                .send_event(event)
                                .unwrap();
                        },

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::Down),
                                    ..
                                },
                            ..
                        } => unsafe {
                            let event = ModelEvent::ModelMove(ModelMoveDirection::Down(1.0));
                            EVENT_LOOP_PROXY
                                .as_ref()
                                .unwrap()
                                .send_event(event)
                                .unwrap();
                        },

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::Left),
                                    ..
                                },
                            ..
                        } => unsafe {
                            let event = ModelEvent::ModelMove(ModelMoveDirection::Left(1.0));
                            EVENT_LOOP_PROXY
                                .as_ref()
                                .unwrap()
                                .send_event(event)
                                .unwrap();
                        },

                        WindowEvent::KeyboardInput {
                            input:
                                KeyboardInput {
                                    state: ElementState::Pressed,
                                    virtual_keycode: Some(VirtualKeyCode::Right),
                                    ..
                                },
                            ..
                        } => unsafe {
                            let event = ModelEvent::ModelMove(ModelMoveDirection::Right(1.0));
                            EVENT_LOOP_PROXY
                                .as_ref()
                                .unwrap()
                                .send_event(event)
                                .unwrap();
                        },
                        WindowEvent::Resized(physical_size) => {
                            state.resize(*physical_size);
                        }

                        WindowEvent::ScaleFactorChanged { new_inner_size, .. } => {
                            // new_inner_size is &&mut so we have to dereference it twice
                            state.resize(**new_inner_size);
                        }
                        _ => {}
                    }
                }
                Event::RedrawRequested(window_id) if window_id == state.window().id() => {
                    state.update_from_client();
                    match state.render() {
                        Ok(_) => {}
                        // Reconfigure the surface if lost
                        Err(wgpu::SurfaceError::Lost) => {
                            let size = state.size().clone();
                            state.resize(size)
                        }
                        // The system is out of memory, we should probably quit
                        Err(wgpu::SurfaceError::OutOfMemory) => *control_flow = ControlFlow::Exit,
                        // All other errors (Outdated, Timeout) should be resolved by the next frame
                        Err(e) => eprintln!("{:?}", e),
                    }
                }
                Event::MainEventsCleared => {
                    // RedrawRequested will only trigger once, unless we manually
                    // request it.
                    state.window().request_redraw();
                }

                _ => {}
            }
        });
    }
}

mod assets;
mod camera;
mod light;
mod model;
mod model_event;

use model::model_configuration::ModelConfiguration;
use model::state::State;
use model_event::{ModelEvent, ModelMoveDirection};
use std::rc::Rc;
use winit::event::*;
use winit::event_loop::{ControlFlow, EventLoopBuilder, EventLoopProxy};
use winit::window::WindowBuilder;

cfg_if::cfg_if! {
    if #[cfg(target_arch="wasm32")] {
        use wasm_bindgen::prelude::*;
        use winit::window::Window;

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
pub struct ModelRunner {}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl ModelRunner {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    pub fn new() -> Self {
        ModelRunner {}
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
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn move_left(&self, amount: f32) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Left(amount));
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
    pub fn move_right(&self, amount: f32) {
        unsafe {
            let event = ModelEvent::ModelMove(ModelMoveDirection::Right(amount));
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
    pub fn move_forward(&self, amount: f32) {
        unsafe {
            if EVENT_LOOP_PROXY.is_some() {
                let event = ModelEvent::ModelMove(ModelMoveDirection::Forward(amount));
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
        }
    }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn move_back(&self, amount: f32) {
        unsafe {
            if EVENT_LOOP_PROXY.is_some() {
                let event = ModelEvent::ModelMove(ModelMoveDirection::Backward(amount));
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
            }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn move_up(&self, amount: f32) {
        unsafe {
            if EVENT_LOOP_PROXY.is_some() {
                let event = ModelEvent::ModelMove(ModelMoveDirection::Up(amount));
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
            }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn move_down(&self, amount: f32) {
        unsafe {
            if EVENT_LOOP_PROXY.is_some() {
                let event = ModelEvent::ModelMove(ModelMoveDirection::Down(amount));
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(event)
                    .unwrap();
            }
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
    fn configure_canvas(&self, window: &Window) {
        // Winit prevents sizing with CSS, so we have to set
        // the size manually when on web.
        use winit::dpi::PhysicalSize;
        window.set_inner_size(PhysicalSize::new(1500, 1000));

        use winit::platform::web::WindowExtWebSys;
        web_sys::window()
            .and_then(|win| win.document())
            .and_then(|doc| {
                let dst = doc.get_element_by_id(WEB_ELEMENT_NAME)?;
                let canvas = web_sys::Element::from(window.canvas());
                dst.append_child(&canvas).ok()?;
                Some(())
            })
            .expect("Couldn't append canvas to document body.");
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub async fn run(&self) {
        self.init_logger();

        let el = EventLoopBuilder::<ModelEvent>::with_user_event().build();
        let window = WindowBuilder::new()
            .with_inner_size(winit::dpi::LogicalSize {
                width: 1500,
                height: 1000,
            })
            .build(&el)
            .unwrap();

        cfg_if::cfg_if! {
        if #[cfg(target_arch="wasm32")] {
            self.configure_canvas(&window);
        }

        }

        let this_window_id = window.id();
        let model_config = Rc::new(ModelConfiguration {
            max_color: [255.0, 0.0, 0.0, 1.0],
            min_color: [0.0, 255.0, 255.0, 1.0],
            background_color: [13.0, 19.0, 33.0, 1.0],
            x_axis_color: [255.0, 0.0, 0.0, 1.0],
            y_axis_color: [0.0, 255.0, 0.0, 1.0],
            z_axis_color: [0.0, 0.0, 255.0, 1.0],
            grid_cylinder_length: 10.80,
            grid_cylinder_radius: 0.05,
            grid_cone_length: 0.2,
            grid_cone_radius: 0.10,
            z_height_ratio: 1.0,
            glyph_offset: 0.15,
            min_glyph_height: 0.2,
            light_color: [255.0, 255.0, 255.0, 1.0],
            light_location: [-30.0, -30.0, -30.0],
            light_intensity: 0.02,
            glyph_size: 0.15,
            model_origin: [-5.0, -5.0, -5.0],
        });
        let mut state = State::new(window, model_config.clone()).await;
        unsafe {
            EVENT_LOOP_PROXY = Some(el.create_proxy());
        }
        el.run(move |event, _, control_flow| {
            match event {
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Left(amount))) => {
                    state.move_camera("left", amount);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Right(amount))) => {
                    state.move_camera("right", amount);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Forward(amount))) => {
                    state.move_camera("forward", amount);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Backward(amount))) => {
                    state.move_camera("backward", amount);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Up(amount))) => {
                    state.move_camera("up", amount);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Down(amount))) => {
                    state.move_camera("down", amount);
                }
                Event::DeviceEvent { device_id, event } => {
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
                    state.update();
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

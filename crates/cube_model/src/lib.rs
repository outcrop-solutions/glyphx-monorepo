mod assets;
mod camera;
mod model;

use model::state::State;
use winit::event::*;
use winit::event_loop::{ControlFlow, EventLoop, EventLoopBuilder, EventLoopProxy};
use winit::window::{Window, WindowBuilder};

#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

cfg_if::cfg_if! {
        if #[cfg(target_arch="wasm32")] {
#[wasm_bindgen]
extern "C" {
 #[wasm_bindgen(js_namespace = console)]
 pub fn log(s: &str);
}
}
}

const WEB_ELEMENT_NAME: &str = "glyphx-cube-model";
static mut EVENT_LOOP_PROXY: Option<EventLoopProxy<ModelEvent>> = None;

#[derive(Debug, Clone)]
pub enum ModelMoveDirection {
    Left(bool),
    Right(bool),
    Forward(bool),
    Backward(bool),
}

#[derive(Debug, Clone)]
pub enum ModelEvent {
    ModelMove(ModelMoveDirection),
}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
pub struct ModelRunner {}

#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
impl ModelRunner {
    #[cfg_attr(target_arch = "wasm32", wasm_bindgen(constructor))]
    pub fn new() -> Self {
        ModelRunner {}
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn move_left(&self) {
        unsafe {
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(ModelEvent::ModelMove(ModelMoveDirection::Left(true)))
                    .unwrap();
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(ModelEvent::ModelMove(ModelMoveDirection::Left(false)))
                    .unwrap();
            }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn move_right(&self) {
        unsafe {
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(ModelEvent::ModelMove(ModelMoveDirection::Right(true)))
                    .unwrap();
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(ModelEvent::ModelMove(ModelMoveDirection::Right(false)))
                    .unwrap();
            }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn move_forward(&self) {
        unsafe {
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(ModelEvent::ModelMove(ModelMoveDirection::Forward(true)))
                    .unwrap();
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(ModelEvent::ModelMove(ModelMoveDirection::Forward(false)))
                    .unwrap();
            }
        }
    }

    #[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
    pub fn move_back(&self) {
        unsafe {
            if EVENT_LOOP_PROXY.is_some() {
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(ModelEvent::ModelMove(ModelMoveDirection::Backward(true)))
                    .unwrap();
                EVENT_LOOP_PROXY
                    .as_ref()
                    .unwrap()
                    .send_event(ModelEvent::ModelMove(ModelMoveDirection::Backward(false)))
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
        window.set_inner_size(PhysicalSize::new(450, 400));

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
        let window = WindowBuilder::new().build(&el).unwrap();

        cfg_if::cfg_if! {
        if #[cfg(target_arch="wasm32")] {
            self.configure_canvas(&window);
        }

        }

        let this_window_id = window.id();
        let mut state = State::new(window).await;
        unsafe {
            EVENT_LOOP_PROXY = Some(el.create_proxy());
        }
        el.run(move |event, _, control_flow| {
            match event {
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Left(value))) => {
                    state.move_camera("left", value);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Right(value))) => {
                    state.move_camera("right", value);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Forward(value))) => {
                    state.move_camera("forward", value);
                }
                Event::UserEvent(ModelEvent::ModelMove(ModelMoveDirection::Backward(value))) => {
                    state.move_camera("backward", value);
                }
                Event::WindowEvent {
                    ref event,
                    window_id,
                } if window_id == this_window_id => {
                    if !state.input(event) {
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

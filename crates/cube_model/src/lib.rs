use winit::event::*;
use winit::event_loop::{ControlFlow, EventLoop};
use winit::window::{WindowBuilder, Window};

#[cfg(target_arch="wasm32")]
use wasm_bindgen::prelude::*;

    
const WEB_ELEMENT_NAME: &str = "glyphx-cube-model";


fn init_logger() {
  cfg_if::cfg_if! {
  if #[cfg(target_arch = "wasm32")] {
        std::panic::set_hook(Box::new(console_error_panic_hook::hook));
        console_log::init_with_level(log::Level::Warn).expect("Couldn't initialize logger");
    } else {
        env_logger::init();
    }
  }
}

#[cfg(target_arch="wasm32")] 
fn configure_canvas( window: &Window) {
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


#[cfg_attr(target_arch="wasm32", wasm_bindgen(start))]
pub fn run() {
    init_logger();
    let event_loop = EventLoop::new();
    let window = WindowBuilder::new().build(&event_loop).unwrap();

    cfg_if::cfg_if! {
    if #[cfg(target_arch="wasm32")] {
        configure_canvas(&window);
    } 

    }

    event_loop.run(move |event, _, control_flow| match event {
        Event::WindowEvent {
            ref event,
            window_id,
        } if window_id == window.id() => match event {
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
            _ => {}
        },
        _ => {}
    });
}


